using MediatR.Pipeline;
using Microsoft.Extensions.Logging;

namespace Medport.Application.Common.Common.Behaviours;

public class RequestLogger<TRequest> : IRequestPreProcessor<TRequest>
{
    private readonly ILogger _logger;
    //private readonly MeService _meService;

    public RequestLogger(
        ILogger<TRequest> logger
    //MeService meService
    )
    {
        _logger = logger;
        // _meService = meService;
    }

    public Task Process(TRequest request, CancellationToken cancellationToken)
    {
        string name = typeof(TRequest).Name;
        //int? userId = _meService?.user?.UserID ?? 0;

        //_logger.LogInformation("MCL Request: {Name} {@UserId} {@Request}",
        //    name, userId, request);

        return Task.CompletedTask;
    }
}
