using EventPlatform.Application.Auth.Commands.DisableTwoFactor;
using EventPlatform.Application.Auth.Commands.EnableTwoFactor;
using EventPlatform.Application.Auth.Commands.GoogleAuth;
using EventPlatform.Application.Auth.Commands.LoginUser;
using EventPlatform.Application.Auth.Commands.RefreshToken;
using EventPlatform.Application.Auth.Commands.RegisterUser;
using EventPlatform.Application.Auth.Commands.SetupTwoFactor;
using EventPlatform.Application.Auth.Commands.VerifyTwoFactor;
using EventPlatform.Application.Auth.Queries.GetTwoFactorStatus;
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

        group.MapPost("/login/2fa", async (
            VerifyTwoFactorCommand command,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("VerifyTwoFactor")
        .WithSummary("Complete login with authenticator code")
        .AllowAnonymous();

        group.MapPost("/google", async (
            GoogleAuthCommand command,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GoogleAuth")
        .WithSummary("Login or register with Google ID token")
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

        group.MapGet("/2fa", async (
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetTwoFactorStatusQuery(), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetTwoFactorStatus")
        .WithSummary("Get two-factor authentication status")
        .RequireAuthorization();

        group.MapPost("/2fa/setup", async (
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new SetupTwoFactorCommand(), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("SetupTwoFactor")
        .WithSummary("Generate authenticator secret and QR URI")
        .RequireAuthorization();

        group.MapPost("/2fa/enable", async (
            EnableTwoFactorCommand command,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            await sender.Send(command, cancellationToken);
            return Results.NoContent();
        })
        .WithName("EnableTwoFactor")
        .WithSummary("Enable two-factor authentication")
        .RequireAuthorization();

        group.MapPost("/2fa/disable", async (
            DisableTwoFactorCommand command,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            await sender.Send(command, cancellationToken);
            return Results.NoContent();
        })
        .WithName("DisableTwoFactor")
        .WithSummary("Disable two-factor authentication")
        .RequireAuthorization();
    }
}
