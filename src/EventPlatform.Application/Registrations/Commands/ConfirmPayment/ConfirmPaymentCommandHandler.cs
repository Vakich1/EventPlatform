using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Stripe;

namespace EventPlatform.Application.Registrations.Commands.ConfirmPayment;

public class ConfirmPaymentCommandHandler : IRequestHandler<ConfirmPaymentCommand>
{
    private readonly IPaymentService _paymentService;

    public ConfirmPaymentCommandHandler(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    public async Task Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
    {
        var paymentIntentId = request.ClientSecret.Split(new[] { "_secret_" }, StringSplitOptions.None)[0];
        
        var service = new PaymentIntentService();
        var options = new PaymentIntentConfirmOptions
        {
            PaymentMethod = "pm_card_visa",
        };
        await service.ConfirmAsync(paymentIntentId, options, cancellationToken: cancellationToken);

        await _paymentService.ProcessSuccessfulPaymentAsync(paymentIntentId, cancellationToken);
    }
}