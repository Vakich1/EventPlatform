using System.Security.Claims;
using EventPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace EventPlatform.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (claim is null)
                throw new UnauthorizedAccessException("User is not authenticated.");
            
            return Guid.Parse(claim);
        }
    }
    
    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    
    public bool IsAdmin => _httpContextAccessor.HttpContext?.User.IsInRole("Admin") ?? false;
    
    public bool IsOrganizer => _httpContextAccessor.HttpContext?.User.IsInRole("Organizer") ?? false;
}