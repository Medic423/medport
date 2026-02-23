using Medport.Infrastructure.Persistence;
using Medport.Infrastructure.Persistence.SeedData;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Add persistence services (database context and seeders)
builder.Services.AddPersistenceServices();

// Add database context
builder.Services.AddDbContext<MedportDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("MedportConnection");
    options.UseSqlServer(connectionString);
});

var app = builder.Build();

// Apply database seeding on startup
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
    // Seed the database with test data
    await app.ApplyDatabaseSeedingAsync();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
