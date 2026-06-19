using EventPlatform.Application.Events.Commands.AddTicketType;
using EventPlatform.Application.Events.Commands.CancelEvent;
using EventPlatform.Application.Events.Commands.CreateEvent;
using EventPlatform.Application.Events.Commands.PublishEvent;
using EventPlatform.Application.Events.Commands.UpdateEvent;
using EventPlatform.Application.Events.Queries.GetEventById;
using EventPlatform.Application.Events.Queries.GetEvents;
using EventPlatform.Application.Events.Queries.GetMyEvents;
using MediatR;

namespace EventPlatform.API.Endpoints;

public static class EventEndpoints
{
    public static void MapEventEndpoints(this WebApplication app)
    {
        var publicGroup = app.MapGroup("/api/events")
            .WithTags("Events");
        
        publicGroup.MapGet("/", async (
                ISender sender,
                CancellationToken cancellationToken,
                string? searchTerm = null,
                string? status = null,
                int page = 1,
                int pageSize = 10) =>
            {
                var result = await sender.Send(new GetEventsQuery(searchTerm, status, page, pageSize), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetEvents")
            .WithSummary("Get paginated list of events");
        
        publicGroup.MapGet("/{id:guid}", async (
                Guid id,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GetEventByIdQuery(id),  cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetEventById")
            .WithSummary("Get event by id");
        
        var protectedGroup = app.MapGroup("/api/events")
            .WithTags("Events")
            .RequireAuthorization();

        protectedGroup.MapPost("/", async (
                CreateEventCommand command,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var eventId = await sender.Send(command, cancellationToken);
                return Results.CreatedAtRoute("GetEventById", new { id = eventId }, new { id = eventId });
            })
            .WithName("CreateEvent")
            .WithSummary("Create a new event");
        
        protectedGroup.MapPut("/{id:guid}", async (
            Guid id,
            UpdateEventCommand command,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            await sender.Send(command with { Id = id }, cancellationToken);
        })
        .WithName("UpdateEvent")
        .WithSummary("Update event");
        
        protectedGroup.MapPost("/{id:guid}/cancel", async (
            Guid id,
            ISender sender,
            CancellationToken  cancellationToken) =>
        {
            await sender.Send(new CancelEventCommand(id), cancellationToken);  
            return Results.NoContent();
        })
        .WithName("CancelEvent")
        .WithSummary("Cancel event");
        
        protectedGroup.MapPost("/{id:guid}/publish", async (
            Guid id,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            await sender.Send(new PublishEventCommand(id), cancellationToken);
            return Results.NoContent();
        })
        .WithName("PublishEvent")
        .WithSummary("Publish event");
        
        protectedGroup.MapPost("/{id:guid}/ticket-types", async (
            Guid id,
            AddTicketTypeCommand command,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var ticketTypeId = await sender.Send(command with {EventId = id}, cancellationToken); 
            return Results.Ok(new { id = ticketTypeId });
        })
        .WithName("AddTicketType")
        .WithSummary("Add ticket type to event");
        
        protectedGroup.MapGet("/my", async (
            ISender sender,
            CancellationToken cancellationToken,
            int page = 1,
            int pageSize = 10) =>
        {
            var result = await sender.Send(new GetMyEventsQuery(page, pageSize), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetMyEvents")
        .WithSummary("Get current user events");
    }
}