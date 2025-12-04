# Help Documentation Structure

This directory contains all help documentation files for the TCC application.

## Directory Structure

```
help/
├── healthcare/          # Healthcare Dashboard help files
│   ├── index.md        # Main index/table of contents
│   ├── create-request.md
│   ├── transport-requests.md
│   ├── in-progress.md
│   ├── completed-trips.md
│   ├── hospital-settings.md
│   ├── ems-providers.md
│   ├── destinations.md
│   └── team-members.md
│
├── ems/                # EMS Dashboard help files
│   ├── index.md
│   ├── available-trips.md
│   ├── my-trips.md
│   ├── completed-trips.md
│   ├── units.md
│   ├── users.md
│   ├── agency-info.md
│   └── trip-calculator.md
│
└── tcc-admin/         # TCC Admin Dashboard help files
    ├── index.md
    ├── trip-management.md
    ├── healthcare-facilities.md
    ├── ems-agencies.md
    ├── route-optimization.md
    ├── analytics.md
    └── user-management.md
```

## File Format

All help files are written in **Markdown** (.md) format. This allows for:
- Easy editing and version control
- Rich formatting (headings, lists, code blocks, links)
- Image embedding
- Video embedding (via links)
- Consistent styling

## Naming Convention

- Use lowercase letters
- Separate words with hyphens (-)
- Be descriptive but concise
- Match the feature/tab name when possible

Examples:
- `create-request.md` (not `CreateRequest.md` or `create_request.md`)
- `transport-requests.md`
- `hospital-settings.md`

## Content Guidelines

### Structure
Each help file should follow this structure:

1. **Title** - H1 heading with feature name
2. **Overview** - Brief description of what the feature does
3. **Quick Start** - Simple steps to get started
4. **Detailed Sections** - Step-by-step guides
5. **Tips and Best Practices** - Helpful hints
6. **Troubleshooting** - Common issues and solutions
7. **Related Topics** - Links to related help files
8. **Video Tutorial** - Link to video (when available)

### Writing Style
- Use clear, concise language
- Write in second person ("you") or imperative mood
- Use bullet points and numbered lists for steps
- Include examples and scenarios
- Add screenshots references where helpful (e.g., "See the Submit button in the top right")

### Links
- Use relative paths for internal links: `./transport-requests.md`
- Use absolute URLs for external links: `https://example.com`
- Link to related topics at the end of each file

### Images and Videos
- **Images:** Store in `public/help/images/` and reference with relative paths
- **Videos:** Embed YouTube/Vimeo links or reference video IDs from metadata file

## Adding New Help Files

1. Create the markdown file in the appropriate directory
2. Follow the naming convention
3. Use the template structure
4. Add link to the index.md file in that directory
5. Update related topics sections in other files

## Video Integration

Videos are stored externally (YouTube/Vimeo) and referenced via:
- Video IDs stored in `videoIndex.json` or similar metadata file
- Embedded iframes in markdown (when rendered)
- Links to video tutorials

## Maintenance

- Update help files when features change
- Review quarterly for accuracy
- Collect user feedback
- Keep video links updated

---

**Last Updated:** January 2025


