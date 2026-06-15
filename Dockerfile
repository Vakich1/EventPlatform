FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/EventPlatform.Domain/EventPlatform.Domain.csproj src/EventPlatform.Domain/
COPY src/EventPlatform.Application/EventPlatform.Application.csproj src/EventPlatform.Application/
COPY src/EventPlatform.Infrastructure/EventPlatform.Infrastructure.csproj src/EventPlatform.Infrastructure/
COPY src/EventPlatform.API/EventPlatform.API.csproj src/EventPlatform.API/
RUN dotnet restore src/EventPlatform.API/EventPlatform.API.csproj

COPY src/ src/
RUN dotnet publish src/EventPlatform.API/EventPlatform.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5220
EXPOSE 5220
ENTRYPOINT ["dotnet", "EventPlatform.API.dll"]
