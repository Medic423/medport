using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Diagnostics.CodeAnalysis;
using Medport.Infrastructure;
using Medport.Application.Common;
using Medport.Application.Tracc;
using Medport.Infrastructure.Azure;
using Medport.API.Tracc.Infrastructure;


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

        services.AddAzureInfrastructureServices();
        //services.InstantiateApplicationHeroSettings(Configuration);
        
        /// TODO
        //services.AddAutoMapper(new[] { typeof(LegacyMappingProfile), typeof(AppCodeProfile) });

        services.AddApplicationServices();
        services.AddApplicationCommonServices();

        //services.InstantiateApplicationCommonSettings(Configuration);
        services.AddInfrastructureServices();

        services.AddHttpClient();
        services.AddAzureInfrastructureTypedHttpClients();

        services.RegisterClasses();

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
        //services.AddScoped<ModelValidationAttribute>();

        //services.AddSwaggerGen(_ =>
        //{
        //    _.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        //    {
        //        In = ParameterLocation.Header,
        //        Description = "Please enter token",
        //        Name = "Authorization",
        //        Type = SecuritySchemeType.Http,
        //        BearerFormat = "JWT",
        //        Scheme = "bearer"
        //    });

        //    _.AddSecurityRequirement(new OpenApiSecurityRequirement
        //        {
        //            {
        //                new OpenApiSecurityScheme
        //                {
        //                    Reference = new OpenApiReference
        //                    {
        //                        Type=ReferenceType.SecurityScheme,
        //                        Id="Bearer"
        //                    }
        //                },
        //                new string[]{}
        //            }
        //        });
        //});

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

            //TODO
            //IMCLSettings mclSettings = services.BuildServiceProvider().GetRequiredService<IMCLSettings>();
            //string jwtString = mclSettings.GetSetting(EnvironmentKeyVaultSecretNames.JWTToken);
            //var jwtBytes = Encoding.ASCII.GetBytes(jwtString);

            //options.TokenValidationParameters = new TokenValidationParameters
            //{
            //    ValidateIssuerSigningKey = true,
            //    ValidateIssuer = false,
            //    ValidateAudience = false,
            //    IssuerSigningKey =
            //        new SymmetricSecurityKey(jwtBytes)
            //};
        });
    }

}