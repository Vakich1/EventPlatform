using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Registrations.Commands.CreatePaymentIntent;

public class CreatePaymentIntentCommandHandler : IRequestHandler<CreatePaymentIntentCommand, CreatePaymentIntentResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPaymentService _paymentService;

    public CreatePaymentIntentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService, IPaymentService paymentService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _paymentService = paymentService;
    }

    public async Task<CreatePaymentIntentResult> Handle(CreatePaymentIntentCommand request,
        CancellationToken cancellationToken)
    {
        var @event = await _context.Events
            .Include(e => e.TicketTypes)
            .FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);
        
        if (@event is null)
            throw new DomainException("Event not found.");
        
        if (!@event.IsPublished)
            throw new DomainException("Registration is only available for published events.");

        var ticketType = await _context.TicketTypes
            .FirstOrDefaultAsync(tt => tt.Id == request.TicketTypeId, cancellationToken);

        if (ticketType is null)
            throw new DomainException("Ticket type not found.");

        if (ticketType.IsFree)
            throw new DomainException("This ticket type is free. Use the regular registration endpoint.");

        if (ticketType.AvailableQuantity <= 0)
            throw new DomainException("No tickets available for this ticket type.");

        var alreadyRegistered = await _context.Registrations
            .AnyAsync(r => r.UserId == _currentUserService.UserId && r.TicketTypeId == request.TicketTypeId,
                cancellationToken);

        if (alreadyRegistered)
            throw new DomainException("You are already registered for this ticket type.");

        var registration = Registration.Create(
            _currentUserService.UserId,
            request.EventId,
            request.TicketTypeId);

        var payment = Payment.Create(registration.Id, ticketType.Price);

        var clientSecret = await _paymentService.CreatePaymentIntentAsync(
            ticketType.Price,
            payment.Currency,
            registration.Id);
        
        payment.SetStripeIntentId(clientSecret.Split(new[] {"_secret_"}, StringSplitOptions.None)[0]);
        
        _context.Registrations.Add(registration);
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync(cancellationToken);
        
        return new CreatePaymentIntentResult(clientSecret, ticketType.Price,  payment.Currency);
    }
}

