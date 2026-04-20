using EventPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventPlatform.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Amount).HasColumnType("decimal(18,2)");
        
        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3);
        
        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        builder.Property(p => p.StripePaymentId).HasMaxLength(200);
    }
}