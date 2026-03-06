using FluentValidation;
using Medport.Application.Tracc.Features.HealthcareLocations.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;

namespace Medport.Application.Tracc.Features.HealthcareLocations.Commands.Validators;

public class CreateHealthcareLocationCommandValidator : AbstractValidator<CreateHealthcareLocationCommand>
{
    public CreateHealthcareLocationCommandValidator()
    {
        RuleFor(x => x.LocationName)
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

        RuleFor(x => x.FacilityType)
            .NotEmpty()
            .NotNull();
    }
}