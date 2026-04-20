using EventPlatform.Domain.Common;

namespace EventPlatform.Domain.Entities;

public class Registration : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    
    public Guid EventId { get; private set; }
    public Event Event { get; private set; } = null!;
    
    public Guid TicketTypeId {get; private set;}
    public TicketType TicketType { get; private set; } = null!;

    public Ticket Ticket { get; private set; } = null!;
    public Payment? Payment { get; private set; }
    
    private Registration() { }

    public static Registration Create(Guid userId, Guid eventId, Guid ticketTypeId)
    {
        return new Registration
        {
            UserId = userId,
            EventId = eventId,
            TicketTypeId = ticketTypeId,
        };
    }
}