using MediatR;

namespace EventPlatform.Application.Registrations.Commands.CreatePaymentIntent;

public record CreatePaymentIntentCommand(
    Guid EventId,
    Guid TicketTypeId) : IRequest<CreatePaymentIntentResult>;