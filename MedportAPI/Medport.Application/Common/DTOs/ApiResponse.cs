namespace Medport.Application.Tracc.Common.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; }

    public T? Data { get; set; }

    public PaginationDto? Pagination { get; set; }

    public ApiResponse() { }

    public ApiResponse(bool success, T? data, PaginationDto? pagination = null)
    {
        Success = success;
        Data = data;
        Pagination = pagination;
    }

    public static ApiResponse<T> Ok(T data, PaginationDto? pagination = null)
        => new ApiResponse<T>(true, data, pagination);

    public static ApiResponse<T> Fail()
        => new ApiResponse<T>(false, default);
}