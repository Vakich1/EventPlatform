namespace EventPlatform.Application.Registrations.Queries.GetUserRegistration;

public record UserRegistrationDto(
    Guid RegistrationId,
    Guid TicketTypeId,
    string TicketTypeName,
    string TicketStatus);