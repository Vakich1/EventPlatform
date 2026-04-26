namespace EventPlatform.Application.Common.Interfaces;

public interface IPaymentService
{
    Task<string> CreatePaymentIntentAsync(decimal amount, string currency, Guid registrationId);
    Task<bool> ValidateWebhookSignature(string payload, string signature);
    Task<Guid> GetRegistrationIdFromPaymentIntent(string paymentIntentId);
}