namespace EventPlatform.Application.Common.Interfaces;

public interface IQrCodeService
{
    string Generate(string data);
}