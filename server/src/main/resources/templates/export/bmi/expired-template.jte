@import de.ingrid.igeserver.tasks.ExpiredDataset
@import java.util.Map
@import java.util.List


@param Map<String, Object> map
!{var documents = ((List<ExpiredDataset>)map.get("datasets"));}
!{var linkstub = ((String)map.get("linkstub"));}

Guten Tag,

Sie sind im Open Data Editor Bund als Verantwortlicher für Metadatensätze eingetragen, für die eine Wiedervorlage vorgesehen ist.
Bitte prüfen Sie bei den unten aufgeführten Metadaten, ob Änderungen erforderlich sind oder die Metadaten belassen werden können.

Zu prüfende Metadaten:

@for( ExpiredDataset expDS : documents )
Titel: ${expDS.getTitle()}
UUID: ${expDS.getUuid()}
Geändert am: ${expDS.getModified().toString()}
Geändert von: ${expDS.getModifiedBy()}
!{var type = expDS.getType().equals("data") ? "form" : "address";}
Direkter Link: ${linkstub + "/" + type + ";id=" + expDS.getUuid()}

@endfor

Vielen Dank und viele Grüße,
Ihr Open Data Team
