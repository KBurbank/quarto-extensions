#!/bin/bash

# Loop through all .qmd files in the HW directory
for file in HW/*.qmd; do
    # Extract the filename without extension
    filename=$(basename -- "$file")
    filename="${filename%.*}"

    # Read the yaml content
    yaml_content=$(sed -n '/---/,/---/p' "$file")

    # Extract the publish-solutions-on date
    publish_date=$(echo "$yaml_content" | grep 'publish-solutions-on' | cut -d' ' -f2)
    # Check if the publish_date is not empty
    if [[ -n $publish_date ]]; then
        # Convert the publish date to days since 1970-01-01
        publish_date_days=$(date -j -f "%Y-%m-%d" "$publish_date" "+%s")
    else
        publish_date_days=0
    fi

    # Get the current date in days since 1970-01-01
    current_date_days=$(date "+%s")
  


    # Check if publish_solutions is not in the yaml or it equals false, or the current date is before the publish date
    if [[ ! $yaml_content =~ "publish-solutions-on" ]] || (( current_date_days < publish_date_days )); then

        # Remove the corresponding .sol.html file in docs/HW
        rm -f "docs/HW/$filename.sol.html"
    fi

done