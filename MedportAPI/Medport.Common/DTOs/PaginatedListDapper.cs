namespace Medport.Common.DTOs;
public class PaginatedListDapper<T>(
    IReadOnlyCollection<T> items,
    int count = 0,
    int pageNumber = 0,
    int pageSize = 10
)
{
    public IReadOnlyCollection<T> Items { get; } = items;
    public int PageNumber { get; } = pageNumber;
    public int TotalPages { get; } = (int)Math.Ceiling(count / (double)pageSize);
    public int TotalCount { get; } = count;

    public bool HasPreviousPage => PageNumber > 0;
    public bool HasNextPage => PageNumber < TotalPages - 1; // Page index starts at 0
}

public class PaginatedListDapper<T, Y>(
    IReadOnlyCollection<T> items,
    Y? totals = default,
    int count = 0,
    int pageNumber = 0,
    int pageSize = 10
)
{
    public IReadOnlyCollection<T> Items { get; } = items;
    public Y? Totals { get; } = totals;
    public int PageNumber { get; } = pageNumber;
    public int TotalPages { get; } = (int)Math.Ceiling(count / (double)pageSize);
    public int TotalCount { get; } = count;

    public bool HasPreviousPage => PageNumber > 0;
    public bool HasNextPage => PageNumber < TotalPages - 1; // Page index starts at 0
}