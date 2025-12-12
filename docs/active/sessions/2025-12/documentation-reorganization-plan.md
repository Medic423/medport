# Documentation Reorganization Plan
**Date:** December 9, 2025  
**Issue:** Documentation in `/docs` and `/documentation` folders has become disorganized

## Current State Analysis

### `/docs` Folder (48 markdown files)
- **Structure:** Flat - all files in `docs/notes/` (47 files) + 1 root file
- **Content:** Mix of:
  - Recent troubleshooting guides (Azure, migrations, fixes)
  - Feature implementation plans (Category Options, SMS, etc.)
  - Deployment guides
  - Technical reference materials
  - Session notes

### `/documentation` Folder (86 markdown files)
- **Structure:** Partially organized in `documentation/docs-old/`:
  - `archive/` - 25 archived files
  - `notes/` - 39 note files  
  - `reference/` - 9 reference files
  - `users_guide/` - 2 user guide files
  - Root level files (BACKUP_ORGANIZATION_SUMMARY.md, etc.)
- **Content:** Mix of:
  - Historical project documentation
  - Old implementation plans
  - Reference materials
  - User guides

### Issues Identified
1. **Duplication:** Some files may exist in both locations
2. **No clear separation:** Active vs archived vs reference
3. **Flat structure:** Everything in `docs/notes/` makes it hard to find things
4. **"docs-old" naming:** Suggests outdated, but may contain valuable reference material
5. **No date-based organization:** Hard to find recent vs old documents

## Proposed Target Structure

Based on `BACKUP_ORGANIZATION_SUMMARY.md` pattern and `organize-documents.sh` script:

```
docs/
├── active/                    # Current work-in-progress
│   ├── sessions/             # Recent session notes (last 30 days)
│   │   ├── 2025-12/          # Organized by month
│   │   └── category-options-restoration-20251209.md
│   └── features/             # Features in active development
│       ├── category-options/
│       ├── sms-notifications/
│       └── availability-status/
│
├── reference/                 # Technical reference materials
│   ├── azure/                # Azure-specific guides
│   │   ├── database-migration-pgadmin.md
│   │   ├── sms-setup.md
│   │   └── deployment-troubleshooting.md
│   ├── database/             # Database guides
│   │   ├── migrations/
│   │   └── pgadmin/
│   ├── deployment/           # Deployment guides
│   └── development/          # Development workflows
│
├── user-guides/              # End-user documentation
│   ├── healthcare/
│   ├── ems/
│   └── admin/
│
├── archive/                  # Historical documents
│   ├── 2025-12/             # Organized by month
│   ├── 2025-11/
│   └── 2025-10/
│
└── templates/               # Document templates
    ├── feature-spec.md
    ├── bug-report.md
    └── session-summary.md
```

## Reorganization Strategy

### Phase 1: Analyze and Categorize

**Step 1.1: Identify File Categories**
- **Active/Sessions:** Recent session notes (last 30-60 days)
- **Active/Features:** Features currently in development
- **Reference:** Technical guides, how-tos, troubleshooting
- **User Guides:** End-user documentation
- **Archive:** Historical/old documents (>60 days, completed features)

**Step 1.2: Identify Duplicates**
- Compare files in `docs/notes/` vs `documentation/docs-old/notes/`
- Keep most recent version
- Mark older versions for archive

**Step 1.3: Categorize by Content Type**
- **Azure guides:** `reference/azure/`
- **Migration guides:** `reference/database/migrations/`
- **Troubleshooting:** `reference/troubleshooting/`
- **Feature plans:** `active/features/[feature-name]/`
- **Session notes:** `active/sessions/[YYYY-MM]/`
- **Completed features:** `archive/[YYYY-MM]/`

### Phase 2: Create Target Structure

**Step 2.1: Create Directory Structure**
```bash
mkdir -p docs/{active/{sessions,features},reference/{azure,database/{migrations,pgadmin},deployment,development},user-guides/{healthcare,ems,admin},archive,templates}
```

**Step 2.2: Move Templates**
- Move `documentation/tcc-project-docs/templates/*` → `docs/templates/`

### Phase 3: Reorganize Files

**Step 3.1: Process Recent Files (docs/notes/)**

**Category: Azure Guides** → `docs/reference/azure/`
- azure-database-migration-pgadmin.md
- azure-database-connection-troubleshooting.md
- azure-ipv4-vs-ipv6.md
- azure-sms-*.md (all SMS-related)
- azure-privacy-terms-urls.md
- azure-internal-server-error-troubleshooting.md

**Category: Database/Migrations** → `docs/reference/database/migrations/`
- migration-application-guide.md
- migration-success-and-testing.md
- migration-troubleshooting.md
- migrations-complete-restart-azure.md
- fix-p3005-complete.md
- fix-p3009-failed-migration.md
- fix-dropdown-categories-migration-azure.md
- run-prisma-baseline-pgadmin.md
- pgadmin-run-baseline-sql-detailed.md
- pgadmin-execute-query-vs-script.md

**Category: Deployment** → `docs/reference/deployment/`
- deployment-success-summary.md
- how-to-find-github-actions-error.md
- fix-database-url-secret.md
- database-url-secret-value.md

**Category: Active Features** → `docs/active/features/[feature-name]/`
- category-options-restoration-plan.md → `docs/active/features/category-options/`
- phase1-completion-summary.md → `docs/active/features/category-options/`
- phase2-completion-summary.md → `docs/active/features/category-options/`
- phase3-completion-summary.md → `docs/active/features/category-options/`
- end-to-end-testing-guide.md → `docs/active/features/category-options/`

**Category: Session Notes** → `docs/active/sessions/2025-12/`
- Recent troubleshooting sessions
- Recent implementation sessions

**Category: Reference/Technical** → `docs/reference/`
- sms_debugging_summary.md → `docs/reference/development/`
- tracc_comms_initial_prompt.md → `docs/reference/development/`
- tracccomms.md → `docs/reference/development/` (or keep in root if main reference)

**Category: Archive** → `docs/archive/[YYYY-MM]/`
- Old phase completion summaries
- Old implementation plans
- Completed feature documentation

**Step 3.2: Process documentation/docs-old/**

**Keep Organized Structure:**
- `documentation/docs-old/reference/` → Move to `docs/reference/` (merge)
- `documentation/docs-old/users_guide/` → Move to `docs/user-guides/`
- `documentation/docs-old/archive/` → Move to `docs/archive/2025-09/` (or appropriate date)
- `documentation/docs-old/notes/` → Review and categorize:
  - Recent → `docs/active/sessions/` or `docs/active/features/`
  - Old → `docs/archive/[YYYY-MM]/`
  - Reference → `docs/reference/`

**Step 3.3: Handle Root Files**
- `documentation/docs-old/README.md` → Keep as `docs/README.md` (update)
- `documentation/docs-old/BACKUP_ORGANIZATION_SUMMARY.md` → `docs/reference/backup/`
- `documentation/docs-old/CURRENT_PROJECT_STATE.md` → `docs/active/` or archive
- `documentation/docs-old/PRODUCTION_TESTING_TRACKER.md` → `docs/active/` or archive

### Phase 4: Cleanup and Consolidation

**Step 4.1: Remove Duplicates**
- Compare file contents (not just names)
- Keep most recent/complete version
- Archive older versions

**Step 4.2: Update References**
- Update any internal links between documents
- Update README files
- Update backup scripts if they reference doc paths

**Step 4.3: Archive Old Documentation**
- Move `documentation/docs-old/` → `docs/archive/legacy/` (or delete if fully migrated)
- Keep backup scripts in `documentation/scripts/` (not docs)

## Implementation Plan

### Option A: Manual Reorganization (Safer)
1. Create target directory structure
2. Categorize files one by one
3. Move files in batches
4. Test and verify
5. Update references
6. Remove old structure

### Option B: Scripted Reorganization (Faster)
1. Create reorganization script based on file patterns
2. Run script to categorize and move files
3. Review results
4. Manual cleanup of edge cases
5. Update references

### Recommended Approach: Hybrid
1. **Create structure** (scripted)
2. **Categorize recent files** (manual review of docs/notes/)
3. **Move in batches** (scripted with review)
4. **Handle edge cases** (manual)
5. **Update references** (manual)
6. **Archive old structure** (scripted)

## File Categorization Rules

### Active/Sessions (docs/active/sessions/)
- **Criteria:** Created/modified in last 30-60 days
- **Pattern:** Session notes, recent troubleshooting, recent implementations
- **Organization:** By month (YYYY-MM)

### Active/Features (docs/active/features/)
- **Criteria:** Features currently in development or recently completed (<90 days)
- **Pattern:** Feature plans, implementation guides, completion summaries
- **Organization:** By feature name

### Reference (docs/reference/)
- **Criteria:** Technical guides, how-tos, troubleshooting that remain relevant
- **Pattern:** Guides, tutorials, reference materials
- **Organization:** By topic (azure/, database/, deployment/, development/)

### User Guides (docs/user-guides/)
- **Criteria:** End-user documentation
- **Pattern:** User-facing guides, tutorials
- **Organization:** By user type (healthcare/, ems/, admin/)

### Archive (docs/archive/)
- **Criteria:** Historical documents, completed features, old plans
- **Pattern:** Old implementation plans, completed features, historical notes
- **Organization:** By month (YYYY-MM)

## Preservation Strategy

### Before Reorganization
1. **Create backup** of current docs structure
2. **Document current state** (file listing with dates)
3. **Identify critical files** (don't lose these)

### During Reorganization
1. **Move, don't copy** (to avoid duplicates)
2. **Preserve file dates** (use `cp -p` or `mv`)
3. **Log all moves** (create move log)
4. **Test after each batch**

### After Reorganization
1. **Verify all files moved** (compare counts)
2. **Check for broken links** (update internal references)
3. **Update README files**
4. **Archive old structure** (don't delete immediately)

## Success Criteria

✅ All markdown files organized into logical categories  
✅ No duplicates (or duplicates clearly marked)  
✅ Easy to find recent/active documents  
✅ Reference materials easily accessible  
✅ Historical documents preserved in archive  
✅ README files updated  
✅ Internal links still work  
✅ Backup scripts still function  

## Next Steps

1. **Review this plan** - Confirm approach
2. **Create backup** - Backup current docs structure
3. **Create target structure** - Set up new directories
4. **Categorize files** - Review and assign categories
5. **Execute reorganization** - Move files in batches
6. **Update references** - Fix internal links
7. **Test and verify** - Ensure everything works
8. **Archive old structure** - Move or remove docs-old

## Notes

- **Backup scripts** should remain in `documentation/scripts/` (not moved to docs)
- **Templates** should be in `docs/templates/` for easy access
- **Reference materials** should be easily discoverable
- **Active work** should be at the top level for quick access
- **Archive** should preserve history but not clutter active workspace

