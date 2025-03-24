function HorizontalRule(elem)
  return pandoc.RawBlock('latex', '\\framebreak')
end

return {
  {HorizontalRule = HorizontalRule}
} 