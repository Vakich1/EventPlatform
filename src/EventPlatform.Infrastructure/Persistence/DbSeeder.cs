using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Users.AnyAsync())
            return;

        var adminUser = User.Create("admin@eventplatform.com", BCrypt.Net.BCrypt.HashPassword("Admin123!"), "Admin", "User");
        adminUser.SetRole(UserRole.Admin);

        var testUser = User.Create("test@test.com", BCrypt.Net.BCrypt.HashPassword("Test123!"), "Test", "User");
        testUser.SetRole(UserRole.Organizer);
        testUser.ApproveAsOrganizer();

        context.Users.AddRange(adminUser, testUser);
        await context.SaveChangesAsync();

        var events = new (string Title, string Description, string Location, EventStatus Status, DateTime Start, DateTime End, (string Name, decimal Price, int Qty)[] Tickets)[]
        {
            ("Tech Conference 2026", "Крупнейшая технологическая конференция года. Лучшие спикеры, актуальные доклады о технологиях будущего.", "Москва, Крокус Сити Холл", EventStatus.Published, new DateTime(2026, 9, 15, 9, 0, 0, DateTimeKind.Utc), new DateTime(2026, 9, 17, 18, 0, 0, DateTimeKind.Utc), new[] { ("Standard", 0m, 100), ("VIP", 5000m, 50), ("Premium", 15000m, 20) }),
            ("Музыкальный фестиваль", "Трёхдневный музыкальный фестиваль с участием лучших отечественных и зарубежных исполнителей.", "Санкт-Петербург, Петербургская Арена", EventStatus.Published, new DateTime(2026, 7, 20, 14, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 22, 23, 0, 0, DateTimeKind.Utc), new[] { ("Базовый", 0m, 500), ("VIP", 3000m, 100) }),
            ("Frontend Meetup", "Встреча фронтенд-разработчиков. Обсуждаем React, Vue, Angular и современные подходы к UI.", "Москва, Коворкинг Точка", EventStatus.Published, new DateTime(2026, 6, 25, 18, 30, 0, DateTimeKind.Utc), new DateTime(2026, 6, 25, 21, 0, 0, DateTimeKind.Utc), new[] { ("Общий", 0m, 80) }),
            ("AI & Machine Learning Summit", "Саммит по искусственному интеллекту и машинному обучению. Hands-on воркшопы и доклады.", "Москва, Экспоцентр", EventStatus.Published, new DateTime(2026, 10, 5, 9, 0, 0, DateTimeKind.Utc), new DateTime(2026, 10, 6, 18, 0, 0, DateTimeKind.Utc), new[] { ("Student", 0m, 200), ("Professional", 8000m, 100), ("Enterprise", 25000m, 30) }),
            ("DevOps Days Moscow", "Ежегодная конференция для DevOps-инженеров. CI/CD, контейнеры, оркестрация, мониторинг.", "Москва, Технопарк", EventStatus.Published, new DateTime(2026, 8, 10, 9, 0, 0, DateTimeKind.Utc), new DateTime(2026, 8, 11, 17, 0, 0, DateTimeKind.Utc), new[] { ("Standard", 0m, 150), ("Workshop", 5000m, 40) }),
            ("Kotlin Developer Conference", "Конференция для Kotlin-разработчиков. Android, серверная разработка, Kotlin Multiplatform.", "Казань, Казань ЭКСПО", EventStatus.Published, new DateTime(2026, 11, 1, 9, 0, 0, DateTimeKind.Utc), new DateTime(2026, 11, 2, 18, 0, 0, DateTimeKind.Utc), new[] { ("Early Bird", 0m, 100), ("Regular", 3000m, 200) }),
            ("Game Dev Jam", "Джем по разработке игр. За 48 часов создайте игру с нуля. Команды до 4 человек.", "Москва, Игровой хаб", EventStatus.Published, new DateTime(2026, 8, 25, 10, 0, 0, DateTimeKind.Utc), new DateTime(2026, 8, 27, 10, 0, 0, DateTimeKind.Utc), new[] { ("Участник", 0m, 60) }),
            ("Kubernetes Workshop", "Практический воркшоп по Kubernetes. От основ до продвинутых паттернов деплоя.", "Онлайн (Zoom)", EventStatus.Draft, new DateTime(2026, 9, 1, 10, 0, 0, DateTimeKind.Utc), new DateTime(2026, 9, 1, 17, 0, 0, DateTimeKind.Utc), new[] { ("Стандарт", 0m, 30) }),
            ("React Advanced Workshop", "Углублённый воркшоп по React. Server Components, Suspense, оптимизация производительности.", "Москва, Loft", EventStatus.Draft, new DateTime(2026, 7, 15, 10, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 15, 18, 0, 0, DateTimeKind.Utc), new[] { ("Полный доступ", 0m, 25) }),
            ("Cloud Native Summit", "Саммит по облачным технологиям. AWS, Azure, GCP, серверless, микросервисы.", "Москва, Крокус Сити Холл", EventStatus.Published, new DateTime(2026, 12, 3, 9, 0, 0, DateTimeKind.Utc), new DateTime(2026, 12, 4, 18, 0, 0, DateTimeKind.Utc), new[] { ("Community", 0m, 300), ("Business", 10000m, 50) }),
            ("Кибербезопасность Конференция", "Конференция по информационной безопасности. Этичный хакинг, защита данных, compliance.", "Москва, РИА Новости", EventStatus.Cancelled, new DateTime(2026, 5, 10, 9, 0, 0, DateTimeKind.Utc), new DateTime(2026, 5, 11, 17, 0, 0, DateTimeKind.Utc), new[] { ("Стандарт", 0m, 100) }),
        };

        foreach (var (title, description, location, status, start, end, tickets) in events)
        {
            var @event = Event.Create(title, description, location, start, end, adminUser.Id);

            foreach (var (name, price, qty) in tickets)
            {
                @event.AddTicketType(TicketType.Create(name, price, qty, @event.Id));
            }

            switch (status)
            {
                case EventStatus.Published:
                    @event.Publish();
                    break;
                case EventStatus.Cancelled:
                    @event.Cancel();
                    break;
            }

            context.Events.Add(@event);
        }

        await context.SaveChangesAsync();
    }
}
