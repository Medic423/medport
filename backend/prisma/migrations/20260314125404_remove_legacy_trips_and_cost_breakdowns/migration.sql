-- DropTable: Remove legacy "trips" table (replaced by "transport_requests")
DROP TABLE IF EXISTS "trips";

-- DropTable: Remove unused "trip_cost_breakdowns" table (all backend methods were stubs)
DROP TABLE IF EXISTS "trip_cost_breakdowns";
