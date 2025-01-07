# Course Presentation Extension for Quarto

A comprehensive Quarto extension designed for creating interactive course presentations. This extension combines a customizable header system with drawing capabilities, making it ideal for teaching and lectures.

## Installation

1. Install the extension in your Quarto project:

```bash
quarto add kendra-burbank/course-presentation
```

2. Add the extension to your presentation YAML:

```yaml
format:
  revealjs:
    filters:
      - revealHeader
    revealjs-plugins:
      - tablet-chalkboard
```

## Features

### Presentation Structure
- Embedded presentation mode
- Automatic table of contents with customizable depth
- Three-level slide hierarchy
- Incremental content display
- Centered content layout
- Slide numbering
- Mobile-responsive design

### Header System (revealHeader)
- Dynamic headers that update with slide content
- Section and subsection title display
- Logo support with customizable positioning
- Dark/light background adaptation
- Configurable visibility options

### Drawing Tools (tablet-chalkboard)
- Two drawing modes: slide annotations and full-screen chalkboard
- Multiple colors and tools
- Stylus-optimized interface
- Automatic drawing storage
- Playback capabilities

## Basic Configuration

Example YAML configuration:

```yaml
format:
  revealjs:
    embedded: true
    toc: true
    toc-depth: 1
    toc-title: "Outline for today"
    header: ""
    slide-level: 3
    incremental: true
    center: true
    number-sections: false
    number-depth: 2
    smaller: true
    show-notes: false
    sub-title: true
    slide-number: c
    title-as-header: false
    RevealTabletChalkboard:
      theme: whiteboard
```

## Advanced Features

### Header Customization
- Title/subtitle as header options
- Dynamic section titles
- Logo integration
- Custom CSS styling
- Responsive grid layout

### Drawing Tools
- Multiple color palettes
- Eraser functionality
- Drawing storage and export
- Touch and stylus optimization
- Broadcast mode for collaboration

### Presentation Controls
- Keyboard shortcuts for all features
- Touch gestures support
- Drawing tool selection
- Slide navigation controls

## Keyboard Shortcuts

### Navigation
- Arrow keys: Navigate slides
- Space/Enter: Next slide
- Backspace: Previous slide

### Drawing Tools
- C: Toggle notes canvas
- B: Toggle chalkboard
- DEL: Clear current slide drawings
- BACKSPACE: Reset all drawings
- X: Next color
- Y: Previous color
- D: Download drawings

## Technical Details

### Dependencies
The extension includes:
- Reveal.js
- jQuery
- Font Awesome
- Awesome Cursor library

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Touch device support
- Stylus input optimization

### Storage
- Session storage for drawings
- Export/import capabilities
- Real-time synchronization support

## Customization

### CSS Variables
```css
:root {
  --header-font-size: max(10px, 1.4vw);
  --header-font-color: #898E8B;
  --header-margin: 0px 0px 0px 0px;
}
```

### Layout Options
```yaml
# Grid layout customization
grid-template-columns: 0.35fr 1.2fr 0.1fr 1.2fr 0.2fr
grid-template-areas: "logo sc ht sb sn"
```

### Drawing Tools
```yaml
RevealTabletChalkboard:
  boardmarkerWidth: 3
  chalkWidth: 7
  chalkEffect: 1.0
  rememberColor: true
```

## Best Practices

1. **Slide Organization**
   - Use consistent heading levels
   - Keep content hierarchy clear
   - Use incremental reveals for complex content

2. **Drawing Usage**
   - Plan drawing spaces in slides
   - Use appropriate colors for visibility
   - Clear drawings when changing topics

3. **Header Management**
   - Keep headers concise
   - Use dynamic headers for context
   - Ensure contrast with slide content

## Credits

This extension combines:
- RevealHeader plugin by Kendra Burbank
- TabletChalkboard plugin (modified from Reveal.js Chalkboard)
- Additional customizations for course presentation needs

## License

MIT License 