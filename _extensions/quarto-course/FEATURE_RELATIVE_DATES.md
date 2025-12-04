# Feature: Relative Date Support for publish-solutions-on

## Overview

Enhanced the `hw_listing.ejs` template to support **relative dates** based on a quarter/semester start date, in addition to absolute dates.

## Usage

### 1. Set Quarter Start Date as Project Metadata

**Option A: In `_quarto.yml` (Recommended)**
```yaml
project:
  title: "Stat 24320"
  type: quarto-course

quarter-start-date: "2025-01-06"  # Monday of Week 1

website:
  title: "Stat 24320"
```

**Option B: In `_metadata.yml`**
```yaml
quarter-start-date: "2025-01-06"  # Monday of Week 1
```

**Option C: In `index.qmd` (Fallback)**
```yaml
---
listing: 
  - id: homeworks
    template-params:
      quarter-start-date: "2025-01-06"
---
```

### 2. Use Relative Dates in Homework Files

In your `HW/HW1.qmd`:

```yaml
---
title: Homework 1
due-date: Wednesday, Week 2
publish-solutions-on: Week 2 Friday  # NEW: Relative date!
textbook-chapters: 1
---
```

## Date Formats Supported

### Absolute Dates (backward compatible)
```yaml
publish-solutions-on: 2024-02-23
```

### Relative Dates (NEW)
```yaml
publish-solutions-on: Week 2 Friday
publish-solutions-on: Week 3 Wednesday  
publish-solutions-on: Week 9           # Defaults to Friday
```

## How It Works

### Two Mechanisms Updated

#### 1. **`hw_listing.ejs`** - Shows/hides solution links
1. The template parses `publish-solutions-on` values
2. If it matches "Week N [Day]" format, it:
   - Takes the `quarter-start-date` from template params
   - Calculates Week N relative to that start date
   - Finds the specified day of that week (defaults to Friday)
3. If it's already an absolute date (YYYY-MM-DD), uses it directly
4. Compares the calculated date to current date
5. Shows solutions link only if current date >= publish date

#### 2. **`remove_not_ready.sh`** - Removes unpublished solution files
1. Reads `quarter-start-date` from `index.qmd` or `_quarto.yml`
2. For each homework file, parses its `publish-solutions-on` date
3. Converts relative dates (e.g., "Week 2 Friday") to absolute dates
4. Compares to current date
5. **Physically removes** `.sol.html` files from `docs/HW/` if not yet ready
6. This prevents unpublished solutions from appearing on GitHub Pages

## Implementation

The parsing logic handles:
- Week numbers (1-indexed)
- Day names (Monday-Sunday)
- Defaults to Friday if no day specified
- Falls back to direct date parsing for absolute dates
- Backward compatible with existing absolute dates

## Migration Example

### Before (Spring 2024):
```yaml
# _quarto.yml
quarter-start-date: "2024-01-08"

# HW/HW1.qmd
publish-solutions-on: 2024-02-23  # Hardcoded for Spring 2024
```

### After (Winter 2025):
```yaml
# _quarto.yml
quarter-start-date: "2025-01-06"  # Just change this!

# HW/HW1.qmd
publish-solutions-on: Week 2 Friday  # Automatically calculated!
```

Update one date in `_quarto.yml` and all homework solution dates adjust automatically!

## Installation

### For the Extension (Recommended)

Update the extension source files:

1. **Replace listing template:**
   ```bash
   cp hw_listing_enhanced.ejs hw_listing.ejs
   ```

2. **Replace bash script:**
   ```bash
   cp scripts/remove_not_ready_enhanced.sh scripts/remove_not_ready.sh
   chmod +x scripts/remove_not_ready.sh
   ```

3. **Update `_quarto.yml`** in extension to document the new parameter

### For Your Course

1. **Add `quarter-start-date` to `_quarto.yml`:**
   ```yaml
   quarter-start-date: "2025-01-06"  # Monday of Week 1
   ```

2. **Update homework files to use relative dates:**
   ```yaml
   # HW/HW1.qmd
   publish-solutions-on: Week 2 Friday
   ```

3. **Test the bash script:**
   ```bash
   bash _extensions/quarto-course/scripts/remove_not_ready.sh
   ```
   
   You should see output like:
   ```
   Quarter start date: 2025-01-06
     HW1: publish date = 2025-01-17 (from: Week 2 Friday)
     → Keeping docs/HW/HW1.sol.html (published)
   ```

## Benefits

✅ Reusable homework files across quarters/semesters  
✅ No hardcoded dates in content files  
✅ Backward compatible with absolute dates  
✅ Automatic calculation based on academic calendar  
✅ Easier to update for new terms

