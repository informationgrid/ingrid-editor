@import de.ingrid.igeserver.tasks.ExpiredDataset
@import java.util.Map
@import java.util.List


@param Map<String, Object> map
!{var documents = ((List<ExpiredDataset>)map.get("datasets"));}
!{var linkstub = ((String)map.get("linkstub"));}

Dies ist eine Meldung von der Metadatenerfassungskomponente der InGrid® Software.
Sie sind als Verantwortlicher eines Metadatensatzes eingetragen, bei dem das Verfallsdatum abgelaufen ist.
Bitte prüfen Sie, ob die Angaben noch aktuell sind.

@for( ExpiredDataset expDS : documents )
Titel: ${expDS.getTitle()}
Uuid: ${expDS.getUuid()}
Geändert am: ${expDS.getModified().toString()}
Geändert von: ${expDS.getModifiedBy()}
!{var type = expDS.getType().equals("data") ? "form" : "address";}
Direkter Link: ${linkstub + "/" + type + ";id=" + expDS.getUuid()}

@endfor


