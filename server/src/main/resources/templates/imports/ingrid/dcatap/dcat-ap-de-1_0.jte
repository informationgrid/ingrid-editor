@param de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.DcatApDeMapper model

{
    "title": "${model.getTitle()}",
    "_uuid": "${model.getUuid()}",
    "_parent": @if(model.getParentUuid() == null) null @else "${model.getParentUuid()}"@endif,
    "_type": "${model.getType()}",
    "description": "${model.getDescription()}"
}