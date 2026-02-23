using Microsoft.Extensions.DependencyInjection;

namespace Medport.Infrastructure.Persistence.SeedData
{
    /// <summary>
    /// Extension methods for registering persistence services in the dependency injection container.
    /// </summary>
    public static class PersistenceServiceCollectionExtensions
    {
        /// <summary>
        /// Adds all persistence-related services to the dependency injection container.
        /// This includes the database context, seeding infrastructure, and all individual seeders.
        /// </summary>
        /// <param name="services">The service collection to add services to</param>
        /// <returns>The service collection for method chaining</returns>
        public static IServiceCollection AddPersistenceServices(
            this IServiceCollection services)
        {
            // Register the database context (scoped - one per request)
            services.AddScoped<MedportDbContext>();

            // Register individual seeders (scoped - isolated database context per seed operation)
            // Seeders are ordered by their dependencies:
            services.AddScoped<UserSeeder>();
            services.AddScoped<FacilitySeeder>();
            services.AddScoped<EMSAgencySeeder>();
            services.AddScoped<DropdownSeeder>();
            services.AddScoped<PickupLocationSeeder>();
            services.AddScoped<TransportRequestSeeder>();

            // Register the main database seeder (scoped - orchestrates all seeders)
            // DatabaseSeeder depends on all individual seeders, so register it last
            services.AddScoped<DatabaseSeeder>();

            return services;
        }

        /// <summary>
        /// Applies database seeding on application startup.
        /// Call this after building the host in Program.cs.
        /// </summary>
        /// <example>
        /// <code>
        /// var builder = WebApplicationBuilder.CreateBuilder(args);
        /// builder.Services.AddPersistenceServices();
        /// var app = builder.Build();
        /// 
        /// if (app.Environment.IsDevelopment())
        /// {
        ///     await app.ApplyDatabaseSeedingAsync();
        /// }
        /// 
        /// app.Run();
        /// </code>
        /// </example>
        /// <param name="host">The application host</param>
        /// <returns>The host for method chaining</returns>
        public static async Task ApplyDatabaseSeedingAsync(this IHost host)
        {
            using (var scope = host.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
                await seeder.SeedAsync();
            }
        }
    }
}