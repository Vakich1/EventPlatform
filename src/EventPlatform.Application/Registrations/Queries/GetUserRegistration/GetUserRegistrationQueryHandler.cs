using EventPlatform.Application.Common.Interfaces;
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
            .FirstOrDefaultAsync(r =>
                    r.EventId == request.EventId &&
                    r.UserId == _currentUserService.UserId,
                    cancellationToken);
        
        if (registration is null)
            return null;

        return new UserRegistrationDto(
            registration.Id,
            registration.TicketTypeId,
            registration.TicketType.Name);
    }
}