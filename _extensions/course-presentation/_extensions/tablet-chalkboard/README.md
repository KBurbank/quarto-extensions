# Tablet-Chalkboard Plugin for Quarto Presentations

A Reveal.js plugin that adds drawing capabilities to your presentations, optimized for use with a stylus. This plugin provides two drawing modes: a notes canvas for drawing on slides and a chalkboard mode for a separate full-screen drawing surface.

## Installation

Add the tablet-chalkboard extension to your Quarto presentation:

```yaml
revealjs-plugins:
  - tablet-chalkboard
```

## Basic Configuration

Add to your Quarto presentation YAML:

```yaml
RevealTabletChalkboard:
    theme: whiteboard  # or "chalkboard" for dark theme
```

## Features

### Drawing Modes
- **Notes Canvas**: Draw directly on slides (Toggle with 'C' key)
- **Chalkboard Mode**: Full-screen drawing surface (Toggle with 'B' key)

### Drawing Tools
- Multiple colors available
- Eraser tool
- Different pen widths for boardmarker and chalk
- Grid background option

### Color Palette
- **Boardmarker Colors**: 
  - Red
  - Gray
  - Blue
  - Green
  - Orange
  - Purple
  - Yellow
  - White (Eraser)
- **Chalk Colors**:
  - White
  - Light Blue
  - Red
  - Green
  - Orange
  - Purple
  - Yellow

## Controls

### Keyboard Shortcuts

| Key | Function |
|-----|----------|
| C | Toggle notes canvas |
| B | Toggle chalkboard |
| DEL | Clear drawings on current slide |
| BACKSPACE | Reset all drawings |
| X | Next color |
| Y | Previous color |
| D | Download drawings |

### Mouse/Stylus Controls

- **Left Click/Stylus**: Draw
- **Right Click/Shift+Click**: Erase
- **Long Press** (touch devices): Switch to eraser

## Advanced Configuration

You can customize various aspects through the YAML configuration:

```yaml
RevealTabletChalkboard:
    theme: whiteboard
    boardmarkerWidth: 3      # Width of boardmarker lines
    chalkWidth: 7            # Width of chalk lines
    chalkEffect: 1.0         # Intensity of chalk effect
    rememberColor: true      # Remember last used color
    toggleNotesButton: true  # Show notes toggle button
    toggleChalkboardButton: true # Show chalkboard toggle button
    colorButtons: true       # Show color palette
    boardHandle: true       # Show board navigation handle
```

## Storage and Export

- Drawings are automatically saved in session storage
- Download drawings as JSON file using 'D' key
- Load previously saved drawings

## Advanced Features

### Broadcast Mode
- Supports synchronized drawing across multiple clients
- Real-time updates for collaborative sessions

### Playback
- Records drawing actions with timestamps
- Can playback drawings synchronized with slide transitions
- Supports auto-slide playback integration

## Technical Requirements

The plugin requires:
- jQuery
- Font Awesome
- Awesome Cursor library

These dependencies are automatically included when you use the plugin.

## Credits

This plugin is a modified version of the Reveal.js Chalkboard plugin, optimized for stylus input. Original credits:
- Chalkboard effect by Mohamed Moustafa
- Multi color support initially added by Kurt Rinnert
- Compatibility with reveal.js v4 by Hakim El Hattab

## License

MIT License 