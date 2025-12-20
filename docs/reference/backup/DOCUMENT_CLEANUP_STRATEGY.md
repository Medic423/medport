# Document Cleanup Strategy

**Date:** December 12, 2025  
**Purpose:** Defines how markdown documents in the project `/docs` directory are organized before backup

## Overview

Before creating a backup, all markdown documents in the project's `/docs` directory are automatically organized to ensure:
- **Consistency:** Documents are in predictable locations
- **No Duplicates:** Duplicate files are detected and removed
- **Proper Archiving:** Old documents are moved to archive
- **Easy Restoration:** Restored backups have clean, organized documentation

## Organization Process

### When It Runs

Document organization runs automatically **before every backup** via the `backup-enhanced.sh` script:

1. **Project Documents:** `/docs` folder is organized using `scripts/organize-project-docs.sh`
2. **External Documents:** External docs directory (if exists) is organized using `documentation/scripts/organize-documents.sh`

### How It Works

The organization script (`scripts/organize-project-docs.sh`):

1. **Scans** `docs/notes/` for unorganized markdown files
2. **Classifies** each file based on filename patterns and content
3. **Checks** for duplicates in target locations
4. **Moves** files to appropriate directories
5. **Removes** duplicate files (keeps the one in organized location)

## Document Categories

### Active Documents (`docs/active/`)

**Purpose:** Current work-in-progress documents

#### `active/features/[feature-name]/`
- Feature implementation plans
- Phase completion summaries
- End-to-end testing guides
- **Criteria:** Features currently in development or recently completed (<90 days)

#### `active/sessions/[YYYY-MM]/`
- Session notes and logs
- Reorganization logs
- Implementation plans
- **Criteria:** Created/modified in last 60 days, organized by month

### Reference Documents (`docs/reference/`)

**Purpose:** Technical reference materials that remain relevant

#### `reference/azure/`
- Azure-specific guides
- Azure troubleshooting
- Azure configuration

#### `reference/database/migrations/`
- Migration guides
- Migration troubleshooting
- Migration application instructions

#### `reference/database/pgadmin/`
- pgAdmin usage guides
- Database management procedures

#### `reference/deployment/`
- Deployment guides
- Deployment troubleshooting
- Production configuration

#### `reference/development/`
- Development workflows
- Debugging guides
- Development best practices

#### `reference/backup/`
- Backup strategies
- Restore instructions
- Backup organization guides

### Archive Documents (`docs/archive/`)

**Purpose:** Historical documents, completed features, old plans

#### `archive/[YYYY-MM]/`
- Documents older than 60 days
- Completed features
- Historical session notes
- **Organization:** By year-month (e.g., `2025-12/`)

#### `archive/legacy/`
- Very old documents
- Legacy documentation
- Pre-reorganization files

## Classification Rules

### By Filename Pattern

| Pattern | Category | Example |
|---------|----------|---------|
| `phase*-completion-summary.md` | `active/features/[feature-name]/` | `phase1-completion-summary.md` |
| `end-to-end-testing*.md` | `active/features/[feature-name]/` | `end-to-end-testing-guide.md` |
| `migration*.md` | `reference/database/migrations/` | `migration-application-guide.md` |
| `azure-*.md` | `reference/azure/` | `azure-sms-setup.md` |
| `deploy*.md` | `reference/deployment/` | `deployment-success-summary.md` |
| `restore*.md` | `reference/backup/` or `archive/` | `restore-instructions.md` |
| `reorganization*.md` | `active/sessions/[YYYY-MM]/` | `phase3-reorganization-log.md` |
| `*implementation*plan.md` | `active/sessions/[YYYY-MM]/` | `special-needs-safe-reimplementation-plan.md` |

### By Content Analysis

For files that don't match patterns, the script analyzes content:

- **Category Options:** Files mentioning "category-options" or "dropdown.*categor" → `active/features/category-options/`
- **Availability Status:** Files mentioning "availability.*status" → `active/features/availability-status/`

### By Age

- **< 60 days:** Active location (`active/features/` or `active/sessions/`)
- **> 60 days:** Archive location (`archive/[YYYY-MM]/`)

## Duplicate Detection

### How Duplicates Are Detected

1. **Filename Match:** Script checks if file with same name exists in target location
2. **Content Comparison:** Uses `diff` to compare file contents
3. **Decision:**
   - **Identical:** Removes duplicate from `docs/notes/`
   - **Different:** Skips move, warns user
   - **Unique:** Moves file to target location

### Duplicate Resolution

- **Keeps:** File in organized location (e.g., `active/features/category-options/`)
- **Removes:** Duplicate in `docs/notes/`
- **Logs:** All duplicate removals are logged

## Archive Criteria

Documents are moved to archive when:

1. **Age:** Modified more than 60 days ago (configurable via `--archive-days`)
2. **Completion:** Feature is completed (determined by content or location)
3. **Status:** Document is marked as historical

Archive location is determined by file modification date:
- File modified in December 2025 → `archive/2025-12/`
- File modified in November 2025 → `archive/2025-11/`

## Manual Organization

### Dry Run

Test what would happen without making changes:

```bash
./scripts/organize-project-docs.sh --dry-run
```

### Force Organization

Organize documents without confirmation:

```bash
./scripts/organize-project-docs.sh --force
```

### Custom Archive Days

Archive documents older than specified days:

```bash
./scripts/organize-project-docs.sh --archive-days 90
```

## Integration with Backup

### Automatic Execution

The backup script (`documentation/backup-enhanced.sh`) automatically:

1. Calls `scripts/organize-project-docs.sh --force` before backup
2. Calls `documentation/scripts/organize-documents.sh --force` for external docs
3. Creates backup with organized documentation

### Benefits

- **Clean Backups:** Every backup has organized documentation
- **Easy Restoration:** Restored backups are immediately usable
- **No Manual Work:** Organization happens automatically
- **Consistent Structure:** All backups have same organization

## File Locations After Organization

### Before Organization

```
docs/
└── notes/
    ├── phase1-completion-summary.md
    ├── migration-application-guide.md
    ├── azure-sms-setup.md
    └── ...
```

### After Organization

```
docs/
├── active/
│   ├── features/
│   │   └── category-options/
│   │       └── phase1-completion-summary.md
│   └── sessions/
│       └── 2025-12/
│           └── ...
├── reference/
│   ├── database/
│   │   └── migrations/
│   │       └── migration-application-guide.md
│   └── azure/
│       └── azure-sms-setup.md
└── notes/
    └── (empty - all files organized)
```

## Maintenance

### Regular Cleanup

- **Automatic:** Runs before every backup
- **Manual:** Can be run anytime with `./scripts/organize-project-docs.sh`

### Monitoring

Check organization status:

```bash
# Count files in notes (should be 0 or very few)
ls docs/notes/*.md 2>/dev/null | wc -l

# View organization summary
./scripts/organize-project-docs.sh --dry-run
```

## Troubleshooting

### Files Not Organized

**Problem:** Files remain in `docs/notes/` after organization

**Solutions:**
1. Check if file matches classification rules
2. Verify file is not a duplicate
3. Run with `--dry-run` to see why file is skipped
4. Manually move file if needed

### Duplicate Detection Issues

**Problem:** Script doesn't detect duplicates

**Solutions:**
1. Verify files are truly identical (use `diff`)
2. Check file permissions
3. Ensure script has read access to both files

### Archive Date Issues

**Problem:** Files archived to wrong date folder

**Solutions:**
1. Check file modification date: `stat -f "%Sm" filename`
2. Adjust `--archive-days` if needed
3. Manually move to correct archive folder

## Best Practices

1. **Run Before Major Changes:** Organize docs before large feature work
2. **Review Dry Run:** Always check `--dry-run` output before running
3. **Keep Notes Empty:** `docs/notes/` should only contain temporary files
4. **Regular Cleanup:** Don't let `docs/notes/` accumulate files
5. **Document New Patterns:** Update classification rules for new document types

## Related Documentation

- **Backup Strategy:** See `BACKUP_STRATEGY.md`
- **Backup Organization:** See `BACKUP_ORGANIZATION_GUIDE.md`
- **Script Location:** `scripts/organize-project-docs.sh`

---

**Last Updated:** December 12, 2025  
**Maintained By:** Backup and Documentation System

