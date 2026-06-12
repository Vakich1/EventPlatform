using EventPlatform.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace EventPlatform.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;
    private readonly IApplicationDbContext _context;
    private readonly IQrCodeService _qrCodeService;
    private readonly IEmailService _emailService;

    public PaymentService(
        IConfiguration configuration,
        IApplicationDbContext context,
        IQrCodeService qrCodeService,
        IEmailService emailService)
    {
        _configuration = configuration;
        _context = context;
        _qrCodeService = qrCodeService;
        _emailService = emailService;
    }

    public async Task<string> CreatePaymentIntentAsync(decimal amount, string currency, Guid registrationId)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100),
            Currency = currency,
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
              Enabled = true,
              AllowRedirects = "never"
            },
            Metadata = new Dictionary<string, string>
            {
                { "registrationId", registrationId.ToString() }
            }
        };
        
        var service = new PaymentIntentService();
        var paymentIntent = await service.CreateAsync(options);
        
        return paymentIntent.ClientSecret;
    }

    public async Task<bool> ValidateWebhookSignature(string payload, string signature)
    {
        try
        {
            var webhookSecret = _configuration["StripeSettings:WebhookSecret"]!;
            EventUtility.ConstructEvent(payload, signature, webhookSecret);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<Guid> GetRegistrationIdFromPaymentIntent(string paymentIntentId)
    {
        var service = new PaymentIntentService();
        var paymentIntent = await service.GetAsync(paymentIntentId);

        var registrationId = paymentIntent.Metadata["registrationId"];
        return Guid.Parse(registrationId);
    }

    public async Task ProcessSuccessfulPaymentAsync(string paymentIntentId, CancellationToken cancellationToken = default)
    {
        var registrationId = await GetRegistrationIdFromPaymentIntent(paymentIntentId);

        var registration = await _context.Registrations
            .Include(r => r.User)
            .Include(r => r.Event)
            .Include(r => r.TicketType)
            .Include(r => r.Payment)
            .FirstOrDefaultAsync(r => r.Id == registrationId, cancellationToken);

        if (registration is null || registration.Payment is null)
            return;

        registration.Payment.MarkAsSucceeded();
        registration.Payment.SetStripeIntentId(paymentIntentId);

        var affectedRows = await _context.IncrementSoldQuantityAsync(registration.TicketTypeId, cancellationToken);
        if (affectedRows == 0)
            return;

        var qrCode = _qrCodeService.Generate(registration.Id.ToString());
        var ticket = Domain.Entities.Ticket.Create(registration.Id, qrCode);
        _context.Tickets.Add(ticket);

        await _context.SaveChangesAsync(cancellationToken);

        try
        {
            await _emailService.SendTicketConfirmationAsync(
                registration.User.Email,
                registration.User.FullName,
                registration.Event.Title,
                registration.Event.StartDate,
                qrCode,
                cancellationToken);
        }
        catch
        {
            // Email failure should not break payment processing
        }
    }
}