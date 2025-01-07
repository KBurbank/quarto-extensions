# RevealHeader Plugin for Quarto Presentations

A Reveal.js plugin that adds customizable headers and footers to your presentations. This plugin supports dynamic headers, logos, and section titles that update based on slide content.

## Installation

Add the revealHeader extension to your Quarto presentation:

```yaml
filters:
  - revealHeader
```

## Basic Configuration

Add to your Quarto presentation YAML:

```yaml
header: "Your Header Text"  # Static header text
sub-title: true            # Enable dynamic subtitles
title-as-header: false     # Use presentation title as header
```

## Features

### Header Types
- **Static Header**: Fixed text across all slides
- **Dynamic Header**: Changes based on slide content
- **Title as Header**: Uses presentation title
- **Subtitle as Header**: Uses presentation subtitle
- **Section/Subsection Titles**: Shows current section/subsection in header

### Logo Support
- Add logo to header
- Configurable logo size and position
- Optional logo links
- Separate header and footer logos

### Dynamic Content
- Section titles (h1) displayed in header
- Subsection titles (h2) displayed in header
- Support for dark/light slide backgrounds
- Hide header on title slide option

## Configuration Options

### Basic Header Options

```yaml
header: "Static Header Text"              # Fixed header text
title-as-header: true                     # Use presentation title as header
subtitle-as-header: true                  # Use presentation subtitle as header
sub-title: true                          # Enable dynamic subtitles
```

### Logo Configuration

```yaml
header-logo: "path/to/logo.png"          # Header logo path
header-logo-link: "https://example.com"   # Header logo link
footer-logo-link: "https://example.com"   # Footer logo link
```

### Visibility Options

```yaml
hide-from-titleSlide: "text"             # Hide header text on title slide
hide-from-titleSlide: "logo"             # Hide logo on title slide
hide-from-titleSlide: "all"              # Hide everything on title slide
```

### Section Title Display

```yaml
sc-sb-title: true                        # Enable section/subsection titles
```

## CSS Customization

The plugin provides several CSS classes for styling:

- `.reveal-header`: Main header container
- `.header-text`: Header text
- `.header-logo`: Logo container
- `.sc-title`: Section title
- `.sb-title`: Subsection title
- `.sub-title`: Dynamic subtitle
- `.reveal-footer`: Footer container

Example CSS customization:

```css
.reveal-header {
  background-color: rgb(176, 189, 213);
  margin: 0px !important;
}

.reveal-header p {
  color: var(--header-font-color);
  font-size: var(--header-font-size);
}
```

## Grid Layout

The header uses a CSS grid layout with the following areas:
- Logo
- Section title
- Header text
- Subsection title
- Slide number

Default grid template:
```css
grid-template-columns: 0.35fr 1.2fr 0.1fr 1.2fr 0.2fr;
grid-template-areas: "logo sc ht sb sn";
```

## Technical Notes

1. The plugin automatically handles:
   - Dark/light slide background adaptation
   - Responsive layout
   - Mobile device compatibility
   - Dynamic content updates

2. Header text and logos can be:
   - Fixed across all slides
   - Dynamic based on slide content
   - Hidden on specific slides
   - Linked to external URLs

3. Integration with other Reveal.js features:
   - Compatible with slide transitions
   - Works with vertical slides
   - Supports Reveal.js themes

## Credits

This plugin is developed by Kendra Burbank, building upon the Reveal.js framework.

## License

MIT License 