using EventPlatform.Application.Admin.Queries.GetAllUsers;
using MediatR;

namespace EventPlatform.API.Endpoints;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin")
            .WithTags("Admin")
            .RequireAuthorization();

        group.MapGet("/users", async (
                ISender sender,
                CancellationToken cancellationToken,
                string? searchTerm = null,
                int page = 1,
                int pageSize = 20) =>
            {
                var result = await sender.Send(
                    new GetAllUsersQuery(searchTerm, page, pageSize),
                    cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetAllUsers")
            .WithSummary("Get all users (Admin only)");
    }
}