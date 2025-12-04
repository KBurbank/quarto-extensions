#!/bin/bash

# Simple version - Quarto's Lua filter already computed absolute dates!
# We just read and compare them.

# Loop through all .qmd files in the HW directory
for file in HW/*.qmd; do
    # Skip if no files found
    [[ -e "$file" ]] || continue
    
    # Extract the filename without extension
    filename=$(basename -- "$file")
    filename="${filename%.*}"

    # Read the yaml content
    yaml_content=$(sed -n '/---/,/---/p' "$file")

    # Extract the publish-solutions-on-computed date (absolute from Lua filter)
    publish_date=$(echo "$yaml_content" | grep 'publish-solutions-on-computed:' | sed 's/publish-solutions-on-computed:[[:space:]]*//')
    
    # Check if publish_date is not empty
    if [[ -n $publish_date ]]; then
        # Convert the publish date to seconds since epoch
        if [[ "$OSTYPE" == "darwin"* ]]; then
            publish_date_days=$(date -j -f "%Y-%m-%d" "$publish_date" "+%s")
        else
            publish_date_days=$(date -d "$publish_date" "+%s")
        fi
        
        echo "  $filename: publish date = $publish_date"
    else
        publish_date_days=0
    fi

    # Get the current date in seconds since epoch
    current_date_days=$(date "+%s")

    # Check if publish_solutions is not in the yaml or the current date is before the publish date
    if [[ ! $yaml_content =~ "publish-solutions-on" ]] || (( current_date_days < publish_date_days )); then
        # Remove the corresponding .sol.html file in docs/HW
        if [[ -f "docs/HW/$filename.sol.html" ]]; then
            rm -f "docs/HW/$filename.sol.html"
            echo "  → Removed docs/HW/$filename.sol.html (not yet published)"
        fi
    else
        echo "  → Keeping docs/HW/$filename.sol.html (published)"
    fi

done

