using EventPlatform.Application.Admin.Queries.GetAllUsers;
using EventPlatform.Application.Admin.Commands.ApproveOrganizer;
using EventPlatform.Application.Admin.Commands.BlockUser;
using EventPlatform.Application.Admin.Commands.CancelEventByAdmin;
using EventPlatform.Application.Admin.Commands.CancelRegistration;
using EventPlatform.Application.Admin.Commands.RejectOrganizer;
using EventPlatform.Application.Admin.Commands.UnblockUser;
using EventPlatform.Application.Admin.Queries.GetAllEvents;
using EventPlatform.Application.Admin.Queries.GetPendingOrganizers;
using EventPlatform.Application.Admin.Queries.GetStats;
using EventPlatform.Application.Admin.Queries.GetUserById;
using EventPlatform.Application.Admin.Queries.GetUserEvents;
using EventPlatform.Application.Admin.Queries.GetUserRegistrations;
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
        
        group.MapGet("/users/{userId:guid}", async (
                Guid userId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetUserByIdQuery(userId), cancellationToken);
                return result is not null ? Results.Ok(result) : Results.NotFound();
            })
            .WithName("GetUserById")
            .WithSummary("Get user details (Admin only)");

        group.MapGet("/users/{userId:guid}/events", async (
                Guid userId,
                ISender sender,
                CancellationToken cancellationToken,
                int page = 1,
                int pageSize = 10) =>
            {
                var result = await sender.Send(
                    new GetUserEventsQuery(userId, page, pageSize),
                    cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetUserEvents")
            .WithSummary("Get events by user (Admin only)");

        group.MapGet("/users/{userId:guid}/registrations", async (
                Guid userId,
                ISender sender,
                CancellationToken cancellationToken,
                int page = 1,
                int pageSize = 10) =>
            {
                var result = await sender.Send(
                    new GetUserRegistrationsQuery(userId, page, pageSize),
                    cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetUserRegistrations")
            .WithSummary("Get registrations by user (Admin only)");

        group.MapPost("/users/{userId:guid}/registrations/{registrationId:guid}/cancel", async (
                Guid userId,
                Guid registrationId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await sender.Send(new CancelRegistrationByAdminCommand(registrationId), cancellationToken);
                return Results.NoContent();
            })
            .WithName("CancelRegistrationByAdmin")
            .WithSummary("Cancel user registration (Admin only)");

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
        
        group.MapPost("/events/{eventId:guid}/cancel", async (
                Guid eventId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await sender.Send(new CancelEventByAdminCommand(eventId), cancellationToken);
                return Results.NoContent();
            })
            .WithName("CancelEventByAdmin")
            .WithSummary("Cancel any event (Admin only)");
        
        group.MapGet("/events", async (
                ISender sender,
                CancellationToken cancellationToken,
                string? searchTerm = null,
                string? status = null,
                int page = 1,
                int pageSize = 20) =>
            {
                var result = await sender.Send(
                    new GetAllEventsQuery(searchTerm, status, page, pageSize),
                    cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetAllEvents")
            .WithSummary("Get all events (Admin only)");
        
        group.MapGet("/organizers/pending", async (
                ISender sender,
                CancellationToken cancellationToken,
                int page = 1,
                int pageSize = 20) =>
            {
                var result = await sender.Send(
                    new GetPendingOrganizersQuery(page, pageSize),
                    cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetPendingOrganizers")
            .WithSummary("Get pending organizer approvals (Admin only)");
        
        group.MapPost("/organizers/{userId:guid}/approve", async (
                Guid userId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await sender.Send(new ApproveOrganizerCommand(userId), cancellationToken);
                return Results.NoContent();
            })
            .WithName("ApproveOrganizer")
            .WithSummary("Approve organizer (Admin only)");
        
        group.MapPost("/organizers/{userId:guid}/reject", async (
                Guid userId,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await sender.Send(new RejectOrganizerCommand(userId), cancellationToken);
                return Results.NoContent();
            })
            .WithName("RejectOrganizer")
            .WithSummary("Reject organizer (Admin only)");
    }
}