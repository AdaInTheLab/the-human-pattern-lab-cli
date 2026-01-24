# Write Operations Migration Guide

## For Existing HPL CLI Users

The HPL CLI now supports write operations! You can create and update Lab Notes directly from the command line.

## What's New

### New Commands
- `hpl notes create` - Create new Lab Notes
- `hpl notes update` - Update existing Lab Notes

### New Capabilities
- Write Lab Notes to the API programmatically
- Automation-safe design (JSON output mode)
- Token-based authentication
- File or inline content support

## Breaking Changes

**None.** This is an additive change. All existing commands work exactly as before.

## New Requirements

### Authentication
Write operations require authentication. Set up your token:

```bash
export HPL_TOKEN="your-api-token"
```

Or configure it permanently:
```bash
mkdir -p ~/.humanpatternlab
cat > ~/.humanpatternlab/hpl.json <<EOF
{
  "apiBaseUrl": "https://api.thehumanpatternlab.com",
  "token": "your-api-token-here"
}
EOF
```

### Get Your Token
Contact the Human Pattern Lab administrators to get an API token with write permissions.

## Upgrading from Previous Versions

### If you were using `hpl notes sync`
No changes needed! Sync still works the same way.

The new `create` and `update` commands give you more granular control:
- **sync**: Bulk operation for syncing entire directories
- **create**: Single note creation with full control
- **update**: Update individual notes programmatically

### If you were only reading notes
No changes needed! `list` and `get` commands work exactly as before.

## Migration Patterns

### From manual API calls
Before:
```bash
curl -X POST https://api.thehumanpatternlab.com/lab-notes/upsert \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @payload.json
```

After:
```bash
hpl notes create \
  --title "My Note" \
  --slug "my-note" \
  --file ./note.md \
  --tags "tag1,tag2"
```

### From sync-only workflow
Before:
```bash
# Only option was to sync entire directory
hpl notes sync --dir ./labnotes/en
```

After (more options):
```bash
# Create individual note
hpl notes create --title "Quick Note" --slug "quick" --markdown "# Content"

# Update specific note
hpl notes update my-note --status published

# Still use sync for bulk
hpl notes sync --dir ./labnotes/en
```

## New Automation Possibilities

### CI/CD Integration
```yaml
# .github/workflows/publish-note.yml
name: Publish Lab Note
on:
  push:
    paths:
      - 'notes/**.md'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install HPL CLI
        run: npm install -g @thehumanpatternlab/hpl
      - name: Publish Note
        env:
          HPL_TOKEN: ${{ secrets.HPL_TOKEN }}
        run: |
          hpl notes create \
            --title "Auto-published Note" \
            --slug "auto-note-$(date +%s)" \
            --file ./notes/latest.md \
            --json
```

### Scheduled Updates
```bash
# crontab
0 * * * * /usr/local/bin/hpl notes update status-dashboard --file ~/status.md
```

### Programmatic Note Creation
```javascript
const { execSync } = require('child_process');

function publishNote(title, slug, content) {
  const result = execSync(
    `hpl notes create --title "${title}" --slug "${slug}" --markdown "${content}" --json`,
    { encoding: 'utf-8' }
  );
  return JSON.parse(result);
}
```

## FAQ

### Do I need to change my existing scripts?
No. Existing commands are unchanged. The new write commands are additions.

### Can I still use sync?
Yes! Sync is still the best choice for bulk operations. Use create/update for individual notes or automation.

### What permissions do I need?
You'll need an API token with write permissions. Read-only operations (list, get) don't require authentication.

### Will this work with my self-hosted API?
Yes! Use `--base-url` to point to your instance:
```bash
hpl notes create \
  --base-url https://my-api.example.com \
  --title "Note" \
  --slug "note" \
  --file ./note.md
```

### Can I test without affecting production?
Yes! Use a staging API or test token:
```bash
export HPL_BASE_URL="https://staging-api.thehumanpatternlab.com"
export HPL_TOKEN="test-token"
hpl notes create --title "Test" --slug "test-$(date +%s)" --markdown "Test"
```

### What about versioning?
This is an alpha release (v0.0.1-alpha.6+). The command interface is stabilizing but may still evolve. Major breaking changes will be clearly communicated.

## Support

For issues or questions:
- GitHub Issues: https://github.com/AdaInTheLab/the-human-pattern-lab-cli/issues
- Documentation: See WRITE_OPERATIONS_GUIDE.md

## Changelog

**v0.0.1-alpha.7** (upcoming)
- Added `hpl notes create` command
- Added `hpl notes update` command
- Added `postJson` HTTP helper
- Added `create_lab_note` and `update_lab_note` intents
- Added `VALIDATION` and `IO` exit codes
