using EventPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventPlatform.Infrastructure.Persistence.Configurations;

public class TicketTypeConfiguration : IEntityTypeConfiguration<TicketType>
{
    public void Configure(EntityTypeBuilder<TicketType> builder)
    {
        builder.HasKey(tt => tt.Id);
        
        builder.Property(tt => tt.Name)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(tt => tt.Price).HasColumnType("decimal(18,2)");
        
        builder.Ignore(tt => tt.IsFree);
        builder.Ignore(tt => tt.AvailableQuantity);
    }
}