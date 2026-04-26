using EventPlatform.Application.Common.Interfaces;
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
            IQrCodeService qrCodeService,
            IEmailService emailService) =>
        {
            var payload = await new StreamReader(httpRequest.Body).ReadToEndAsync();
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
                
                var registrationId = await paymentService.GetRegistrationIdFromPaymentIntent(paymentIntent.Id);
                
                var registration = await context.Registrations
                    .Include(r => r.User)
                    .Include(r => r.Event)
                    .Include(r => r.TicketType)
                    .Include(r => r.Payment)
                    .FirstOrDefaultAsync(r => r.Id == registrationId);
                
                registration!.Payment!.MarkAsSucceeded();
                registration.Payment.SetStripeIntentId(paymentIntent.Id);
                registration.TicketType.IncrementSold();
                
                var qrCode = qrCodeService.Generate(registration.Id.ToString());
                var ticket = Domain.Entities.Ticket.Create(registration.Id, qrCode);
                context.Tickets.Add(ticket);
                
                await context.SaveChangesAsync();

                await emailService.SendTicketConfirmationAsync(
                    registration.User.Email,
                    registration.User.FullName,
                    registration.Event.Title,
                    registration.Event.StartDate,
                    qrCode);
            }
            
            return Results.Ok();
        })
        .WithName("StripeWebhook")
        .WithTags("Webhooks")
        .AllowAnonymous();
    }
}