# Document Templates

This directory contains standardized templates for creating consistent project documentation.

## Available Templates

### 1. **session-summary.md**
Use for documenting work sessions, accomplishments, and next steps.
- **When to use**: At the end of each development session
- **Purpose**: Track progress, decisions, and maintain project continuity

### 2. **feature-spec.md**
Use for planning and documenting new features.
- **When to use**: Before implementing any new feature
- **Purpose**: Clear specification, planning, and approval process

### 3. **bug-report.md**
Use for documenting bugs, fixes, and verification.
- **When to use**: When discovering or fixing bugs
- **Purpose**: Root cause analysis, fix documentation, prevention

### 4. **user-guide.md**
Use for creating end-user documentation.
- **When to use**: When a feature is ready for users
- **Purpose**: Help users understand and use features effectively

### 5. **api-documentation.md**
Use for documenting API endpoints.
- **When to use**: When creating or modifying API endpoints
- **Purpose**: Developer reference and integration guide

## How to Use Templates

### Creating a New Document

1. **Copy the appropriate template**:
   ```bash
   cp ~/Documents/tcc-project-docs/templates/session-summary.md \
      ~/Documents/tcc-project-docs/active/sessions/SESSION_SUMMARY_$(date +%Y%m%d).md
   ```

2. **Fill in the template sections**:
   - Replace placeholder text in [brackets]
   - Remove sections that aren't applicable
   - Add additional sections as needed

3. **Follow naming conventions**:
   - Session: `SESSION_SUMMARY_YYYYMMDD.md`
   - Feature: `FEATURE_<name>_SPECIFICATION.md`
   - Bug: `BUG_<description>_FIX.md`
   - User Guide: `USER_GUIDE_<feature>_<role>.md`
   - API: `API_<endpoint-name>.md`

### Best Practices

- ✅ **Be specific**: Use clear, descriptive names
- ✅ **Be consistent**: Follow the template structure
- ✅ **Be thorough**: Fill in all relevant sections
- ✅ **Be concise**: Keep descriptions clear and brief
- ✅ **Update regularly**: Keep documents current

## Template Customization

Feel free to:
- Add sections specific to your needs
- Remove sections that don't apply
- Adjust formatting for your workflow
- Create new templates for recurring document types

## Automation

These templates are used by the document organization system:
- `scripts/organize-documents.sh` - Automatically organizes documents
- Integrated with backup system
- Supports automatic archiving based on age

## Questions?

If you need help with:
- Which template to use
- How to customize templates
- Document organization process

Refer to the main documentation or contact the team.

---

*Last Updated: October 11, 2025*

