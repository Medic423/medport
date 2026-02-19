using FluentValidation;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;

namespace Medport.Application.Tracc.Features.Hospitals.Commands.Validators;
public class UpdateHospitalCommandValidator : AbstractValidator<UpdateHospitalCommand>
{
    public UpdateHospitalCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.Name)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.Address)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.City)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.State)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.ZipCode)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.Type)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.Capabilities)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.Region)
            .MaximumLength(10)
            .NotEmpty()
            .NotNull();
    }
}