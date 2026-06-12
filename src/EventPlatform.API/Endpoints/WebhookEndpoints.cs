using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace EventPlatform.API.Endpoints;

public static class WebhookEndpoints
{
    public static void MapWebhookEndpoints(this WebApplication app)
    {
        app.MapPost("/api/webhooks/stripe", async (
            HttpRequest httpRequest,
            IPaymentService paymentService,
            IApplicationDbContext context,
            CancellationToken cancellationToken) =>
        {
            var payload = await new StreamReader(httpRequest.Body).ReadToEndAsync(cancellationToken);
            var signature = httpRequest.Headers["Stripe-Signature"].ToString();
            
            var isValid = await paymentService.ValidateWebhookSignature(payload, signature);
            if (!isValid)
                return Results.Unauthorized();

            var stripeEvent = Stripe.EventUtility.ParseEvent(payload);

            if (stripeEvent.Type == "payment_intent.succeeded")
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent is null)
                    return Results.BadRequest();
                
                await paymentService.ProcessSuccessfulPaymentAsync(paymentIntent.Id, cancellationToken);
            }
            
            if (stripeEvent.Type == "payment_intent.payment_failed")
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent is null)
                    return Results.BadRequest();

                var registrationId = await paymentService.GetRegistrationIdFromPaymentIntent(paymentIntent.Id);

                var registration = await context.Registrations
                    .Include(r => r.Payment)
                    .Include(r => r.TicketType)
                    .FirstOrDefaultAsync(r => r.Id == registrationId, cancellationToken);

                if (registration is null)
                    return Results.NotFound();

                if (registration.Payment!.Status == PaymentStatus.Succeeded)
                    registration.TicketType.DecrementSold();
                
                registration.Payment!.MarkAsFailed();

                await context.SaveChangesAsync(cancellationToken);
            }
            
            if (stripeEvent.Type == "payment_intent.canceled")
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent is null)
                    return Results.BadRequest();

                var registrationId = await paymentService.GetRegistrationIdFromPaymentIntent(paymentIntent.Id);

                var registration = await context.Registrations
                    .Include(r => r.Payment)
                    .Include(r => r.TicketType)
                    .FirstOrDefaultAsync(r => r.Id == registrationId, cancellationToken);

                if (registration is null)
                    return Results.NotFound();

                if (registration.Payment!.Status == PaymentStatus.Succeeded)
                    registration.TicketType.DecrementSold();
                
                registration.Payment!.MarkAsFailed();

                await context.SaveChangesAsync(cancellationToken);
            }
            
            return Results.Ok();
        })
        .WithName("StripeWebhook")
        .WithTags("Webhooks")
        .AllowAnonymous();
    }
}