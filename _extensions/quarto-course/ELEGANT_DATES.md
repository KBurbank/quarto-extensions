# Elegant Date System using Quarto Metadata + Lua Filter

## Philosophy

Let **Quarto do the work** at render time, not runtime scripts!

1. ✅ Quarto handles metadata inheritance (automatic!)
2. ✅ Lua filter computes dates once at render time
3. ✅ Scripts become simple - just read and compare
4. ✅ No duplicate parsing logic across JavaScript/Bash
5. ✅ Rendered HTML is self-contained

## How It Works

### 1. **Metadata Inheritance** (Built-in Quarto)

Set defaults in `_metadata.yml` or `_quarto.yml`:

```yaml
# _metadata.yml in HW/ directory
publish-solutions-on: +1w  # Global default: 1 week after due date
```

Override in individual files:

```yaml
# HW/HW1.qmd
due-date: Wednesday, Week 2
publish-solutions-on: +2w  # This HW gets 2 weeks
```

### 2. **Lua Filter Computes Dates** (At Render Time)

The `compute_dates.lua` filter runs during render and:
- Reads `quarter-start-date` from project metadata
- Parses `due-date` (e.g., "Wednesday, Week 2") → absolute date
- Parses `publish-solutions-on` with multiple formats:
  - Relative offset: `+1w`, `+2d`, `-3d` (from due-date)
  - Absolute week: `Week 3 Friday`
  - Absolute date: `2025-02-14`
- Stores computed absolute dates in metadata
- Original values preserved as `*-original` fields

### 3. **Scripts Read Computed Values** (Simple!)

Templates and scripts just read the absolute dates - no parsing needed!

**Template (hw_listing_simple.ejs):**
```javascript
// Just compare dates - Lua already computed them!
if(item['publish-solutions-on'] && new Date(item['publish-solutions-on']) <= new Date()) {
    // Show solution link
}
```

**Bash Script (remove_not_ready_simple.sh):**
```bash
# Just read and compare - Lua already computed them!
publish_date=$(grep 'publish-solutions-on:' "$file" | sed 's/.*: //')
```

## Supported Date Formats

### `due-date`
- `Wednesday, Week 2` - Calculated from quarter-start-date
- `Week 3` - Defaults to Friday
- `2025-02-14` - Absolute date

### `publish-solutions-on`
- **Relative to due-date** (NEW!):
  - `+1w` - 1 week after due date
  - `+2d` - 2 days after
  - `+1m` - ~1 month after (30 days)
- **Absolute week**:
  - `Week 3 Friday`
- **Absolute date**:
  - `2025-02-14`

## Setup

### 1. Add filter to `_quarto.yml`

```yaml
quarter-start-date: "2025-01-06"

filters:
  - _extensions/quarto-course/scripts/compute_dates.lua
```

### 2. Set global default in `HW/_metadata.yml`

```yaml
publish-solutions-on: +1w  # All HW: solutions 1 week after due
```

### 3. Override per homework

```yaml
# HW/HW1.qmd
due-date: Wednesday, Week 2
# Uses inherited +1w

# HW/HW6.qmd  
due-date: Friday, Week 9
publish-solutions-on: +2d  # Override: only 2 days for final HW
```

## Example Metadata Flow

### Project Level (`_quarto.yml`):
```yaml
quarter-start-date: "2025-01-06"  # Monday of Week 1
```

### Directory Level (`HW/_metadata.yml`):
```yaml
publish-solutions-on: +1w  # Default for all homework
```

### File Level (`HW/HW1.qmd`):
```yaml
---
title: Homework 1
due-date: Wednesday, Week 2
# Inherits: publish-solutions-on: +1w
---
```

### After Lua Filter (Computed):
```yaml
---
title: Homework 1
due-date: Wednesday, Week 2
due-date-computed: 2025-01-15
publish-solutions-on: 2025-01-22  # +1w from computed due date
publish-solutions-on-original: +1w
---
```

### Scripts Read:
- `due-date-computed: 2025-01-15`
- `publish-solutions-on: 2025-01-22`

Done! No parsing, just comparison.

## Advantages Over Previous Approach

| Previous | Elegant (New) |
|----------|---------------|
| JavaScript parses dates | ✅ Lua computes once |
| Bash parses dates | ✅ Bash just reads |
| Two parsing implementations | ✅ One Lua filter |
| No metadata inheritance | ✅ Full Quarto inheritance |
| Runtime computation | ✅ Render-time computation |
| Complex scripts | ✅ Simple scripts |

## Migration

### Old Way:
```yaml
# _quarto.yml
quarter-start-date: "2025-01-06"

# HW/HW1.qmd
publish-solutions-on: Week 2 Friday
```

### New Elegant Way:
```yaml
# _quarto.yml
quarter-start-date: "2025-01-06"
filters:
  - _extensions/quarto-course/scripts/compute_dates.lua

# HW/_metadata.yml
publish-solutions-on: +1w

# HW/HW1.qmd
due-date: Wednesday, Week 2
# That's it! Inherits +1w, Lua computes everything
```

## Testing

Render a homework file and check the HTML metadata:

```bash
quarto render HW/HW1.qmd --to html
# Check that publish-solutions-on is now an absolute date
grep 'publish-solutions-on' HW/HW1.qmd
```

You should see the computed absolute date in the rendered output's metadata!

