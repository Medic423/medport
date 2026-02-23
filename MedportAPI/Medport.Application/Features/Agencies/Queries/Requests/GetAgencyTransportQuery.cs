using MediatR;
using Medport.Application.Tracc.Features.Agencies.Queries.DTOs;
using Medport.Application.Tracc.Features.Hospitals.Queries.Dtos;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.Agencies.Queries.Requests;

/// <summary>
/// See <see cref="GetAgencyTransportQueryHandler"/>
/// </summary>

[ExcludeFromCodeCoverage]
public record GetAgencyTransportQuery(Guid AgencyId): IRequest<List<TransportRequestDto>>;
