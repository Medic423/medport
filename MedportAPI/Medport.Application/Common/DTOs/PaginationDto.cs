namespace Medport.Application.Tracc.Common.DTOs;

public class PaginationDto
{
    public int Page { get; set; }
    public int TotalPages { get; set; }
    public int Total { get; set; }
    public int Limit { get; set; }

    public PaginationDto() { }

    public PaginationDto(int page, int totalPages, int total, int limit)
    {
        Page = page;
        TotalPages = totalPages;
        Total = total;
        Limit = limit;
    }
}