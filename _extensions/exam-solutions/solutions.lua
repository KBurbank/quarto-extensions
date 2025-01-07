function Div(el)
    if quarto.doc.is_format("pdf") then
        if el.classes[1] == "solutions" then
        -- insert element in front
        table.insert(
        el.content, 1,
        pandoc.RawBlock("latex", "\\begin{solutions} Solution:"))
        -- insert element at the back
        table.insert(
        el.content,
        pandoc.RawBlock("latex", "\\end{solutions}"))
        end
    end
  return el
end





function Meta(meta)
    -- check that the title is not nil
    if meta.title then
        local title = pandoc.utils.stringify(meta.title)
        meta.title=title .. " Solutions"
    end
    return meta
end
