using EventPlatform.Application.Registrations.Commands.ConfirmPayment;
using MediatR;

namespace EventPlatform.API.Endpoints;

public static class PaymentEndpoints
{
    public static void MapPaymentEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/payments")
            .WithTags("Payments")
            .RequireAuthorization();

        group.MapPost("/confirm", async (
                ConfirmPaymentCommand command,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                await sender.Send(command, cancellationToken);
                return Results.Ok();
            })
            .WithName("ConfirmPayment")
            .WithSummary("Confirm Payment");
    }
}