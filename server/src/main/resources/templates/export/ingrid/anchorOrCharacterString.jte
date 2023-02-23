@import de.ingrid.igeserver.exporter.model.CharacterStringModel

@param CharacterStringModel model

@if(model.getLink() != null )
    <gmx:Anchor xlink:href="${model.getLink()}">${model.getText()}</gmx:Anchor>
@else
    <gco:CharacterString>${model.getText()}</gco:CharacterString>
@endif

