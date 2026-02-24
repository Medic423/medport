using MediatR;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.EMSAnalytics.Queries.Requests;

public record GetEmsUnitsQuery(Guid AgencyId) : IRequest<EmsUnitsDto>;
