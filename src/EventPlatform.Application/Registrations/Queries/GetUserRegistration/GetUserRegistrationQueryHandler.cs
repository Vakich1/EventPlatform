using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Registrations.Queries.GetUserRegistration;

public class GetUserRegistrationQueryHandler : IRequestHandler<GetUserRegistrationQuery, UserRegistrationDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    
    public GetUserRegistrationQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<UserRegistrationDto?> Handle(GetUserRegistrationQuery request,
        CancellationToken cancellationToken)
    {
        var registration = await _context.Registrations
            .Include(r => r.TicketType)
            .Include(r => r.Ticket)
            .FirstOrDefaultAsync(r =>
                    r.EventId == request.EventId &&
                    r.UserId == _currentUserService.UserId &&
                    r.Ticket != null &&
                    r.Ticket.Status != TicketStatus.Cancelled,
                    cancellationToken);
        
        if (registration is null)
            return null;

        return new UserRegistrationDto(
            registration.Id,
            registration.TicketTypeId,
            registration.TicketType.Name,
            registration.Ticket?.Status.ToString() ?? "No Ticket");
    }
}