@import de.ingrid.igeserver.model.KeyValue

@param KeyValue item

@if (item == null)null
@else
{
    @if (item.getKey() == null)
    "key": null,
    "value": "${item.getValue()}"
    @else 
    "key": "${item.getKey()}"
    @endif
}@endif