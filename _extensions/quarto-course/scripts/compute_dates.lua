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
    local week_num, day_name = due_date_str:match("Week%s+(%d+)%s*,?%s*(%a*)")
    if not week_num then
        day_name, week_num = due_date_str:match("(%a+),%s*Week%s+(%d+)")
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

function Meta(meta)
    -- Get quarter start date from document metadata
    local quarter_start = nil
    if meta['quarter-start-date'] then
        quarter_start = pandoc.utils.stringify(meta['quarter-start-date'])
    end
    
    -- Process due-date
    if meta['due-date'] then
        local due_str = pandoc.utils.stringify(meta['due-date'])
        local computed_due = parse_due_date(due_str, quarter_start)
        if computed_due then
            -- Store both original and computed
            meta['due-date-original'] = meta['due-date']
            meta['due-date-computed'] = pandoc.Str(computed_due)
        end
    end
    
    -- Process publish-solutions-on
    if meta['publish-solutions-on'] then
        local publish_str = pandoc.utils.stringify(meta['publish-solutions-on'])
        local due_date = meta['due-date-computed'] and pandoc.utils.stringify(meta['due-date-computed']) or nil
        local computed_publish = parse_publish_date(publish_str, quarter_start, due_date)
        if computed_publish then
            -- Store computed value separately, preserve original
            meta['publish-solutions-on-computed'] = pandoc.Str(computed_publish)
        end
    end
    
    return meta
end

return {
    { Meta = Meta }
}

