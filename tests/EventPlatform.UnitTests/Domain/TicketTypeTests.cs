using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Exceptions;
using FluentAssertions;

namespace EventPlatform.UnitTests.Domain;

public class TicketTypeTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateTicketType()
    {
        var ticketType = TicketType.Create("General", 10, 100, Guid.NewGuid());

        ticketType.Name.Should().Be("General");
        ticketType.Price.Should().Be(10);
        ticketType.TotalQuantity.Should().Be(100);
        ticketType.SoldQuantity.Should().Be(0);
        ticketType.IsFree.Should().BeFalse();
        ticketType.AvailableQuantity.Should().Be(100);
    }

    [Fact]
    public void Create_WithZeroPrice_ShouldBeFreeTicker()
    {
        var ticketType = TicketType.Create("Free", 0, 100, Guid.NewGuid());

        ticketType.IsFree.Should().BeTrue();
    }

    [Fact]
    public void Create_WithNegativePrice_ShouldThrowDomainException()
    {
        Action act = () => TicketType.Create("General", -1, 100, Guid.NewGuid());

        act.Should().Throw<DomainException>()
            .WithMessage("Price cannot be negative.");
    }

    [Fact]
    public void Create_WithZeroQuantity_ShouldThrowDomainException()
    {
        Action act = () => TicketType.Create("General", 10, 0, Guid.NewGuid());

        act.Should().Throw<DomainException>()
            .WithMessage("Total quantity must be greater than zero.");
    }

    [Fact]
    public void IncrementSold_ShouldDecrementAvailableQuantity()
    {
        var ticketType = TicketType.Create("General", 10, 100, Guid.NewGuid());

        ticketType.IncrementSold();

        ticketType.SoldQuantity.Should().Be(1);
        ticketType.AvailableQuantity.Should().Be(99);
    }

    [Fact]
    public void IncrementSold_WhenNoTicketsAvailable_ShouldThrowDomainException()
    {
        var ticketType = TicketType.Create("General", 10, 1, Guid.NewGuid());
        ticketType.IncrementSold();

        Action act = () => ticketType.IncrementSold();

        act.Should().Throw<DomainException>()
            .WithMessage("No tickets available.");
    }

    [Fact]
    public void DecrementSold_ShouldIncrementAvailableQuantity()
    {
        var ticketType = TicketType.Create("General", 10, 100, Guid.NewGuid());
        ticketType.IncrementSold();

        ticketType.DecrementSold();

        ticketType.SoldQuantity.Should().Be(0);
        ticketType.AvailableQuantity.Should().Be(100);
    }

    [Fact]
    public void DecrementSold_WhenSoldQuantityIsZero_ShouldThrowDomainException()
    {
        var ticketType = TicketType.Create("General", 10, 100, Guid.NewGuid());

        Action act = () => ticketType.DecrementSold();

        act.Should().Throw<DomainException>()
            .WithMessage("Sold quantity cannot be less than zero.");
    }
}