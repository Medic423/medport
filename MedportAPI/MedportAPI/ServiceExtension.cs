using Medport.API.Tracc.CustomAttributes;
using Medport.API.Tracc.Infrastructure;
using Medport.Application.Common;
using Medport.Application.Tracc;
using Medport.Application.Tracc.Features.AgencyResponses.Mappings;
using Medport.Infrastructure;
using Medport.Infrastructure.Azure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics.CodeAnalysis;
using System.Text;

namespace Medport.API.Tracc;

[ExcludeFromCodeCoverage]
public static class ServiceExtensions
{
    public static void RegisterClasses(this IServiceCollection services)
    {
        // Services
        services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        //services.AddScoped<AuthenticationService, AuthenticationService>();
        //services.AddScoped<IMeService, MCL.Application.Hero.Common.Helpers.MeService>();
        //services.AddScoped<MCL.Application.Hero.Common.Helpers.MeService, MCL.Application.Hero.Common.Helpers.MeService>();
        //services.AddScoped<ILoginData, LoginData>();

        services.AddCors();

        services.AddScoped<ModelValidationAttribute>();

        services.AddAzureInfrastructureServices();
        //services.InstantiateApplicationHeroSettings(Configuration);
        
        /// TODO

        services.AddAutoMapper(cfg =>
        {
            //cfg.LicenseKey = "<Your-License-Key-Here>"; // Register for a license key at AutoMapper.io
        }, typeof(AgencyResponsesMappingProfile).Assembly); // Scans the assembly for classes inheriting from Profile


        services.AddApplicationServices();
        services.AddApplicationCommonServices();

        //services.InstantiateApplicationCommonSettings(Configuration);
        services.AddInfrastructureServices();

        services.AddHttpClient();
        services.AddAzureInfrastructureTypedHttpClients();

        // Removed recursive self-call:
        // services.RegisterClasses();

        //services.AddControllers(options =>
        //{
        //    options.AllowEmptyInputInBodyModelBinding = true;
        //    options.Filters.Add(new ProducesAttribute("application/json"));
        //}).AddNewtonsoftJson(_ => _.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

        //services.AddWorkerServices();

        services.RegisterAuth();

        services.AddSignalR();

        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.SuppressModelStateInvalidFilter = true;
        });

    }

    public static void RegisterAuth(this IServiceCollection services)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;

            string jwtString = Environment.GetEnvironmentVariable("JWT_SECRET");
            var jwtBytes = Encoding.ASCII.GetBytes(jwtString);

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                ValidateIssuer = false,
                ValidateAudience = false,
                IssuerSigningKey =
                    new SymmetricSecurityKey(jwtBytes)
            };
        });
    }

}