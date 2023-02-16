@import de.ingrid.igeserver.exporter.model.KeyValueModel
@import de.ingrid.igeserver.exports.iso19115.Keyword
@import de.ingrid.igeserver.exports.iso19115.Thesaurus

@param KeyValueModel model

@if(model.getValue() != null )
    <gmx:Anchor xlink:href="${model.getValue()}">${model.getKey()}</gmx:Anchor>
@else
    <gco:CharacterString>${model.getKey()}</gco:CharacterString>
@endif

