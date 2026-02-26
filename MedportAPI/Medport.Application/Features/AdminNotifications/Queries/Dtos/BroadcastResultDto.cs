namespace Medport.Application.Tracc.Features.AdminNotifications.Queries.Dtos;

public class BroadcastResultDto
{
    public int TotalSent { get; set; }
    public int Successful { get; set; }
    public int Failed { get; set; }
    public List<ShallowBroadcastResult> Results { get; set; }
}

public class ShallowBroadcastUserResult
{
    public string? Channel { get; set; }
    public bool Success { get; set; } = true;
    public string? Error { get; set; }
}

public class ShallowBroadcastResult
{
    public Guid UserId { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? UserType { get; set; }
    public List<ShallowBroadcastUserResult> Results { get; set; } = [];
}