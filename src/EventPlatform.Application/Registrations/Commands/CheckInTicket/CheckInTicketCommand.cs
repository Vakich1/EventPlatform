using MediatR;

namespace EventPlatform.Application.Registrations.Commands.CheckInTicket;

public record CheckInTicketCommand(string QrCode) : IRequest<CheckInResultDto>;