using MediatR;
using Medport.Application.Tracc.Features.EMSAnalytics.Queries.Dtos;
using System;

namespace Medport.Application.Tracc.Features.EMSAnalytics.Queries.Requests;

public record GetEmsTripsQuery(Guid AgencyId) : IRequest<EmsTripsDto>;
