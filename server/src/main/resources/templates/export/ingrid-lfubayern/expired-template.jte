@import de.ingrid.igeserver.tasks.ExpiredDataset
@import java.util.Map
@import java.util.List


@param Map<String, Object> map
!{var documents = ((List<ExpiredDataset>)map.get("datasets"));}
!{var linkstub = ((String)map.get("linkstub"));}

Dies ist eine automatische Meldung des LfU-Metainformationssystems. Bei Fragen wenden Sie sich bitte an das Postfach gdi-admin@lfu.bayern.de.

Sie sind als Verantwortlicher eines Metadatensatzes (bzw. einer Adresse) eingetragen, der (bzw. die) seit einem Jahr nicht mehr aktualisiert wurde.
Bitte prüfen Sie, ob die Angaben noch aktuell sind und speichern/veröffentlichen Sie den Metadatensatz neu. Sie finden die Übersicht über abgelaufene Metadaten auch im Editor unter Reports.

@for( ExpiredDataset expDS : documents )
Titel: ${expDS.getTitle()}
UUID: ${expDS.getUuid()}
Geändert am: ${expDS.getContentmodified().toString()}
Geändert von: ${expDS.getContentmodifiedBy()}
!{var type = expDS.getCategory().equals("data") ? "form" : "address";}
Direkter Link: ${linkstub + "/" + type + ";id=" + expDS.getUuid()}

@endfor


