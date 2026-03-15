using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Medport.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TripsCleanup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Trip");

            migrationBuilder.DropTable(
                name: "TripCostBreakdown");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Trip",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PickupLocationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AcceptedTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualEndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualStartTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualTripTimeMinutes = table.Column<int>(type: "int", nullable: true),
                    AssignedAgencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AssignedTo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignedUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BackhaulOpportunity = table.Column<bool>(type: "bit", nullable: false),
                    CompletionTimeMinutes = table.Column<int>(type: "int", nullable: true),
                    CompletionTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomerSatisfaction = table.Column<int>(type: "int", nullable: true),
                    DeadheadMiles = table.Column<double>(type: "float", nullable: true),
                    DestinationLatitude = table.Column<double>(type: "float", nullable: true),
                    DestinationLongitude = table.Column<double>(type: "float", nullable: true),
                    Diagnosis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DistanceMiles = table.Column<double>(type: "float", nullable: true),
                    Efficiency = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    EmsArrivalTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmsDepartureTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedTripTimeMinutes = table.Column<int>(type: "int", nullable: true),
                    FromLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GenerateQRCode = table.Column<bool>(type: "bit", nullable: false),
                    InsuranceCompany = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InsurancePayRate = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    LoadedMiles = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    MaxResponses = table.Column<int>(type: "int", nullable: false),
                    MobilityLevel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MonitoringRequired = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NotificationRadius = table.Column<int>(type: "int", nullable: true),
                    OriginLatitude = table.Column<double>(type: "float", nullable: true),
                    OriginLongitude = table.Column<double>(type: "float", nullable: true),
                    OxygenRequired = table.Column<bool>(type: "bit", nullable: false),
                    PatientAgeCategory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PatientAgeYears = table.Column<int>(type: "int", nullable: true),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientWeight = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PerMileRate = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    PerformanceScore = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    PickupTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QrCodeData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponseDeadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponseStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResponseTimeMinutes = table.Column<int>(type: "int", nullable: true),
                    RevenuePerHour = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    ScheduledTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SelectedAgencies = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    SelectionMode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SpecialNeeds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ToLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TransferAcceptedTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransferRequestTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransportLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TripCost = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    TripNumber = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UrgencyLevel = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trip", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trip_PickupLocation_PickupLocationId",
                        column: x => x.PickupLocationId,
                        principalTable: "PickupLocation",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "TripCostBreakdown",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BaseRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    CalculatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CostCenterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CostCenterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CostPerMile = table.Column<decimal>(type: "decimal(8,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CrewLaborCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    DeadheadMileRatio = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    DeadheadMiles = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    FuelCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    GrossProfit = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    InsuranceAdjustment = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    LoadedMileRatio = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    LoadedMiles = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    MaintenanceCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    MileageRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    OverheadCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    PriorityLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PriorityRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    ProfitMargin = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    RevenuePerMile = table.Column<decimal>(type: "decimal(8,2)", nullable: false),
                    SpecialRequirementsRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    TotalRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    TransportLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TripDistance = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    TripDurationHours = table.Column<decimal>(type: "decimal(4,2)", nullable: false),
                    TripId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UtilizationRate = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    VehicleCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripCostBreakdown", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Trip_PickupLocationId",
                table: "Trip",
                column: "PickupLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Trip_TripNumber",
                table: "Trip",
                column: "TripNumber",
                unique: true);
        }
    }
}
