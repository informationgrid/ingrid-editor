@import de.ingrid.igeserver.model.KeyValue

@param KeyValue item

@if (item == null)null
@else
{
    "key":  @if (item.getKey() == null)null@else"${item.getKey()}"@endif,
    "value": "${item.getValue()}",
    "_codelistId": @if (item.get_codelistId() == null)null@else"${item.get_codelistId()}"@endif
}@endif
