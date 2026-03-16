using FluentValidation;
using Medport.Application.Tracc.Features.Facilities.Commands.Requests;
using Medport.Application.Tracc.Features.Hospitals.Commands.Requests;

namespace Medport.Application.Tracc.Features.Facilities.Commands.Validators;

public class CreateFacilityCommandValidator : AbstractValidator<CreateFacilityCommand>
{
    public CreateFacilityCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.OrganizationId)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.FacilityType)
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

        RuleFor(x => x.Capabilities)
            .NotEmpty()
            .NotNull();
    }
}