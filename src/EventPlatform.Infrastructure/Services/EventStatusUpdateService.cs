using EventPlatform.Domain.Enums;
using EventPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace EventPlatform.Infrastructure.Services;

public class EventStatusUpdateService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EventStatusUpdateService> _logger;
    
    private readonly TimeSpan _interval =  TimeSpan.FromMinutes(5);

    public EventStatusUpdateService(IServiceScopeFactory scopeFactory, ILogger<EventStatusUpdateService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Event status update service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await UpdateEventStatusesAsync(stoppingToken);
            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task UpdateEventStatusesAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            var now = DateTime.UtcNow;
            
            var completedEvents = await context.Events
                .Where(e => e.Status == EventStatus.Published && e.EndDate <= now)
                .ToListAsync(cancellationToken);

            foreach (var @event in completedEvents)
                @event.Complete();

            if (completedEvents.Any())
            {
                await context.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Marked {Count} events as completed.", completedEvents.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating event statuses.");
        }
    }
}