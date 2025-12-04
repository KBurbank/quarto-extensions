# Changelog - course-presentation Extension

## Updates from Stat 28000 (December 2024)

### Critical Bug Fixes

#### 1. **LaTeX/MathJax Rendering in Headers** 
**Files:** `_extensions/revealHeader/resources/js/sc_sb_title.js`, `_extensions/revealHeader/resources/js/sub_title.js`

**Problem:** LaTeX math in slide titles and headers was not rendering properly because `innerText` strips HTML/MathJax formatting.

**Fix:** Changed from `innerText` to `innerHTML` to preserve MathJax:
```javascript
// OLD (broken):
var h1 = el.querySelector('.title-slide h1')?.innerText;

// NEW (fixed):
var h1 = el.querySelector('.title-slide h1')?.innerHTML;
```

Applied to:
- Title slide h1/h2 extraction
- Section/subsection title updates
- Footer text updates

#### 2. **MathJax 3 Configuration**
**Files:** `_extension.yml`, `revealjs_mathjax3.template`, `_extensions/customMathjax3/`

**Added:** Explicit MathJax configuration to ensure proper rendering:
- Set `html-math-method: mathjax` in extension config
- Added custom MathJax 3 template
- Added custom MathJax 3 extension directory

### New Features

#### 3. **Enhanced Header Script**
**File:** `_extensions/revealHeader/resources/js/add_header_new.js`

New alternative header script (purpose TBD - review and document).

### Other Changes
- Updated `.gitignore`
- Modified `revealHeader.lua` 
- Modified `tablet-chalkboard/plugin.js`

## Testing Recommendations

1. Test slides with LaTeX in titles (e.g., `## $f(x) = x^2$`)
2. Verify section/subsection headers render math correctly
3. Check that chalkboard still works with updates
4. Verify MathJax 3 compatibility across browsers

## Status

✅ Bug fixes applied to source directory  
✅ Stat 24320/Current will pick up changes via symlink  
⚠️  Consider committing to git if this directory is version controlled

