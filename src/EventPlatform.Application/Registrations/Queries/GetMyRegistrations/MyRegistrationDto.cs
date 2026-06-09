namespace EventPlatform.Application.Registrations.Queries.GetMyRegistrations;

public record MyRegistrationDto(
    Guid RegistrationId,
    Guid EventId,
    string EventTitle,
    string EventLocation,
    DateTime EventStartDate,
    string EventStatus,
    string TicketTypeName,
    decimal TicketPrice,
    bool IsFree,
    string TicketStatus);