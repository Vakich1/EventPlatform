using EventPlatform.Application.Auth.Commands.LoginUser;
using EventPlatform.Application.Auth.Commands.RefreshToken;
using EventPlatform.Application.Auth.Commands.RegisterUser;
using MediatR;

namespace EventPlatform.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");
        
        group.MapPost("/register", async (
            RegisterUserCommand command,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("RegisterUser")
        .WithSummary("Register a new user")
        .AllowAnonymous();
        
        group.MapPost("/login", async (
            LoginUserCommand command,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("LoginUser")
        .WithSummary("Login user")
        .AllowAnonymous();
        
        group.MapPost("/refresh-token", async (
            RefreshTokenCommand command,
            ISender sender,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await sender.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("RefreshToken")
        .WithSummary("Refresh access token")
        .AllowAnonymous();
    }
}