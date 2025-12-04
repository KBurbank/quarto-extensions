#!/bin/bash

# Function to parse relative dates like "Week 2 Friday"
parse_relative_date() {
    local relative_date="$1"
    local quarter_start="$2"
    
    # If it's already in YYYY-MM-DD format, return it
    if [[ $relative_date =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo "$relative_date"
        return
    fi
    
    # Parse "Week N [Day]" format
    if [[ $relative_date =~ Week[[:space:]]+([0-9]+)([[:space:]]+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))? ]]; then
        local week_num="${BASH_REMATCH[1]}"
        local day_name="${BASH_REMATCH[3]}"
        
        # Default to Friday if no day specified
        if [[ -z $day_name ]]; then
            day_name="Friday"
        fi
        
        # Convert day name to number (0=Sunday, 6=Saturday)
        case $day_name in
            Sunday) day_num=0 ;;
            Monday) day_num=1 ;;
            Tuesday) day_num=2 ;;
            Wednesday) day_num=3 ;;
            Thursday) day_num=4 ;;
            Friday) day_num=5 ;;
            Saturday) day_num=6 ;;
        esac
        
        # Calculate the date
        # Get day of week of quarter start (0-6)
        start_day=$(date -j -f "%Y-%m-%d" "$quarter_start" "+%w")
        
        # Days to add: (week_num - 1) * 7 + adjustment for target day
        days_to_add=$(( (week_num - 1) * 7 ))
        
        # Adjust to target day of week
        day_diff=$(( (day_num - start_day + 7) % 7 ))
        days_to_add=$(( days_to_add + day_diff ))
        
        # Calculate the final date
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS date command
            result_date=$(date -j -v+${days_to_add}d -f "%Y-%m-%d" "$quarter_start" "+%Y-%m-%d")
        else
            # GNU date command (Linux)
            result_date=$(date -d "$quarter_start + $days_to_add days" "+%Y-%m-%d")
        fi
        
        echo "$result_date"
        return
    fi
    
    # If parsing failed, return empty
    echo ""
}

# Read quarter start date from _quarto.yml or index.qmd
# First try to find it in index.qmd
quarter_start=""
if [[ -f "index.qmd" ]]; then
    quarter_start=$(grep -A 20 "template-params:" index.qmd | grep "quarter-start-date:" | sed 's/.*quarter-start-date:[[:space:]]*"\([^"]*\)".*/\1/')
fi

# If not found, try _quarto.yml
if [[ -z $quarter_start ]] && [[ -f "_quarto.yml" ]]; then
    quarter_start=$(grep "quarter-start-date:" _quarto.yml | sed 's/.*quarter-start-date:[[:space:]]*"\([^"]*\)".*/\1/')
fi

echo "Quarter start date: $quarter_start"

# Loop through all .qmd files in the HW directory
for file in HW/*.qmd; do
    # Skip if no files found
    [[ -e "$file" ]] || continue
    
    # Extract the filename without extension
    filename=$(basename -- "$file")
    filename="${filename%.*}"

    # Read the yaml content
    yaml_content=$(sed -n '/---/,/---/p' "$file")

    # Extract the publish-solutions-on value (may be relative or absolute)
    publish_date_raw=$(echo "$yaml_content" | grep 'publish-solutions-on:' | sed 's/publish-solutions-on:[[:space:]]*//')
    
    # Check if publish_date_raw is not empty
    if [[ -n $publish_date_raw ]]; then
        # Parse the date (handles both absolute and relative)
        publish_date=$(parse_relative_date "$publish_date_raw" "$quarter_start")
        
        if [[ -n $publish_date ]]; then
            # Convert the publish date to seconds since epoch
            if [[ "$OSTYPE" == "darwin"* ]]; then
                publish_date_days=$(date -j -f "%Y-%m-%d" "$publish_date" "+%s")
            else
                publish_date_days=$(date -d "$publish_date" "+%s")
            fi
            
            echo "  $filename: publish date = $publish_date (from: $publish_date_raw)"
        else
            echo "  $filename: could not parse date: $publish_date_raw"
            publish_date_days=0
        fi
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

