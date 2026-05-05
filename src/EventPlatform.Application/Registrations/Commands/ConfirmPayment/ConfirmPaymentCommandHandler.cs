using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace EventPlatform.Application.Registrations.Commands.ConfirmPayment;

public class ConfirmPaymentCommandHandler : IRequestHandler<ConfirmPaymentCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IQrCodeService _qrCodeService;

    public ConfirmPaymentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService, IQrCodeService qrCodeService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _qrCodeService = qrCodeService;
    }

    public async Task Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        var paymentIntentId = request.ClientSecret.Split(new[] { "_secret_" }, StringSplitOptions.None)[0];
        
        var payment = await _context.Payments
            .Include(p => p.Registration)
            .ThenInclude(r => r.User)
            .Include(p => p.Registration)
            .ThenInclude(r => r.Event)
            .Include(p => p.Registration)
            .ThenInclude(r => r.TicketType)
            .FirstOrDefaultAsync(p => p.StripePaymentId == paymentIntentId,  cancellationToken);

        if (payment is null)
            throw new DomainException("Payment not found.");
        
        var service = new PaymentIntentService();
        var options = new PaymentIntentConfirmOptions
        {
            PaymentMethod = "pm_card_visa",
        };
        await service.ConfirmAsync(paymentIntentId, options, cancellationToken: cancellationToken);
    }
}