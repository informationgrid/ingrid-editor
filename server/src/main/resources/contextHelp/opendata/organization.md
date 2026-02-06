---
# ID des GUI Elements
id: organization
docType: OpenDataAddressDoc
profile: bmi
---

Der Name der Organisation, die einem Metadatensatz als Adresse hinzugefügt werden soll.

## DCAT-AP.de
Wird die Adresse als *Ansprechpartner* einem Metadatensatz hinzugefügt, so wird diese abgebildet als:<br />
`dcat:Dataset / dcat:contactPoint / vcard:Organization / vcard:fn`

Ansonsten z.B. als *Veröffentlichende Stelle*:<br />
`dcat:Dataset / dcterms:publisher / foaf:Agent / foaf:name`
