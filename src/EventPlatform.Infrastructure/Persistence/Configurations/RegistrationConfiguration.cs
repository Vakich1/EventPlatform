using EventPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventPlatform.Infrastructure.Persistence.Configurations;

public class RegistrationConfiguration : IEntityTypeConfiguration<Registration>
{
    public void Configure(EntityTypeBuilder<Registration> builder)
    {
        builder.HasKey(r => r.Id);
        
        builder.HasIndex(r => new {r.UserId, r.TicketTypeId}).IsUnique();
        
        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(r => r.Event)
            .WithMany()
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(r => r.TicketType)
            .WithMany()
            .HasForeignKey(r => r.TicketTypeId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(r => r.Ticket)
            .WithOne(t => t.Registration)
            .HasForeignKey<Ticket>(t => t.RegistrationId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(r => r.Payment)
            .WithOne(p => p.Registration)
            .HasForeignKey<Payment>(p => p.RegistrationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}