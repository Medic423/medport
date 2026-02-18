using Microsoft.EntityFrameworkCore;

namespace Medport.Common.DTOs;

public class PaginatedList<T>
{
    public IReadOnlyCollection<T> Items { get; }
    public int PageNumber { get; }
    public int TotalPages { get; set;  }
    public int TotalCount { get; set;  }

    public PaginatedList(IReadOnlyCollection<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
    }

    public bool HasPreviousPage => PageNumber > 0;

    public bool HasNextPage => PageNumber < TotalPages - 1; //Page index starts at 0

    public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize, CancellationToken cancellationToken)
    {
        var count = await source.CountAsync(cancellationToken);

        List<T> items = new();

        if (pageSize == -1)
        {
            items = await source.Skip((pageNumber) * pageSize).ToListAsync(cancellationToken);
        }
        else
        {
            items = await source.Skip((pageNumber) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        }

        // Keep here to test
        //var test = source.Skip((pageNumber) * pageSize).Take(pageSize).ToQueryString();

        return new PaginatedList<T>(items, count, pageNumber, pageSize);
    }
}