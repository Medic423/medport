using MediatR;
using System.Collections.Generic;

namespace Medport.Application.Tracc.Features.Public.Queries.Requests;

public record GetHospitalsQuery() : IRequest<IEnumerable<Medport.Application.Tracc.Features.Public.Queries.Dtos.HospitalPublicDto>>;
