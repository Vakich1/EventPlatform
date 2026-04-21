using EventPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Event> Events { get; }
    DbSet<TicketType> TicketTypes { get; }
    DbSet<Registration> Registrations { get; }
    DbSet<Ticket> Tickets { get; }
    DbSet<Payment> Payments { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}