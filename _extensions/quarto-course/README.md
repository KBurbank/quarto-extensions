# Quarto Course Extension

A Quarto extension designed for creating and managing course websites with automated post-processing capabilities.

## Installation

You can install this extension in your Quarto project by running:

```bash
quarto add kburbank/quarto-course
```

## Features

This extension configures your Quarto project as a website with specialized post-processing scripts that:

- Process and format course notes
- Clean up generated site files
- Generate custom lecture listings
- Filter out content marked as not ready
- Automate git repository updates

## Usage

1. First, install the extension as shown above.

2. In your project's `_quarto.yml`, the extension will automatically configure:
   - Website project type
   - Output directory as `_site`
   - Post-processing scripts

The extension handles the following automatically:
- Website structure setup
- Post-render processing
- Content organization

## Post-Processing Scripts

The extension includes several scripts that run automatically after site rendering:

- `fixnotes.py`: Creates note-enabled versions of RevealJS presentations by generating additional HTML files with speaker notes visible. For each presentation file, it creates a "-notes.html" version with `showNotes: true`.

- `clean_site.py`: Performs comprehensive site cleanup by:
  - Copying rendered content to the final `docs` directory
  - Removing temporary build files and directories
  - Cleaning up files starting with "_"
  - Removing source `.qmd` files from the output
  - Removing empty directories
  - Applying `.gitignore` patterns to the output
  - Cleaning up speaker-view files outside the site directory

- `make_listing_lecture_types.py`: Generates an organized index of lecture files by:
  - Creating a tabbed interface separating content into Speaker, Notes, and Other views
  - Automatically generating navigation links for all lecture files
  - Excluding index and dump files from listings
  - Creating an interactive HTML interface for easy navigation

- `remove_not_ready.sh`: Manages the visibility of homework solutions by:
  - Checking YAML frontmatter for `publish-solutions-on` dates
  - Automatically removing solution files that shouldn't be public yet
  - Controlling the timing of when homework solutions become available

- `update_git.py`: Automates git repository management by:
  - Checking for changes in rendered output
  - Automatically committing and pushing changes when configured
  - Supporting git submodules
  - Only running when enabled in the Quarto configuration

## Author

Created by Kendra Burbank

## Version

Current version: 1.0.0

## Support

If you encounter any issues or have questions, please file them in the GitHub repository's issue tracker.

## License

[Add your chosen license here] 