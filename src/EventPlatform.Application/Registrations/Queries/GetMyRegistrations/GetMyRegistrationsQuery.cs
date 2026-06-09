using EventPlatform.Application.Common.Models;
using MediatR;

namespace EventPlatform.Application.Registrations.Queries.GetMyRegistrations;

public record GetMyRegistrationsQuery(int Page = 1, int PageSize = 10) :  IRequest<PagedResult<MyRegistrationDto>>;