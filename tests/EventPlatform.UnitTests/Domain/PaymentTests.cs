using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Enums;
using FluentAssertions;

namespace EventPlatform.UnitTests.Domain;

public class PaymentTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreatePayment()
    {
        var registrationId = Guid.NewGuid();

        var payment = Payment.Create(registrationId, 50.00m, "usd");

        payment.RegistrationId.Should().Be(registrationId);
        payment.Amount.Should().Be(50.00m);
        payment.Currency.Should().Be("usd");
        payment.Status.Should().Be(PaymentStatus.Pending);
        payment.StripePaymentId.Should().BeNull();
    }

    [Fact]
    public void Create_DefaultCurrency_ShouldBeUsd()
    {
        var payment = Payment.Create(Guid.NewGuid(), 100m);

        payment.Currency.Should().Be("usd");
    }

    [Fact]
    public void SetStripeIntentId_ShouldSetId()
    {
        var payment = Payment.Create(Guid.NewGuid(), 100m);

        payment.SetStripeIntentId("pi_123");

        payment.StripePaymentId.Should().Be("pi_123");
    }

    [Fact]
    public void MarkAsSucceeded_ShouldSetStatus()
    {
        var payment = Payment.Create(Guid.NewGuid(), 100m);

        payment.MarkAsSucceeded();

        payment.Status.Should().Be(PaymentStatus.Succeeded);
    }

    [Fact]
    public void MarkAsFailed_ShouldSetStatus()
    {
        var payment = Payment.Create(Guid.NewGuid(), 100m);

        payment.MarkAsFailed();

        payment.Status.Should().Be(PaymentStatus.Failed);
    }

    [Fact]
    public void MarkAsRefunded_ShouldSetStatus()
    {
        var payment = Payment.Create(Guid.NewGuid(), 100m);

        payment.MarkAsRefunded();

        payment.Status.Should().Be(PaymentStatus.Refunded);
    }
}
