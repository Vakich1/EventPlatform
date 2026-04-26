using EventPlatform.Application.Common.Interfaces;
using QRCoder;

namespace EventPlatform.Infrastructure.Services;

public class QrCodeService : IQrCodeService
{
    public string Generate(string data)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new Base64QRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }
}