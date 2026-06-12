using FluentValidation;

namespace EventPlatform.Application.Admin.Commands.CancelEventByAdmin;

public class CancelEventByAdminCommandValidator : AbstractValidator<CancelEventByAdminCommand>
{
    public CancelEventByAdminCommandValidator()
    {
        RuleFor(x => x.EventId)
            .NotEmpty().WithMessage("Event id is required.");
    }
}