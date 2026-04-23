
namespace EventPlatform.Application.Events.Queries.GetEventById;

public record EventDetailDto(
    Guid Id,
    string Title,
    string Description,
    string Location,
    DateTime StartDate,
    DateTime EndDate,
    string Status,
    string OrganizerName,
    DateTime CreatedAt,
    IReadOnlyCollection<TicketTypeDto>  TicketTypes);
    
public record  TicketTypeDto(
        Guid Id, 
        string Name,
        decimal Price,
        bool IsFree,
        int TotalQuantity,
        int AvailableQuantity);