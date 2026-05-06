using System.Text.Json;
using EventPlatform.Application.Common.Interfaces;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace EventPlatform.Infrastructure.Services;

public class CacheService : ICacheService
{
    private readonly IConnectionMultiplexer _redis;

    public CacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync(key);

        if (value.IsNullOrEmpty)
            return default;

        return System.Text.Json.JsonSerializer.Deserialize<T>(value.ToString());
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan expiration,
        CancellationToken cancellationToken = default)
    {
        var  db = _redis.GetDatabase();
        var serialized = System.Text.Json.JsonSerializer.Serialize(value);
        await db.StringSetAsync(key, serialized, expiration);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync(key);
    }

    public async Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        var server =  _redis.GetServer(_redis.GetEndPoints().First());
        var keys = server.Keys(pattern: $"*{pattern}*").ToArray();

        if (keys.Any())
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(keys);
        }
    }
}