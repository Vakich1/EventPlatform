using EventPlatform.Domain.Common;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;

namespace EventPlatform.Domain.Entities;

public class Event : BaseEntity
{
    public string Title { get; private set; } =  string.Empty;
    public string Description { get; private set; } =  string.Empty;
    public string Location { get; private set; } =  string.Empty;
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public EventStatus Status { get; private set; } = EventStatus.Draft;
    public string? ImageUrl { get; private set; }
    
    public Guid OrganizerId { get; private set; }
    public User Organizer { get; private set; } = null!;

    private readonly List<TicketType> _ticketTypes = [];
    public IReadOnlyCollection<TicketType>  TicketTypes => _ticketTypes.AsReadOnly();
    
    private Event() {}

    public static Event Create(string title, string description, string location, 
        DateTime startDate, DateTime endDate, Guid organizerId)
    {
        if (string.IsNullOrEmpty(title))
            throw new DomainException("Event title cannot be empty.");

        if (startDate >= endDate)
            throw new DomainException("Start date must be before end date.");

        if (startDate <= DateTime.UtcNow)
            throw new DomainException("Event cannot start in the past.");

        return new Event
        {
            Title = title.Trim(),
            Description = description.Trim(),
            Location = location.Trim(),
            StartDate = startDate,
            EndDate = endDate,
            OrganizerId = organizerId
        };
    }

    public void Update(string title, string description, string location, DateTime startDate, DateTime endDate)
    {
        if (Status == EventStatus.Cancelled)
            throw new DomainException("Cannot update a cancelled event.");
        
        if (startDate >= endDate)
            throw new DomainException("Start date must be before end date.");
        
        Title = title.Trim();
        Description = description.Trim();
        Location = location.Trim();
        StartDate = startDate;
        EndDate = endDate;
        SetUpdatedAt();
    }

    public void Publish()
    {
        if (Status != EventStatus.Draft)
            throw new DomainException("Only draft events can be published.");
        
        if (!_ticketTypes.Any())
            throw new DomainException("Event must have at least one ticket type before publishing.");
        
        Status = EventStatus.Published;
        SetUpdatedAt();
    }

    public void Cancel()
    {
        if (Status == EventStatus.Cancelled)
            throw new DomainException("Event is already cancelled.");
        
        Status = EventStatus.Cancelled;
        SetUpdatedAt();
    }
    
    public void AddTicketType(TicketType  ticketType) => _ticketTypes.Add(ticketType);
    
    public bool IsPublished => Status == EventStatus.Published;
}