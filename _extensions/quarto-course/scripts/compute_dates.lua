-- compute_dates.lua
-- Converts relative dates to absolute dates at render time using Quarto metadata

local function parse_date(date_str)
    -- Parse YYYY-MM-DD format
    local year, month, day = date_str:match("(%d+)-(%d+)-(%d+)")
    if year and month and day then
        return os.time({year=tonumber(year), month=tonumber(month), day=tonumber(day), hour=12})
    end
    return nil
end

local function format_date(timestamp)
    return os.date("%Y-%m-%d", timestamp)
end

local function parse_due_date(due_date_str, quarter_start)
    if not due_date_str then return nil end
    
    -- If already absolute date, return it
    if due_date_str:match("^%d%d%d%d%-%d%d%-%d%d$") then
        return due_date_str
    end
    
    -- Parse "Wednesday, Week 2" or "Week 2" format
    -- Try "DayName, Week N" first (common format)
    local day_name, week_num = due_date_str:match("(%a+),%s*Week%s+(%d+)")
    -- If that fails, try "Week N DayName" format
    if not week_num then
        week_num, day_name = due_date_str:match("Week%s+(%d+)%s+(%a+)")
    end
    -- If still no match, try just "Week N" (will default to Friday)
    if not week_num then
        week_num = due_date_str:match("Week%s+(%d+)")
    end
    
    if not week_num then return nil end
    if not quarter_start then return nil end
    
    week_num = tonumber(week_num)
    
    -- Day name to number (0=Sunday, 1=Monday, etc.)
    local day_map = {
        Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3,
        Thursday = 4, Friday = 5, Saturday = 6
    }
    
    local target_day = day_map[day_name] or 5  -- Default to Friday
    
    -- Get start date timestamp
    local start_ts = parse_date(quarter_start)
    if not start_ts then return nil end
    
    -- Get day of week for start date
    local start_day = tonumber(os.date("%w", start_ts))
    
    -- Calculate days to add
    local days_to_add = (week_num - 1) * 7
    days_to_add = days_to_add + ((target_day - start_day + 7) % 7)
    
    -- Calculate result date
    local result_ts = start_ts + (days_to_add * 24 * 3600)
    return format_date(result_ts)
end

local function parse_relative_offset(offset_str, base_date)
    if not offset_str or not base_date then return nil end
    
    -- Parse +Nw (weeks), +Nd (days), +Nm (months)
    local num, unit = offset_str:match("^([+-]?%d+)([wdm])$")
    if not num or not unit then return nil end
    
    num = tonumber(num)
    local base_ts = parse_date(base_date)
    if not base_ts then return nil end
    
    local days_to_add = 0
    if unit == "d" then
        days_to_add = num
    elseif unit == "w" then
        days_to_add = num * 7
    elseif unit == "m" then
        days_to_add = num * 30  -- Approximate
    end
    
    local result_ts = base_ts + (days_to_add * 24 * 3600)
    return format_date(result_ts)
end

local function parse_publish_date(publish_str, quarter_start, due_date)
    if not publish_str then return nil end
    
    -- If already absolute date, return it
    if publish_str:match("^%d%d%d%d%-%d%d%-%d%d$") then
        return publish_str
    end
    
    -- If relative offset (+1w, +2d, etc), compute from due_date
    if publish_str:match("^[+-]?%d+[wdm]$") then
        return parse_relative_offset(publish_str, due_date)
    end
    
    -- Otherwise parse as "Week N Day"
    return parse_due_date(publish_str, quarter_start)
end

local computed_dates_meta = {}

function Meta(meta)
    io.stderr:write("[compute_dates.lua] Meta function called\n")
    
    -- Get quarter start date from document metadata
    local quarter_start = nil
    if meta['quarter-start-date'] then
        quarter_start = pandoc.utils.stringify(meta['quarter-start-date'])
        io.stderr:write("[compute_dates.lua] Found quarter-start-date: " .. quarter_start .. "\n")
    else
        io.stderr:write("[compute_dates.lua] WARNING: No quarter-start-date found\n")
    end
    
    -- Process due-date
    if meta['due-date'] then
        local due_str = pandoc.utils.stringify(meta['due-date'])
        io.stderr:write("[compute_dates.lua] Processing due-date: " .. due_str .. "\n")
        local computed_due = parse_due_date(due_str, quarter_start)
        if computed_due then
            io.stderr:write("[compute_dates.lua] Computed due-date: " .. computed_due .. "\n")
            -- Store both original and computed
            meta['due-date-original'] = meta['due-date']
            meta['due-date-computed'] = pandoc.Str(computed_due)
            computed_dates_meta['due-date-computed'] = computed_due
        end
    end
    
    -- Process publish-solutions-on
    if meta['publish-solutions-on'] then
        local publish_str = pandoc.utils.stringify(meta['publish-solutions-on'])
        io.stderr:write("[compute_dates.lua] Processing publish-solutions-on: " .. publish_str .. "\n")
        local due_date = meta['due-date-computed'] and pandoc.utils.stringify(meta['due-date-computed']) or nil
        local computed_publish = parse_publish_date(publish_str, quarter_start, due_date)
        if computed_publish then
            io.stderr:write("[compute_dates.lua] Computed publish-solutions-on: " .. computed_publish .. "\n")
            -- Store computed value separately, preserve original
            meta['publish-solutions-on-computed'] = pandoc.Str(computed_publish)
            computed_dates_meta['publish-solutions-on-computed'] = computed_publish
        end
    end
    
    return meta
end

-- Inject computed dates into HTML as a script tag
function Pandoc(doc)
    io.stderr:write("[compute_dates.lua] Pandoc function called, FORMAT=" .. (FORMAT or "unknown") .. "\n")
    if FORMAT:match('html') and next(computed_dates_meta) then
        io.stderr:write("[compute_dates.lua] Injecting computed dates into HTML\n")
        -- Create JSON string
        local json_parts = {}
        for k, v in pairs(computed_dates_meta) do
            table.insert(json_parts, string.format('"%s": "%s"', k, v))
        end
        local json_str = "{" .. table.concat(json_parts, ", ") .. "}"
        
        -- Create script tag with metadata
        local script = pandoc.RawBlock('html', 
            '<script id="quarto-computed-dates" type="application/json">\n' ..
            json_str ..
            '\n</script>')
        
        -- Insert at beginning of body
        table.insert(doc.blocks, 1, script)
    end
    return doc
end

return {
    { Meta = Meta },
    { Pandoc = Pandoc }
}

