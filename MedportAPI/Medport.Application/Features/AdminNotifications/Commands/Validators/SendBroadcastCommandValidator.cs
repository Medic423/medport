using FluentValidation;
using Medport.Application.Tracc.Features.AdminNotifications.Commands.Requests;

namespace Medport.Application.Tracc.Features.AdminNotifications.Commands.Validators;

public class SendBroadcastCommandValidator : AbstractValidator<SendBroadcastCommand>
{
    public SendBroadcastCommandValidator()
    {
        RuleFor(x => x.NotificationType)
            .NotEmpty()
            .NotNull();
    }
}