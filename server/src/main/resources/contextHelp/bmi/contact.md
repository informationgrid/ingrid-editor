---
# ID des GUI Elements
id: contact
docType: BmiAddressDoc
profile: bmi
---

Geben Sie hier die Kontaktdaten der Organisation an.<br />
**Es muss mindestens eine E-Mail-Adresse angegeben werden.**

### DCAT-AP.de
Wird die Adresse als *Ansprechpartner* einem Metadatensatz hinzugefügt, so wird diese abgebildet als:<br />
`dcat:Dataset / dcat:contactPoint / vcard:Organization / vcard:hasEmail + vcard:hasURL`

Ansonsten z.B. als *Veröffentlichende Stelle*:<br />
`dcat:Dataset / dcterms:publisher / foaf:Agent / foaf:mbox + foaf:homepage`
