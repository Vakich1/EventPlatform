using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;
using FluentAssertions;

namespace EventPlatform.UnitTests.Domain;

public class TicketTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateTicket()
    {
        var registrationId = Guid.NewGuid();
        var qrCode = "test-qr-code";

        var ticket = Ticket.Create(registrationId, qrCode);

        ticket.RegistrationId.Should().Be(registrationId);
        ticket.QrCode.Should().Be(qrCode);
        ticket.Status.Should().Be(TicketStatus.Active);
    }

    [Fact]
    public void MarkAsUsed_ActiveTicket_ShouldMarkAsUsed()
    {
        var ticket = Ticket.Create(Guid.NewGuid(), "qr-code");

        ticket.MarkAsUsed();

        ticket.Status.Should().Be(TicketStatus.Used);
    }

    [Fact]
    public void MarkAsUsed_AlreadyUsedTicket_ShouldThrowDomainException()
    {
        var ticket = Ticket.Create(Guid.NewGuid(), "qr-code");
        ticket.MarkAsUsed();

        Action act = () => ticket.MarkAsUsed();

        act.Should().Throw<DomainException>()
            .WithMessage("Ticket has already been used.");
    }

    [Fact]
    public void MarkAsUsed_CancelledTicket_ShouldThrowDomainException()
    {
        var ticket = Ticket.Create(Guid.NewGuid(), "qr-code");
        ticket.Cancel();

        Action act = () => ticket.MarkAsUsed();

        act.Should().Throw<DomainException>()
            .WithMessage("Ticket has already been cancelled.");
    }

    [Fact]
    public void Cancel_ActiveTicket_ShouldCancelTicket()
    {
        var ticket = Ticket.Create(Guid.NewGuid(), "qr-code");

        ticket.Cancel();

        ticket.Status.Should().Be(TicketStatus.Cancelled);
    }

    [Fact]
    public void Cancel_UsedTicket_ShouldThrowDomainException()
    {
        var ticket = Ticket.Create(Guid.NewGuid(), "qr-code");
        ticket.MarkAsUsed();

        Action act = () => ticket.Cancel();

        act.Should().Throw<DomainException>()
            .WithMessage("Cannot cancel a used ticket.");
    }
}