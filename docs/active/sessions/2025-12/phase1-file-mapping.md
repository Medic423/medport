# Phase 1: File-to-Category Mapping
**Date:** December 9, 2025

## File Categorization Rules Applied

### Category: Active/Sessions (Recent work, last 60 days)
**Destination:** `docs/active/sessions/2025-12/`

**Files:**
- category-options-restoration-plan.md (Dec 9, 2025)
- phase1-completion-summary.md (Dec 9, 2025)
- phase2-completion-summary.md (Dec 9, 2025)
- phase3-completion-summary.md (Dec 9, 2025)
- end-to-end-testing-guide.md (Dec 9, 2025)
- fix-p3009-failed-migration.md (Dec 9, 2025)
- fix-dropdown-categories-migration-azure.md (Dec 9, 2025)
- pgadmin-execute-query-vs-script.md (Dec 9, 2025)
- migration-success-and-testing.md (Dec 9, 2025)
- migration-application-guide.md (Dec 9, 2025)

### Category: Active/Features/Category-Options
**Destination:** `docs/active/features/category-options/`

**Files:**
- category-options-restoration-plan.md
- phase1-completion-summary.md
- phase2-completion-summary.md
- phase3-completion-summary.md
- end-to-end-testing-guide.md

### Category: Active/Features/Availability-Status
**Destination:** `docs/active/features/availability-status/`

**Files:**
- phase1-availability-status-implementation.md
- phase2-availability-status-frontend.md

### Category: Reference/Azure
**Destination:** `docs/reference/azure/`

**Files:**
- azure-database-connection-troubleshooting.md
- azure-database-migration-pgadmin.md
- azure-internal-server-error-troubleshooting.md
- azure-ipv4-vs-ipv6.md
- azure-privacy-terms-urls.md
- azure-sms-env-vars-setup.md
- azure-sms-message-templates.md
- azure-sms-opt-in-screenshot-guide.md
- azure-sms-templates-submission.md
- azure-sms-toll-free-verification.md
- apple-private-relay-azure-connection.md

### Category: Reference/Database/Migrations
**Destination:** `docs/reference/database/migrations/`

**Files:**
- migration-application-guide.md
- migration-success-and-testing.md
- migration-troubleshooting.md
- migrations-complete-restart-azure.md
- fix-p3005-complete.md
- fix-p3009-failed-migration.md
- fix-dropdown-categories-migration-azure.md

### Category: Reference/Database/pgAdmin
**Destination:** `docs/reference/database/pgadmin/`

**Files:**
- run-prisma-baseline-pgadmin.md
- pgadmin-run-baseline-sql-detailed.md
- pgadmin-execute-query-vs-script.md
- azure-database-migration-pgadmin.md (also Azure-related, but pgAdmin specific)

### Category: Reference/Deployment
**Destination:** `docs/reference/deployment/`

**Files:**
- deployment-success-summary.md
- how-to-find-github-actions-error.md
- fix-database-url-secret.md
- database-url-secret-value.md
- login-error-after-deployment.md

### Category: Reference/Development
**Destination:** `docs/reference/development/`

**Files:**
- sms_debugging_summary.md
- tracc_comms_initial_prompt.md
- tracccomms.md (root level, keep as main reference)
- baseline-success-verification.md
- backup-azure-before-baseline.md
- backup_strategy_duplicates_analysis.md

### Category: User Guides
**Destination:** `docs/user-guides/`

**Files:**
- help_content_outlines.md (keep most recent version)
- help_system_implementation_plan.md (keep most recent version)
- notification_plan.md
- user_deletion_analysis.md
- From docs-old/users_guide/:
  - revenue_calculation_settings.md
  - trip_creation_hybrid.md

### Category: Archive
**Destination:** `docs/archive/[YYYY-MM]/`

**Files to Archive:**
- All files from `documentation/docs-old/archive/` → `docs/archive/2025-09/` (or appropriate date)
- Old phase completion summaries
- Historical project documents
- Completed feature documentation

### Category: Templates
**Destination:** `docs/templates/`

**Files:**
- Move all from `documentation/tcc-project-docs/templates/`:
  - api-documentation.md
  - bug-report.md
  - feature-spec.md
  - README.md
  - session-summary.md
  - user-guide.md

### Category: Reference/Backup
**Destination:** `docs/reference/backup/`

**Files:**
- BACKUP_ORGANIZATION_SUMMARY.md (from docs-old root)
- From docs-old/reference/:
  - BACKUP_STRATEGY.md
  - BACKUP_ORGANIZATION_GUIDE.md

### Category: Reference/General
**Destination:** `docs/reference/`

**Files:**
- From docs-old/reference/:
  - DEVELOPER_QUICK_START.md
  - DEVELOPMENT_WORKFLOW.md
  - DATABASE_PROTECTION_RULES.md
  - COMPREHENSIVE_MONITORING.md
  - README_PRODUCTION.md
  - git_pr_instructions.md
  - server-process-conflicts.md

## Duplicate Resolution

### help_content_outlines.md
- **Location 1:** `docs/notes/help_content_outlines.md`
- **Location 2:** `documentation/docs-old/notes/help_content_outlines.md`
- **Action:** Compare dates, keep most recent, archive older

### help_system_implementation_plan.md
- **Location 1:** `docs/notes/help_system_implementation_plan.md`
- **Location 2:** `documentation/docs-old/notes/help_system_implementation_plan.md`
- **Action:** Compare dates, keep most recent, archive older

## Files Requiring Special Handling

### Root Level Files
- `docs/tracccomms.md` - Keep in root (main reference document)
- `documentation/docs-old/README.md` - Update and move to `docs/README.md`
- `documentation/docs-old/CURRENT_PROJECT_STATE.md` - Review, may archive or keep in active
- `documentation/docs-old/GIT_RECOVERY_SUMMARY.md` - Archive
- `documentation/docs-old/PRODUCTION_TESTING_TRACKER.md` - Review, may keep in active or archive

## Summary Statistics

- **Total files to organize:** ~134 markdown files
- **Files in docs/notes/:** 47
- **Files in documentation/docs-old/:** 80
- **Templates:** 6
- **Duplicates found:** 2 confirmed
- **Categories needed:** 10+ categories

## Next Phase

After approval, proceed to Phase 2: Create Target Structure

