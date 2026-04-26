using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Registrations.Commands.CreateRegistration;

public class CreateRegistrationCommandHandler : IRequestHandler<CreateRegistrationCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IQrCodeService _qrCodeService;
    private readonly IEmailService _emailService;

    public CreateRegistrationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IQrCodeService qrCodeService,
        IEmailService emailService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _qrCodeService = qrCodeService;
        _emailService = emailService;
    }

    public async Task<Guid> Handle(CreateRegistrationCommand request, CancellationToken cancellationToken)
    {
        var @event = await _context.Events
            .Include(e => e.TicketTypes)
            .FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);
            
        if (@event is null)
            throw new DomainException("Event not found");

        if (!@event.IsPublished)
            throw new DomainException("Registration is only available for published events.");
        
        var ticketType = @event.TicketTypes
            .FirstOrDefault(tt => tt.Id == request.TicketTypeId);
        
        if (ticketType is null)
            throw new DomainException("Ticket type not found");

        if (ticketType.AvailableQuantity <= 0)
            throw new DomainException("No tickets available for this ticket type.");
        
        if (!ticketType.IsFree)
            throw new DomainException("This ticket type requires payment. Use the payment endpoint.");

        var alreadyRegistered = await _context.Registrations
            .AnyAsync(r => r.UserId == _currentUserService.UserId && r.TicketTypeId == request.TicketTypeId,
                cancellationToken);

        if (alreadyRegistered)
            throw new DomainException("You are already registered for this ticket type.");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId, cancellationToken);
        
        if (user is null)
            throw new DomainException("User not found");

        var registration = Registration.Create(
            _currentUserService.UserId,
            request.EventId,
            request.TicketTypeId);

        _context.Registrations.Add(registration);
        
        ticketType.IncrementSold();

        var qrCode = _qrCodeService.Generate(registration.Id.ToString());
        var ticket = Ticket.Create(registration.Id, qrCode);
        _context.Tickets.Add(ticket);

        await _context.SaveChangesAsync(cancellationToken);

        await _emailService.SendTicketConfirmationAsync(
            user.Email,
            user.FullName,
            @event.Title,
            @event.StartDate,
            qrCode,
            cancellationToken);
        
        return registration.Id;
    }
}