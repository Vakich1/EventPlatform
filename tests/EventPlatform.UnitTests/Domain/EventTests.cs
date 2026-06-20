using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;
using FluentAssertions;

namespace EventPlatform.UnitTests.Domain;

public class EventTests
{
    private static Event CreateValidEvent() => Event.Create(
        title: "Test Event",
        description: "Test Description",
        location: "Test Location",
        startDate: DateTime.UtcNow.AddDays(1),
        endDate: DateTime.UtcNow.AddDays(2),
        organizerId: Guid.NewGuid());
    
    [Fact]
    public void Create_WithValidEvent_ShouldCreateEvent()
    {
        var title = "Test Event";
        var organizerId = Guid.NewGuid();
        var @event = Event.Create(
            title,
            "Description",
            "Location",
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(2),
            organizerId);
        
        @event.Title.Should().Be(title);
        @event.OrganizerId.Should().Be(organizerId);
        @event.Status.Should().Be(EventStatus.UnderReview);
    }
    
    [Fact]
    public void Create_WithEmptyTitle_ShouldThrowDomainException()
    {
        Action act = () => Event.Create(
            string.Empty,
            "Description",
            "Location",
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(2),
            Guid.NewGuid());

        act.Should().Throw<DomainException>()
            .WithMessage("Event title cannot be empty.");
    }

    [Fact]
    public void Create_WithStartDateInPast_ShouldThrowDomainException()
    {
        Action act = () => Event.Create(
            "Title",
            "Description",
            "Location",
            DateTime.UtcNow.AddDays(-1),
            DateTime.UtcNow.AddDays(2),
            Guid.NewGuid());

        act.Should().Throw<DomainException>()
            .WithMessage("Event cannot start in the past.");
    }
    
    [Fact]
    public void Create_WithEndDateBeforeStartDate_ShouldThrowDomainException()
    {
        Action act = () => Event.Create(
            "Title",
            "Description",
            "Location",
            DateTime.UtcNow.AddDays(2),
            DateTime.UtcNow.AddDays(1), 
            Guid.NewGuid());

        act.Should().Throw<DomainException>()
            .WithMessage("Start date must be before end date.");
    }
    
    [Fact]
    public void Approve_UnderReviewEvent_ShouldSetDraft()
    {
        var @event = CreateValidEvent();

        @event.Approve();

        @event.Status.Should().Be(EventStatus.Draft);
    }
    
    [Fact]
    public void Reject_UnderReviewEvent_ShouldSetRejected()
    {
        var @event = CreateValidEvent();

        @event.Reject();

        @event.Status.Should().Be(EventStatus.Rejected);
    }
    
    [Fact]
    public void SubmitForReview_RejectedEvent_ShouldSetUnderReview()
    {
        var @event = CreateValidEvent();
        @event.Reject();

        @event.SubmitForReview();

        @event.Status.Should().Be(EventStatus.UnderReview);
    }
    
    [Fact]
    public void Publish_DraftEventWithTicketTypes_ShouldPublishEvent()
    {
        var @event = CreateValidEvent();
        @event.Approve();
        var ticketType = TicketType.Create("General", 0, 100, @event.Id);
        @event.AddTicketType(ticketType);

        @event.Publish();

        @event.Status.Should().Be(EventStatus.Published);
    }
    
    [Fact]
    public void Publish_WithoutTicketTypes_ShouldThrowDomainException()
    {
        var @event = CreateValidEvent();
        @event.Approve();

        var act = () => @event.Publish();

        act.Should().Throw<DomainException>()
            .WithMessage("Event must have at least one ticket type before publishing.");
    }
    
    [Fact]
    public void Publish_AlreadyPublishedEvent_ShouldThrowDomainException()
    {
        var @event = CreateValidEvent();
        @event.Approve();
        var ticketType = TicketType.Create("General", 0, 100, @event.Id);
        @event.AddTicketType(ticketType);
        @event.Publish();

        var act = () => @event.Publish();

        act.Should().Throw<DomainException>()
            .WithMessage("Only draft events can be published.");
    }
    
    [Fact]
    public void Cancel_PublishedEvent_ShouldCancelEvent()
    {
        var @event = CreateValidEvent();
        @event.Approve();
        var ticketType = TicketType.Create("General", 0, 100, @event.Id);
        @event.AddTicketType(ticketType);
        @event.Publish();

        @event.Cancel();

        @event.Status.Should().Be(EventStatus.Cancelled);
    }
    
    [Fact]
    public void Cancel_AlreadyCancelledEvent_ShouldThrowDomainException()
    {
        var @event = CreateValidEvent();
        @event.Cancel();

        var act = () => @event.Cancel();

        act.Should().Throw<DomainException>()
            .WithMessage("Event is already cancelled.");
    }
    
    [Fact]
    public void Update_CancelledEvent_ShouldThrowDomainException()
    {
        var @event = CreateValidEvent();
        @event.Cancel();

        var act = () => @event.Update(
            "New Title",
            "New Description",
            "New Location",
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(2));

        act.Should().Throw<DomainException>()
            .WithMessage("Cannot update a cancelled event.");
    }
    
    [Fact]
    public void Update_PublishedEvent_ShouldThrowDomainException()
    {
        var @event = CreateValidEvent();
        @event.Approve();
        var ticketType = TicketType.Create("General", 0, 100, @event.Id);
        @event.AddTicketType(ticketType);
        @event.Publish();

        var act = () => @event.Update(
            "New Title",
            "New Description",
            "New Location",
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(2));

        act.Should().Throw<DomainException>()
            .WithMessage("Cannot update a published event.");
    }
    
    [Fact]
    public void Update_DraftEvent_ShouldSetUnderReview()
    {
        var @event = CreateValidEvent();
        @event.Approve();

        @event.Update(
            "New Title",
            "New Description",
            "New Location",
            DateTime.UtcNow.AddDays(1),
            DateTime.UtcNow.AddDays(2));

        @event.Status.Should().Be(EventStatus.UnderReview);
    }
}
