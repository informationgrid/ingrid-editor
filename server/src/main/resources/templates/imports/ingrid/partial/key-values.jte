@import de.ingrid.igeserver.model.KeyValue
@import gg.jte.support.ForSupport
@import java.util.List

@param List<KeyValue> list

[
    @for(var item : ForSupport.of(list))
        @template.imports.ingrid.partial.key-value(item = item.get())@if (!item.isLast()),@endif
    @endfor
]
