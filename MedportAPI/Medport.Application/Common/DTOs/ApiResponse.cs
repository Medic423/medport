namespace Medport.Application.Tracc.Common.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; }

    public T? Data { get; set; }

    public string? Message { get; set; }

    public PaginationDto? Pagination { get; set; }

    public ApiResponse() { }

    public ApiResponse(
        bool success,
        T? data,
        string? message = null,
        PaginationDto? pagination = null)
    {
        Success = success;
        Data = data;
        Message = message;
        Pagination = pagination;
    }

    public static ApiResponse<T> Ok(
        T data,
        string? message = null,
        PaginationDto? pagination = null)
        => new ApiResponse<T>(true, data, message, pagination);

    public static ApiResponse<T> Fail(
        string? message = null)
        => new ApiResponse<T>(false, default, message);
}