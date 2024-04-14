
function Div(elem)
        local classes = elem.classes
        if not quarto.doc.is_format("revealjs") then
            for _, class in ipairs(classes) do
                if class == "solutions" then
                    -- remove this div
                    return {}
                end
                
            end
        end
        -- if we haven't returned yet, keep the div
        return elem
    end