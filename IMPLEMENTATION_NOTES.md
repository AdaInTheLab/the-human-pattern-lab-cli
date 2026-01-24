# HPL CLI Write Operations Implementation

## Summary

Successfully implemented write operations for the HPL CLI to enable creating and updating Lab Notes via the API.

## Changes Made

### 1. Intent Definitions (`src/contract/intents.ts`)
Added two new intent definitions for write operations:
- `create_lab_note`: For creating new Lab Notes
- `update_lab_note`: For updating existing Lab Notes

Both intents:
- Target scope: `["lab_notes", "remote_api"]`
- Side effects: `["write_remote"]`
- Reversible: `false` (write operations cannot be automatically undone)

### 2. Exit Codes (`src/contract/exitCodes.ts`)
Added two new exit codes:
- `VALIDATION: 6` - For data validation failures
- `IO: 7` - For file I/O errors

### 3. HTTP Client (`src/http/client.ts`)
Added `postJson<T>()` function:
- Supports POST requests with JSON payloads
- Handles Bearer token authentication
- Follows existing error handling patterns with `HttpError`
- Supports unwrapping envelope responses

### 4. Create Command (`src/commands/notes/create.ts`)
Implements `hpl notes create` subcommand:

**Features:**
- Required options: `--title`, `--slug`
- Content input: `--markdown` (inline) or `--file` (from file)
- Optional metadata: `--locale`, `--subtitle`, `--summary`, `--tags`, `--published`, `--status`, `--type`, `--dept`
- Authentication via `HPL_TOKEN` environment variable or config file
- Zod validation of payload before sending
- JSON and human output modes
- Proper error handling with specific exit codes

**Example usage:**
```bash
# Create from file
hpl notes create --title "New Note" --slug "new-note" --file ./note.md

# Create with inline content
hpl notes create --title "Quick Note" --slug "quick-note" --markdown "# Content here"

# With metadata
hpl notes create \
  --title "Research Paper" \
  --slug "ai-collaboration-patterns" \
  --file ./paper.md \
  --type paper \
  --tags "ai,research,collaboration" \
  --status published
```

### 5. Update Command (`src/commands/notes/update.ts`)
Implements `hpl notes update` subcommand:

**Features:**
- Positional argument: `<slug>` (note to update)
- Optional fields: All create fields (except slug is argument not option)
- Requires at least `--title` and (`--markdown` or `--file`) for full updates
- Uses same upsert endpoint as create
- Authentication via `HPL_TOKEN`
- 404 handling for non-existent notes
- JSON and human output modes

**Example usage:**
```bash
# Update from file
hpl notes update my-note --title "Updated Title" --file ./updated.md

# Update specific fields
hpl notes update my-note --status published --tags "updated,reviewed"

# Full update with inline content
hpl notes update my-note \
  --title "Revised Note" \
  --markdown "# New content" \
  --summary "Updated summary"
```

### 6. Command Wiring (`src/commands/notes/notes.ts`)
Integrated new commands into the notes command tree:
- Imported `notesCreateSubcommand` and `notesUpdateSubcommand`
- Added both to the command tree (before sync)

## API Contract

Both commands use the existing `/lab-notes/upsert` endpoint with the `LabNoteUpsertPayload` schema:

```typescript
{
  slug: string;           // required
  title: string;          // required
  markdown: string;       // required
  locale?: string;
  subtitle?: string;
  summary?: string;
  tags?: string[];
  published?: string;
  status?: "draft" | "published" | "archived";
  type?: "labnote" | "paper" | "memo" | "lore" | "weather";
  dept?: string;
}
```

## Authentication

Both commands require authentication via:
1. `HPL_TOKEN` environment variable, OR
2. Token configured in `~/.humanpatternlab/hpl.json`

Returns `E_AUTH` (exit code 4) if token is missing or invalid.

## Output Modes

Both commands support:
- **Human mode** (default): Readable text output with status messages
- **JSON mode** (`--json`): Structured JSON envelope following the existing contract

## Error Handling

Comprehensive error handling for:
- Missing authentication (`E_AUTH`, exit 4)
- File not found (`E_NOT_FOUND`, exit 3)
- File I/O errors (`E_IO`, exit 7)
- Validation errors (`E_VALIDATION`, exit 6)
- Network errors (`E_NETWORK`, exit 10)
- Server errors (`E_SERVER`, exit 11)
- Unknown errors (`E_UNKNOWN`, exit 1)

## Design Consistency

Implementation follows all existing HPL CLI patterns:
- ✅ Core function returns `{ envelope, exitCode }`
- ✅ Commander adapter handles mode selection and rendering
- ✅ Zod schema validation before API calls
- ✅ Consistent error shapes with codes and messages
- ✅ Proper use of intent descriptors
- ✅ File headers with lab unit attribution
- ✅ Support for both JSON and human output modes
- ✅ Predictable exit codes for automation

## Testing Recommendations

Before deployment, test:

1. **Create command:**
   ```bash
   # Test with file
   hpl notes create --title "Test" --slug "test-note" --file ./test.md
   
   # Test with inline content
   hpl notes create --title "Test" --slug "test-note-2" --markdown "# Test"
   
   # Test validation error
   hpl notes create --title "Test" --slug "test"  # Missing content
   
   # Test auth error
   unset HPL_TOKEN
   hpl notes create --title "Test" --slug "test" --file ./test.md
   ```

2. **Update command:**
   ```bash
   # Test successful update
   hpl notes update test-note --title "Updated" --file ./updated.md
   
   # Test 404
   hpl notes update nonexistent --title "Test" --markdown "Test"
   
   # Test JSON mode
   hpl notes update test-note --title "Test" --markdown "Test" --json
   ```

3. **JSON contract verification:**
   ```bash
   hpl notes create --title "Test" --slug "test" --markdown "Test" --json | \
     node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"
   ```

## Next Steps

Potential enhancements:
1. Add `--partial` flag to update command for true partial updates (fetch existing + merge)
2. Add `hpl notes delete <slug>` command using DELETE endpoint
3. Add batch operations support
4. Add interactive mode for creating notes with prompts
5. Add validation for slug format (kebab-case, etc.)
6. Add dry-run mode like sync has

## Files Modified/Created

**Modified:**
- `src/contract/intents.ts` - Added create/update intents
- `src/contract/exitCodes.ts` - Added VALIDATION and IO exit codes
- `src/http/client.ts` - Added postJson function
- `src/commands/notes/notes.ts` - Wired new commands

**Created:**
- `src/commands/notes/create.ts` - Create command implementation
- `src/commands/notes/update.ts` - Update command implementation

**Total changes:** 4 modified files, 2 new files
