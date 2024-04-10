-- Reformat all heading text 
function Header(el)
    el.content = pandoc.Emph(el.content)
    return el
  end

function Div(div)
  -- process exercise
  if div.classes:includes("callout-exercise") then
    -- default title
    local title = "Exercise"
    -- Use first element of div as title if this is a header
    if div.content[1] ~= nil and div.content[1].t == "Header" then
      title = pandoc.utils.stringify(div.content[1])
      div.content:remove(1)
    end
    -- return a callout instead of the Div
    return quarto.Callout({
      type = "exercise",
      content = { pandoc.Div(div) },
      title = title,
      collapse = false
    })
  end
  
  -- process answer
  if div.classes:includes("callout-answer") then
    -- default title
    local title = "Answer"
    -- return a callout instead of the Div
    return quarto.Callout({
      type = "answer",
      content = { pandoc.Div(div) },
      title = "A new title",
      collapse = true
    })
  end
  
  -- process hint
  if div.classes:includes("callout-comment") then
    -- default title
    local title = "Comment"
    -- return a callout instead of the Div
    return quarto.Callout({
      type = "note",
      content = { pandoc.Div(div) },
      title = title,
      collapse = false,
      icon = true
    })
  end

  if div.classes:includes("callout-example") then
    -- default title
    local title = "Example"
    -- return a callout instead of the Div
    return quarto.Callout({
      type = "tip",
      content = { pandoc.Div(div) },
      title = title,
      collapse = false,
      icon = true
    })
  end

  if div.classes:includes("callout-definition") then
    -- default title
    local title = "Definition"
    -- return a callout instead of the Div
    return quarto.Callout({
      type = "important",
      content = { pandoc.Div(div) },
      title = title,
      collapse = false,
      icon = true
    })
  end

  if div.classes:includes("callout-pause") then
    -- default title
    local title = "Pause"
    -- return a callout instead of the Div
    return quarto.Callout({
      type = "warning",
      content = { pandoc.Div(div) },
      title = title,
      collapse = false,
      icon = true
    })
  end

  if div.classes:includes("icon_notes") then
    -- default title
    local title = "Note"
    -- return a callout instead of the Div
    return quarto.Callout({
      type = "note",
      content = { pandoc.Div(div) },
      title = title,
      collapse = false,
      icon = true
    })
  end
end