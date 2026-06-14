using EventPlatform.Domain.Entities;
using FluentAssertions;

namespace EventPlatform.UnitTests.Domain;

public class RegistrationTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateRegistration()
    {
        var userId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var ticketTypeId = Guid.NewGuid();

        var registration = Registration.Create(userId, eventId, ticketTypeId);

        registration.UserId.Should().Be(userId);
        registration.EventId.Should().Be(eventId);
        registration.TicketTypeId.Should().Be(ticketTypeId);
        registration.Ticket.Should().BeNull();
        registration.Payment.Should().BeNull();
    }
}
