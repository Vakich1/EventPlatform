using EventPlatform.Domain.Common;
using EventPlatform.Domain.Enums;

namespace EventPlatform.Domain.Entities;

public class Payment : BaseEntity
{
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "usd";
    public PaymentStatus Status { get; private set; }  = PaymentStatus.Pending;
    public string? StripePaymentId { get; private set; }
    
    public Guid RegistrationId { get; private set; }
    public Registration Registration { get; private set; } = null!;

    private Payment() { }

    public static Payment Create(Guid registrationId, decimal amount, string currency = "usd")
    {
        return new Payment
        {
            RegistrationId = registrationId,
            Amount = amount,
            Currency = currency
        };
    }

    public void SetStripeIntentId(string intentId)
    {
        StripePaymentId = intentId;
        SetUpdatedAt();
    }
    
    public void MarkAsSucceeded()
    {
        Status = PaymentStatus.Succeeded;
        SetUpdatedAt();
    }
    
    public void MarkAsFailed()
    {
        Status = PaymentStatus.Failed;
        SetUpdatedAt();
    }
    
    public void MarkAsRefunded()
    {
        Status = PaymentStatus.Refunded;
        SetUpdatedAt();
    }
}