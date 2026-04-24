using MediatR;

namespace EventPlatform.Application.Events.Commands.AddTicketType;

public record AddTicketTypeCommand(
    Guid EventId,
    string Name,
    decimal Price,
    int TotalQuantity) : IRequest<Guid>;