using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Medport.Application.Common.Common.Behaviours;

public class PerformanceBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
{
    private readonly Stopwatch _timer;
    private readonly ILogger<TRequest> _logger;
    // private readonly MeService _meService;

    public PerformanceBehaviour(
        ILogger<TRequest> logger
    // MeService meService
    )
    {
        _timer = new Stopwatch();

        _logger = logger;
        //_meService = meService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        _timer.Start();

        var response = await next();

        _timer.Stop();

        if (_timer.ElapsedMilliseconds > 30000)
        {
            var name = typeof(TRequest).Name;
            //int? userId = _meService?.user?.UserID ?? 0;

            //_logger.LogWarning("MCL API Long Running Request: {Name} ({ElapsedMilliseconds} milliseconds) {@UserId} {@Request}",
            //    name, _timer.ElapsedMilliseconds, userId, request);
        }

        return response;
    }
}
