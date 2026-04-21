using EventPlatform.Domain.Entities;

namespace EventPlatform.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendTicketConfirmationAsync(string toEmail, string userName,
        string eventTitle, DateTime eventDate, string qrCode,
        CancellationToken cancellationToken =  default);
}