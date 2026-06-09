using EventPlatform.Application.Registrations.Commands.CheckInTicket;
using EventPlatform.Application.Registrations.Commands.CreatePaymentIntent;
using EventPlatform.Application.Registrations.Commands.CreateRegistration;
using EventPlatform.Application.Registrations.Queries.GetMyRegistrations;
using EventPlatform.Application.Registrations.Queries.GetUserRegistration;
using MediatR;

namespace EventPlatform.API.Endpoints;

public static class RegistrationEndpoints
{
    public static void MapRegistrationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/registrations")
            .WithTags("Registrations")
            .RequireAuthorization();

        group.MapPost("/", async (
            CreateRegistrationCommand command,
            ISender sender, 
            CancellationToken cancellationToken) =>
            {
                var registrationsId = await sender.Send(command, cancellationToken); 
                return Results.Ok(new { id = registrationsId });
            })
            .WithName("CreateRegistration")
            .WithSummary("Register for an event");

        group.MapPost("/check-in", async (
                CheckInTicketCommand command,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(command, cancellationToken);
                return Results.Ok(result);
            })
            .WithName("CheckInTicket")
            .WithSummary("Check in attendee by QR code");
        
        group.MapPost("/payment-intent", async (
            CreatePaymentIntentCommand command,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("CreatePaymentIntent")
        .WithSummary("Create payment intent for paid ticket");
        
        group.MapGet("/my/{eventId:guid}", async (
            Guid eventId,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetUserRegistrationQuery(eventId), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetUserRegistration")
        .WithSummary("Get current user registration for event");
        
        group.MapGet("/my", async (
            ISender sender,
            CancellationToken cancellationToken,
            int page = 1,
            int pageSize = 10) =>
        {
            var result = await sender.Send(new GetMyRegistrationsQuery(page, pageSize), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetMyRegistrations")
        .WithSummary("Get current user registrations");
    }    
}