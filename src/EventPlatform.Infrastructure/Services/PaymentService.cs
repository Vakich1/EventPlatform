using EventPlatform.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace EventPlatform.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;

    public PaymentService(IConfiguration configuration)
    {
        _configuration = configuration;
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
}