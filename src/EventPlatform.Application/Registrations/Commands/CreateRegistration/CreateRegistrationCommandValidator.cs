using FluentValidation;

namespace EventPlatform.Application.Registrations.Commands.CreateRegistration;

public class CreateRegistrationCommandValidator : AbstractValidator<CreateRegistrationCommand>
{
    public CreateRegistrationCommandValidator()
    {
        RuleFor(x => x.EventId)
            .NotEmpty().WithMessage("Event id is required.");
        
        RuleFor(x => x.TicketTypeId)
            .NotEmpty().WithMessage("Ticket type id is required.");
    }
}