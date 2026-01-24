# HPL CLI Write Operations - Quick Reference

## New Commands

### `hpl notes create`
Create a new Lab Note.

**Basic Usage:**
```bash
hpl notes create --title "Title" --slug "slug" --file ./note.md
hpl notes create --title "Title" --slug "slug" --markdown "# Content"
```

**Full Example:**
```bash
hpl notes create \
  --title "AI Collaboration Patterns" \
  --slug "ai-collaboration-patterns" \
  --file ./patterns.md \
  --subtitle "Observations from The Skulk" \
  --summary "Research on human-AI collaborative dynamics" \
  --tags "ai,collaboration,research" \
  --type "paper" \
  --status "published" \
  --dept "RND" \
  --locale "en"
```

**Required:**
- `--title <text>` - Note title
- `--slug <text>` - Unique identifier (URL-friendly)
- Either `--markdown <text>` OR `--file <path>` - Content source

**Optional:**
- `--locale <code>` - Locale (default: "en")
- `--subtitle <text>` - Note subtitle
- `--summary <text>` - Brief summary
- `--tags <list>` - Comma-separated tags
- `--published <date>` - Publication date (ISO format)
- `--status <status>` - draft|published|archived (default: "draft")
- `--type <type>` - labnote|paper|memo|lore|weather (default: "labnote")
- `--dept <code>` - Department code

### `hpl notes update`
Update an existing Lab Note.

**Basic Usage:**
```bash
hpl notes update <slug> --title "New Title" --file ./updated.md
hpl notes update <slug> --status published
```

**Full Example:**
```bash
hpl notes update ai-collaboration-patterns \
  --title "AI Collaboration Patterns (Revised)" \
  --file ./patterns-v2.md \
  --summary "Updated research findings" \
  --tags "ai,collaboration,research,2025" \
  --status "published"
```

**Required:**
- `<slug>` - Slug of note to update (positional argument)
- Both `--title` and (`--markdown` or `--file`) for updates

**Optional:** (same as create, except slug is positional)

## Authentication

Set your API token:
```bash
export HPL_TOKEN="your-api-token-here"
```

Or configure in `~/.humanpatternlab/hpl.json`:
```json
{
  "apiBaseUrl": "https://api.thehumanpatternlab.com",
  "token": "your-api-token-here"
}
```

## Output Modes

### Human Mode (default)
```bash
hpl notes create --title "Test" --slug "test" --file ./test.md
```
Output:
```
✅ Lab Note created: test
```

### JSON Mode
```bash
hpl notes create --title "Test" --slug "test" --file ./test.md --json
```
Output:
```json
{
  "ok": true,
  "command": "notes.create",
  "intent": {
    "intent": "create_lab_note",
    "intentVersion": "1",
    "scope": ["lab_notes", "remote_api"],
    "sideEffects": ["write_remote"],
    "reversible": false
  },
  "data": {
    "slug": "test",
    "action": "created",
    "message": "Lab Note created: test"
  }
}
```

## Exit Codes

- `0` - Success
- `1` - Unknown error
- `2` - Usage error (bad arguments)
- `3` - Not found (404)
- `4` - Authentication required/failed
- `6` - Validation error
- `7` - File I/O error
- `10` - Network error
- `11` - Server error (5xx)

## Common Workflows

### Create draft, review, then publish
```bash
# Create as draft
hpl notes create \
  --title "New Research" \
  --slug "new-research" \
  --file ./research.md \
  --status draft

# Review locally, then publish
hpl notes update new-research --status published
```

### Update content from file
```bash
# Edit your markdown file locally
vim my-note.md

# Update on server
hpl notes update my-note --title "My Note" --file ./my-note.md
```

### Bulk tagging
```bash
# Add tags to existing note
hpl notes update my-note \
  --title "My Note" \
  --file ./my-note.md \
  --tags "research,2025,published"
```

### Change note type
```bash
# Convert lab note to paper
hpl notes update my-note \
  --title "My Note" \
  --file ./my-note.md \
  --type paper
```

## Automation Examples

### CI/CD Pipeline
```bash
#!/bin/bash
set -e

# Create note from CI
hpl notes create \
  --title "Build Report $(date +%Y-%m-%d)" \
  --slug "build-report-$(date +%Y%m%d)" \
  --file ./build-report.md \
  --tags "ci,build,automated" \
  --status published \
  --json > result.json

# Check success
if jq -e '.ok' result.json; then
  echo "Note published successfully"
else
  echo "Failed to publish note"
  exit 1
fi
```

### Scheduled Updates
```bash
#!/bin/bash
# Update a status dashboard note every hour

hpl notes update system-status \
  --title "System Status" \
  --file ./generated-status.md \
  --published "$(date -Iseconds)" \
  --json
```

## Troubleshooting

### "Authentication required"
```bash
# Check if token is set
echo $HPL_TOKEN

# Set token
export HPL_TOKEN="your-token"

# Or configure in file
mkdir -p ~/.humanpatternlab
echo '{"token":"your-token"}' > ~/.humanpatternlab/hpl.json
```

### "File not found"
```bash
# Check file exists
ls -l ./note.md

# Use absolute path
hpl notes create --title "Test" --slug "test" --file "/full/path/to/note.md"
```

### "Invalid note data"
```bash
# Run in JSON mode to see validation details
hpl notes create --title "Test" --slug "test" --file ./note.md --json
```

### Testing before running
```bash
# Check what would be sent (create note, check payload, delete if needed)
# Or use dry-run in your local environment

# Validate JSON output
hpl notes create --title "Test" --slug "test" --markdown "test" --json | \
  node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"
```

## Notes

- The API uses an "upsert" endpoint, so create and update both use the same backend
- Slugs must be unique per locale
- For partial updates (changing just one field), you still need to provide title and markdown
- Future enhancement could add --partial flag to merge with existing content
- The markdown field is the canonical source of truth; HTML is derived on the server
