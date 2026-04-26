using EventPlatform.Application.Registrations.Commands.CheckInTicket;
using EventPlatform.Application.Registrations.Commands.CreatePaymentIntent;
using EventPlatform.Application.Registrations.Commands.CreateRegistration;
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
    }    
}