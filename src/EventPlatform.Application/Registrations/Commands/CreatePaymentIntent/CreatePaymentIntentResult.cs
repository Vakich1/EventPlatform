namespace EventPlatform.Application.Registrations.Commands.CreatePaymentIntent;

public record CreatePaymentIntentResult(
    string ClientSecret,
    decimal Amount,
    string Currency);