using FluentValidation;

namespace EventPlatform.Application.Registrations.Commands.CreatePaymentIntent;

public class CreatePaymentIntentCommandValidator : AbstractValidator<CreatePaymentIntentCommand>
{
    public CreatePaymentIntentCommandValidator()
    {
        RuleFor(x => x.EventId)
            .NotEmpty().WithMessage("Event id is required.");
        
        RuleFor(x => x.TicketTypeId)
            .NotEmpty().WithMessage("Ticket type id is required.");
    }
}