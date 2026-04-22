using EventPlatform.Application.Events.Commands.CreateEvent;
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
                return Results.Created($"/api/events/{eventId}", new { id = eventId });
            })
            .WithName("CreateEvent")
            .WithSummary("Create a new event");
    }
}