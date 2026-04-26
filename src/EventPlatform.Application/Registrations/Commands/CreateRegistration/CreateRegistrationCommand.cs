using MediatR;

namespace EventPlatform.Application.Registrations.Commands.CreateRegistration;

public record CreateRegistrationCommand(
    Guid EventId,
    Guid TicketTypeId) : IRequest<Guid>;