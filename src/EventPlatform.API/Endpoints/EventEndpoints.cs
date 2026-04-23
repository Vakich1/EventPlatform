using EventPlatform.Application.Events.Commands.CreateEvent;
using EventPlatform.Application.Events.Queries.GetEventById;
using EventPlatform.Application.Events.Queries.GetEvents;
using MediatR;

namespace EventPlatform.API.Endpoints;

public static class EventEndpoints
{
    public static void MapEventEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/events")
            .WithTags("Events")
            .RequireAuthorization();

        group.MapPost("/", async (
                CreateEventCommand command,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var eventId = await sender.Send(command, cancellationToken);
                return Results.CreatedAtRoute("GetEventById", new { id = eventId }, new { id = eventId });
            })
            .WithName("CreateEvent")
            .WithSummary("Create a new event");
        
        group.MapGet("/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetEventByIdQuery(id),  cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetEventById")
        .WithSummary("Get event by id");
        
        group.MapGet("/", async (
            ISender sender,
            CancellationToken cancellationToken,
            string? searchTerm = null,
            int page = 1,
            int pageSize = 10) =>
        {
            var result = await sender.Send(new GetEventsQuery(searchTerm, page, pageSize), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetEvents")
        .WithSummary("Get paginated list of events");
    }
}