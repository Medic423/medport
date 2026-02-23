using System.Threading.Tasks;

namespace Medport.Infrastructure.Persistence.SeedData
{
    /// <summary>
    /// Interface for data seeders that populate the database with test/seed data.
    /// </summary>
    public interface IDataSeeder
    {
        /// <summary>
        /// Executes the seeding operation.
        /// </summary>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SeedAsync();
    }
}