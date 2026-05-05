using MediatR;

namespace EventPlatform.Application.Registrations.Commands.ConfirmPayment;

public record ConfirmPaymentCommand(string ClientSecret) : IRequest;