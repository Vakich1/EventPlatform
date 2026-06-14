using EventPlatform.Application.Common.Behaviours;
using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Moq;
using Xunit;

namespace EventPlatform.UnitTests.Application.Behaviours;

public class ValidationBehaviourTests
{
    public record TestRequest : IRequest<string>;

    [Fact]
    public async Task Handle_WithNoValidators_ShouldCallNext()
    {
        var next = new Mock<RequestHandlerDelegate<string>>();
        next.Setup(x => x()).ReturnsAsync("result");

        var behaviour = new ValidationBehaviour<TestRequest, string>(Array.Empty<IValidator<TestRequest>>());

        var result = await behaviour.Handle(new TestRequest(), next.Object, CancellationToken.None);

        result.Should().Be("result");
        next.Verify(x => x(), Times.Once);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ShouldCallNext()
    {
        var validator = new Mock<IValidator<TestRequest>>();
        validator.Setup(x => x.Validate(It.IsAny<ValidationContext<TestRequest>>()))
            .Returns(new ValidationResult());

        var next = new Mock<RequestHandlerDelegate<string>>();
        next.Setup(x => x()).ReturnsAsync("result");

        var behaviour = new ValidationBehaviour<TestRequest, string>(new[] { validator.Object });

        var result = await behaviour.Handle(new TestRequest(), next.Object, CancellationToken.None);

        result.Should().Be("result");
        next.Verify(x => x(), Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidRequest_ShouldThrowValidationException()
    {
        var failures = new List<ValidationFailure>
        {
            new("Property", "Error message")
        };

        var validator = new Mock<IValidator<TestRequest>>();
        validator.Setup(x => x.Validate(It.IsAny<ValidationContext<TestRequest>>()))
            .Returns(new ValidationResult(failures));

        var next = new Mock<RequestHandlerDelegate<string>>();

        var behaviour = new ValidationBehaviour<TestRequest, string>(new[] { validator.Object });

        var act = () => behaviour.Handle(new TestRequest(), next.Object, CancellationToken.None);

        await act.Should().ThrowAsync<ValidationException>();
        next.Verify(x => x(), Times.Never);
    }
}
