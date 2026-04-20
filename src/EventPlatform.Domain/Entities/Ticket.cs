using EventPlatform.Domain.Common;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;

namespace EventPlatform.Domain.Entities;

public class Ticket : BaseEntity
{
    public string QrCode {get; private set;} = string.Empty;
    public TicketStatus Status {get; private set;} =  TicketStatus.Active;
    
    public Guid RegistrationId {get; private set;}
    public Registration Registration { get; private set; } = null!;
    
    private Ticket() { }

    public static Ticket Create(Guid registrationId, string qrCode)
    {
        return new Ticket
        {
            RegistrationId = registrationId,
            QrCode = qrCode,
        };
    }
    
    public void MarkAsUsed()
    {
        if (Status == TicketStatus.Used)
            throw new DomainException("Ticket has already been used.");
        
        if (Status == TicketStatus.Cancelled)
            throw new DomainException("Ticket has already been cancelled.");
        
        Status = TicketStatus.Used;
        SetUpdatedAt();
    }

    public void Cancel()
    {
        if (Status == TicketStatus.Used)
            throw new DomainException("Cannot cancel a used ticket.");
        
        Status = TicketStatus.Cancelled;
        SetUpdatedAt();
    }
}