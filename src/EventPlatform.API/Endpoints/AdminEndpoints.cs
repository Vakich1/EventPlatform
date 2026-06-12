using EventPlatform.Application.Admin.Queries.GetAllUsers;
using EventPlatform.Application.Admin.Commands.BlockUser;
using EventPlatform.Application.Admin.Commands.UnblockUser;
using EventPlatform.Application.Admin.Queries.GetStats;
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
        
        group.MapPost("/users/{userId:guid}/block", async (
                Guid userId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await sender.Send(new BlockUserCommand(userId), cancellationToken);
                return Results.NoContent();
            })
            .WithName("BlockUser")
            .WithSummary("Block user (Admin only)");

        group.MapPost("/users/{userId:guid}/unblock", async (
                Guid userId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await sender.Send(new UnblockUserCommand(userId), cancellationToken);
                return Results.NoContent();
            })
            .WithName("UnblockUser")
            .WithSummary("Unblock user (Admin only)");
        
        group.MapGet("/stats", async (
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetStatsQuery(), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetStats")
            .WithSummary("Get platform statistics (Admin only)");
    }
}