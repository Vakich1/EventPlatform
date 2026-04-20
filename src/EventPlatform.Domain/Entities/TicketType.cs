using EventPlatform.Domain.Common;
using EventPlatform.Domain.Exceptions;

namespace EventPlatform.Domain.Entities;

public class TicketType : BaseEntity
{
    public string Name { get; private set; } =  string.Empty;
    public decimal Price { get; private set; }
    public int TotalQuantity { get; private set; }
    public int SoldQuantity { get; private set; }
    public bool IsFree => Price == 0;
    public int AvailableQuantity => TotalQuantity - SoldQuantity;
    
    public Guid EventId { get; private set; }
    public Event Event { get; private set; } = null!;
    
    private TicketType() { }

    public static TicketType Create(string name, decimal price, int totalQuantity, Guid eventId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Ticket type name cannot be empty.");

        if (price < 0)
            throw new DomainException("Price cannot be negative.");

        if (totalQuantity < 0)
            throw new DomainException("Total quantity must be greater than zero.");

        return new TicketType
        {
            Name = name.Trim(),
            Price = price,
            TotalQuantity = totalQuantity,
            EventId = eventId
        };
    }
    
    public void IncrementSold()
    {
        if (SoldQuantity >= TotalQuantity)
            throw new DomainException("No tickets available.");
        
        SoldQuantity++;
        SetUpdatedAt();
    }

    public void DecrementSold()
    {
        if (SoldQuantity <= 0)
            throw new DomainException("Sold quantity cannot be less than zero.");
        
        SoldQuantity--;
        SetUpdatedAt();
    }
}