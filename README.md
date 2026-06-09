# EventPlatform

A full-stack event management platform built with ASP.NET Core 10 and Next.js 14.

## Features

- **Event Management** — Create, edit, publish and cancel events
- **Ticket System** — Multiple ticket types per event, free and paid
- **Registration** — Register for events, receive QR-code ticket via email
- **Payments** — Stripe integration for paid tickets
- **Check-in** — Scan QR-code at the entrance to check in attendees
- **Authentication** — JWT + Refresh Tokens

## Tech Stack

### Backend
- ASP.NET Core 10 — Minimal API
- Clean Architecture + CQRS (MediatR)
- Entity Framework Core + PostgreSQL
- JWT Authentication
- Stripe Payments
- MailKit for emails
- QRCoder for QR-code generation
- Docker

### Frontend
- Next.js 14 + TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Axios

## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Running locally

**1. Clone the repository**
```bash
git clone https://github.com/Vakich1/EventPlatform.git
cd EventPlatform
```

**2. Start infrastructure**
```bash
docker-compose up -d
```

**3. Configure secrets**

Create `src/EventPlatform.API/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=eventplatform;Username=postgres;Password=postgres"
  },
  "JwtSettings": {
    "Secret": "your-secret-key-at-least-32-characters",
    "Issuer": "EventPlatform",
    "Audience": "EventPlatform",
    "ExpiresInMinutes": 60,
    "RefreshTokenExpiresInDays": 7
  },
  "StripeSettings": {
    "SecretKey": "sk_test_your_stripe_key",
    "WebhookSecret": "whsec_your_webhook_secret"
  },
  "EmailSettings": {
    "SmtpHost": "sandbox.smtp.mailtrap.io",
    "SmtpPort": "587",
    "SenderName": "Event Platform",
    "SenderEmail": "your@email.com",
    "Username": "your_mailtrap_username",
    "Password": "your_mailtrap_password"
  }
}
```

**4. Run database migrations**
```bash
cd src/EventPlatform.API
dotnet ef database update --project ../EventPlatform.Infrastructure
```

**5. Start the backend**
```bash
dotnet run --project src/EventPlatform.API
```

**6. Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

**7. Open the app**

- Frontend: http://localhost:3000
- Swagger: http://localhost:5220/swagger

## Architecture

The backend follows **Clean Architecture** with **CQRS** pattern:

```
EventPlatform.Domain         # Entities, business logic, domain exceptions
EventPlatform.Application    # CQRS Commands/Queries, interfaces, validators
EventPlatform.Infrastructure # EF Core, external services (Stripe, Email, QR)
EventPlatform.API            # Minimal API endpoints, middleware
```

## Running Tests

```bash
dotnet test
```
