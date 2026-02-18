namespace Medport.Application.Tracc.Common.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; }

    public T? Data { get; set; }

    public ApiResponse() { }

    public ApiResponse(bool success, T? data)
    {
        Success = success;
        Data = data;
    }

    public static ApiResponse<T> Ok(T data)
        => new ApiResponse<T>(true, data);

    public static ApiResponse<T> Fail()
        => new ApiResponse<T>(false, default);
}


