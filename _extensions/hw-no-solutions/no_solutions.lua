
function Div(elem)
        local classes = elem.classes
   
            for _, class in ipairs(classes) do
                if (class == "solutions") then
                    -- remove this div
                    return {}
                end
                
                
            end

        -- if we haven't returned yet, keep the div
        return elem
    end