@import de.ingrid.igeserver.profiles.ingrid.importer.KeyValue

@param KeyValue item

{
@if (item.getKey() == null)
    "key": null,
    "value": "${item.getValue()}"
@else 
    "key": "${item.getKey()}"
@endif
}
