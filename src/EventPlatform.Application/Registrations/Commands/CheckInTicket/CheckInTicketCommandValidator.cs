using FluentValidation;

namespace EventPlatform.Application.Registrations.Commands.CheckInTicket;

public class CheckInTicketCommandValidator : AbstractValidator<CheckInTicketCommand>
{
    public CheckInTicketCommandValidator()
    {
        RuleFor(x => x.QrCode)
            .NotEmpty().WithMessage("QR code is required");
    }   
}