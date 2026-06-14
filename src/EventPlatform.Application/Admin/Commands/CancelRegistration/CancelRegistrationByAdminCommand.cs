using MediatR;

namespace EventPlatform.Application.Admin.Commands.CancelRegistration;

public record CancelRegistrationByAdminCommand(Guid RegistrationId) : IRequest;
