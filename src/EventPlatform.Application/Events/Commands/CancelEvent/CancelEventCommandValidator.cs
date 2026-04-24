using FluentValidation;

namespace EventPlatform.Application.Events.Commands.CancelEvent;

public class CancelEventCommandValidator : AbstractValidator<CancelEventCommand>
{
    public CancelEventCommandValidator()
    {
        RuleFor(c => c.Id)
            .NotEmpty().WithMessage("Event id is required.");
    }
}