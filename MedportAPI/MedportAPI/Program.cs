using Medport.API.Tracc;
using Medport.API.Tracc.CustomAttributes;
using Microsoft.EntityFrameworkCore;
using Medport.Infrastructure.Persistence.EntityFramework;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // exact origin of your frontend
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // only if you actually send credentials
    });
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.RegisterClasses(builder.Configuration);

var app = builder.Build();

app.UseCors("LocalDev");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "OpenAPI V1");
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
