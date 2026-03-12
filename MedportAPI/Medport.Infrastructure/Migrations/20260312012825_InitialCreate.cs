using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Medport.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BackhaulOpportunity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TripId1 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TripId2 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RevenueBonus = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Efficiency = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BackhaulOpportunity", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CostCenter",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OverheadRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    FixedCosts = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    VariableCosts = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    AllocationMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CostCenter", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DropdownCategory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DropdownCategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Organization",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    OrganizationType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ZipCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ServiceArea = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OperatingHours = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Capabilities = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PricingStructure = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcceptsNotifications = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AvailableUnits = table.Column<int>(type: "int", nullable: false),
                    TotalUnits = table.Column<int>(type: "int", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    Coordinates = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NotificationMethods = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RequiresReview = table.Column<bool>(type: "bit", nullable: false),
                    ServiceRadius = table.Column<int>(type: "int", nullable: true),
                    AvailabilityStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organization", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PricingModel",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    BaseRates = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PerMileRates = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PriorityMultipliers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PeakHourMultipliers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WeekendMultipliers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SeasonalMultipliers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ZoneMultipliers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DistanceTiers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SpecialRequirements = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsolationPricing = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    BariatricPricing = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    OxygenPricing = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    MonitoringPricing = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    InsuranceRates = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingModel", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RouteOptimizationSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeadheadMileWeight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    WaitTimeWeight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    BackhaulBonusWeight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    OvertimeRiskWeight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    RevenueWeight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    MaxDeadheadMiles = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    MaxWaitTimeMinutes = table.Column<int>(type: "int", nullable: false),
                    MaxOvertimeHours = table.Column<decimal>(type: "decimal(4,2)", nullable: false),
                    MaxResponseTimeMinutes = table.Column<int>(type: "int", nullable: false),
                    MaxServiceDistance = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    BackhaulTimeWindow = table.Column<int>(type: "int", nullable: false),
                    BackhaulDistanceLimit = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    BackhaulRevenueBonus = table.Column<decimal>(type: "decimal(8,2)", nullable: false),
                    EnableBackhaulOptimization = table.Column<bool>(type: "bit", nullable: false),
                    TargetLoadedMileRatio = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    TargetRevenuePerHour = table.Column<decimal>(type: "decimal(8,2)", nullable: false),
                    TargetResponseTime = table.Column<int>(type: "int", nullable: false),
                    TargetEfficiency = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    OptimizationAlgorithm = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaxOptimizationTime = table.Column<int>(type: "int", nullable: false),
                    EnableRealTimeOptimization = table.Column<bool>(type: "bit", nullable: false),
                    CrewAvailabilityWeight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    EquipmentCompatibilityWeight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    PatientPriorityWeight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RouteOptimizationSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemAnalytics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MetricName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MetricValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemAnalytics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TripCostBreakdown",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TripId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BaseRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    MileageRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    PriorityRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    SpecialRequirementsRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    InsuranceAdjustment = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    TotalRevenue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    CrewLaborCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    VehicleCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    FuelCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    MaintenanceCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    OverheadCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    GrossProfit = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    ProfitMargin = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    RevenuePerMile = table.Column<decimal>(type: "decimal(8,2)", nullable: false),
                    CostPerMile = table.Column<decimal>(type: "decimal(8,2)", nullable: false),
                    LoadedMileRatio = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    DeadheadMileRatio = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    UtilizationRate = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    TripDistance = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    LoadedMiles = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    DeadheadMiles = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    TripDurationHours = table.Column<decimal>(type: "decimal(4,2)", nullable: false),
                    TransportLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PriorityLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CostCenterId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CostCenterName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CalculatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripCostBreakdown", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DropdownOption",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Value = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DropdownOption", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DropdownOption_DropdownCategory_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "DropdownCategory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Facility",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FacilityType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ZipCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Capabilities = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Coordinates = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    OperatingHours = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RequiresReview = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facility", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Facility_Organization_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organization",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrganizationPreference",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PreferenceType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TargetOrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationPreference", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationPreference_Organization_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organization",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationPreference_Organization_TargetOrganizationId",
                        column: x => x.TargetOrganizationId,
                        principalTable: "Organization",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Unit",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CurrentStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CurrentLocation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Capabilities = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CrewSize = table.Column<int>(type: "int", nullable: false),
                    Equipment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    LastMaintenance = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextMaintenance = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastStatusUpdate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Unit_Organization_AgencyId",
                        column: x => x.AgencyId,
                        principalTable: "Organization",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MustChangePassword = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastActivity = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                    table.ForeignKey(
                        name: "FK_User_Organization_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organization",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CategoryDefault",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoryDefault", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CategoryDefault_DropdownOption_OptionId",
                        column: x => x.OptionId,
                        principalTable: "DropdownOption",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PickupLocation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FacilityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Floor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Room = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PickupLocation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PickupLocation_Facility_FacilityId",
                        column: x => x.FacilityId,
                        principalTable: "Facility",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UnitAnalytics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PerformanceScore = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Efficiency = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    TotalTrips = table.Column<int>(type: "int", nullable: false),
                    TotalTripsCompleted = table.Column<int>(type: "int", nullable: false),
                    AverageResponseTime = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitAnalytics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UnitAnalytics_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotificationLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotificationType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Channel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeliveredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationLog_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPreference",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PreferenceType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreference", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPreference_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransportRequest",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TripNumber = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", maxLength: 100, nullable: false),
                    PatientWeight = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SpecialNeeds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OriginFacilityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DestinationFacilityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FromLocation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToLocation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FromLocationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsMultiLocationFacility = table.Column<bool>(type: "bit", nullable: false),
                    ScheduledTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransportLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UrgencyLevel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SpecialRequirements = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Diagnosis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MobilityLevel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OxygenRequired = table.Column<bool>(type: "bit", nullable: false),
                    MonitoringRequired = table.Column<bool>(type: "bit", nullable: false),
                    GenerateQRCode = table.Column<bool>(type: "bit", nullable: false),
                    QrCodeData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SelectedAgencies = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    NotificationRadius = table.Column<int>(type: "int", nullable: true),
                    RequestTimestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcceptedTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PickupTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ArrivalTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DepartureTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletionTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HealthcareCompletionTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmsCompletionTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PickupLocationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AssignedAgencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AssignedUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Isolation = table.Column<bool>(type: "bit", nullable: false),
                    Bariatric = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PatientAgeYears = table.Column<int>(type: "int", nullable: true),
                    PatientAgeCategory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportRequest", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportRequest_Facility_DestinationFacilityId",
                        column: x => x.DestinationFacilityId,
                        principalTable: "Facility",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TransportRequest_Facility_FromLocationId",
                        column: x => x.FromLocationId,
                        principalTable: "Facility",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TransportRequest_Facility_OriginFacilityId",
                        column: x => x.OriginFacilityId,
                        principalTable: "Facility",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TransportRequest_PickupLocation_PickupLocationId",
                        column: x => x.PickupLocationId,
                        principalTable: "PickupLocation",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TransportRequest_Unit_AssignedUnitId",
                        column: x => x.AssignedUnitId,
                        principalTable: "Unit",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TransportRequest_User_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "User",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Trip",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TripNumber = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientWeight = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SpecialNeeds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FromLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ToLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScheduledTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TransportLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UrgencyLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Diagnosis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MobilityLevel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OxygenRequired = table.Column<bool>(type: "bit", nullable: false),
                    MonitoringRequired = table.Column<bool>(type: "bit", nullable: false),
                    GenerateQRCode = table.Column<bool>(type: "bit", nullable: false),
                    QrCodeData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SelectedAgencies = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    NotificationRadius = table.Column<int>(type: "int", nullable: true),
                    TransferRequestTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TransferAcceptedTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmsArrivalTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmsDepartureTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualStartTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActualEndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignedTo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignedAgencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AssignedUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AcceptedTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PickupTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletionTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActualTripTimeMinutes = table.Column<int>(type: "int", nullable: true),
                    BackhaulOpportunity = table.Column<bool>(type: "bit", nullable: false),
                    CompletionTimeMinutes = table.Column<int>(type: "int", nullable: true),
                    CustomerSatisfaction = table.Column<int>(type: "int", nullable: true),
                    DeadheadMiles = table.Column<double>(type: "float", nullable: true),
                    DestinationLatitude = table.Column<double>(type: "float", nullable: true),
                    DestinationLongitude = table.Column<double>(type: "float", nullable: true),
                    DistanceMiles = table.Column<double>(type: "float", nullable: true),
                    Efficiency = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    EstimatedTripTimeMinutes = table.Column<int>(type: "int", nullable: true),
                    InsuranceCompany = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InsurancePayRate = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    LoadedMiles = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    OriginLatitude = table.Column<double>(type: "float", nullable: true),
                    OriginLongitude = table.Column<double>(type: "float", nullable: true),
                    PerMileRate = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    PerformanceScore = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    RequestTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponseTimeMinutes = table.Column<int>(type: "int", nullable: true),
                    RevenuePerHour = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    TripCost = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    PickupLocationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PatientAgeYears = table.Column<int>(type: "int", nullable: true),
                    PatientAgeCategory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaxResponses = table.Column<int>(type: "int", nullable: false),
                    ResponseDeadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponseStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SelectionMode = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                name: "AgencyResponse",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TripId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AgencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Response = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ResponseTimestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResponseNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EstimatedArrival = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsSelected = table.Column<bool>(type: "bit", nullable: false),
                    AssignedUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgencyResponse", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AgencyResponse_TransportRequest_TripId",
                        column: x => x.TripId,
                        principalTable: "TransportRequest",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AgencyResponse_Unit_AssignedUnitId",
                        column: x => x.AssignedUnitId,
                        principalTable: "Unit",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AgencyResponse_AssignedUnitId",
                table: "AgencyResponse",
                column: "AssignedUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_AgencyResponse_TripId",
                table: "AgencyResponse",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_CategoryDefault_Category",
                table: "CategoryDefault",
                column: "Category",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CategoryDefault_OptionId",
                table: "CategoryDefault",
                column: "OptionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CostCenter_Code",
                table: "CostCenter",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DropdownCategory_Slug",
                table: "DropdownCategory",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DropdownOption_Category",
                table: "DropdownOption",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_DropdownOption_Category_Value",
                table: "DropdownOption",
                columns: new[] { "Category", "Value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DropdownOption_CategoryId",
                table: "DropdownOption",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Facility_FacilityType",
                table: "Facility",
                column: "FacilityType");

            migrationBuilder.CreateIndex(
                name: "IX_Facility_IsActive",
                table: "Facility",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Facility_OrganizationId",
                table: "Facility",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationLog_UserId",
                table: "NotificationLog",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Organization_IsActive",
                table: "Organization",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Organization_OrganizationType",
                table: "Organization",
                column: "OrganizationType");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationPreference_OrganizationId",
                table: "OrganizationPreference",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationPreference_OrganizationId_PreferenceType_TargetOrganizationId",
                table: "OrganizationPreference",
                columns: new[] { "OrganizationId", "PreferenceType", "TargetOrganizationId" },
                unique: true,
                filter: "[TargetOrganizationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationPreference_TargetOrganizationId",
                table: "OrganizationPreference",
                column: "TargetOrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_PickupLocation_FacilityId",
                table: "PickupLocation",
                column: "FacilityId");

            migrationBuilder.CreateIndex(
                name: "IX_PickupLocation_IsActive",
                table: "PickupLocation",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_AssignedUnitId",
                table: "TransportRequest",
                column: "AssignedUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_CreatedByUserId",
                table: "TransportRequest",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_DestinationFacilityId",
                table: "TransportRequest",
                column: "DestinationFacilityId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_FromLocationId",
                table: "TransportRequest",
                column: "FromLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_IsMultiLocationFacility",
                table: "TransportRequest",
                column: "IsMultiLocationFacility");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_OriginFacilityId",
                table: "TransportRequest",
                column: "OriginFacilityId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_PickupLocationId",
                table: "TransportRequest",
                column: "PickupLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_RequestTimestamp",
                table: "TransportRequest",
                column: "RequestTimestamp");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_Status",
                table: "TransportRequest",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRequest_TripNumber",
                table: "TransportRequest",
                column: "TripNumber",
                unique: true,
                filter: "[TripNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Trip_PickupLocationId",
                table: "Trip",
                column: "PickupLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Trip_TripNumber",
                table: "Trip",
                column: "TripNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Unit_AgencyId",
                table: "Unit",
                column: "AgencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Unit_AgencyId_UnitNumber",
                table: "Unit",
                columns: new[] { "AgencyId", "UnitNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Unit_Status",
                table: "Unit",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_UnitAnalytics_UnitId",
                table: "UnitAnalytics",
                column: "UnitId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_Email",
                table: "User",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_IsDeleted",
                table: "User",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_User_LastActivity",
                table: "User",
                column: "LastActivity");

            migrationBuilder.CreateIndex(
                name: "IX_User_LastLogin",
                table: "User",
                column: "LastLogin");

            migrationBuilder.CreateIndex(
                name: "IX_User_OrganizationId",
                table: "User",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPreference_UserId",
                table: "UserPreference",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPreference_UserId_PreferenceType",
                table: "UserPreference",
                columns: new[] { "UserId", "PreferenceType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgencyResponse");

            migrationBuilder.DropTable(
                name: "BackhaulOpportunity");

            migrationBuilder.DropTable(
                name: "CategoryDefault");

            migrationBuilder.DropTable(
                name: "CostCenter");

            migrationBuilder.DropTable(
                name: "NotificationLog");

            migrationBuilder.DropTable(
                name: "OrganizationPreference");

            migrationBuilder.DropTable(
                name: "PricingModel");

            migrationBuilder.DropTable(
                name: "RouteOptimizationSettings");

            migrationBuilder.DropTable(
                name: "SystemAnalytics");

            migrationBuilder.DropTable(
                name: "Trip");

            migrationBuilder.DropTable(
                name: "TripCostBreakdown");

            migrationBuilder.DropTable(
                name: "UnitAnalytics");

            migrationBuilder.DropTable(
                name: "UserPreference");

            migrationBuilder.DropTable(
                name: "TransportRequest");

            migrationBuilder.DropTable(
                name: "DropdownOption");

            migrationBuilder.DropTable(
                name: "PickupLocation");

            migrationBuilder.DropTable(
                name: "Unit");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "DropdownCategory");

            migrationBuilder.DropTable(
                name: "Facility");

            migrationBuilder.DropTable(
                name: "Organization");
        }
    }
}
