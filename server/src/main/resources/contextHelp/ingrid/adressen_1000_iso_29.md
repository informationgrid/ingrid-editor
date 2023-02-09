---
# ID des GUI Elements
id: pointOfContact
docType:
  - InGridDataCollection
  - InGridGeoDataset
  - InGridGeoService
  - InGridSpecialisedTask
  - InGridInformationSystem
  - InGridLiterature
  - InGridProject
profile: ingrid


# title, used as window title
title: Adressen
---

# Adressen

Eintrag von Adressverweisen zu Personen oder Institutionen, die weitergehende Informationen zum beschriebenen Datensatz geben können. Bei Bedarf können diese Verweise geändert werden. In der ersten Spalte wird jeweils die Art des Verweises eingetragen (Ansprechpartner, Anbieter, etc.). Über den Link "Adresse hinzufügen" wird der Verweis selbst angelegt. Als Auswahlmöglichkeit stehen alle in der Adressverwaltung des aktuellen Kataloges bereits eingetragenen Adressen zur Verfügung. Über das Kontextmenü ist es möglich, Adressen zu kopieren und einzufügen.<br><br>Es ist mind. eine Adresse anzugeben. Es sollte mind. ein Ansprechpartner angegeben werden.<br><br><b>Mögliche Einträge laut ISO/INSPIRE (Abweichungen möglich):</b><br><br><b>Anbieter</b><br>Anbieter der Ressource; ISO Adressrolle: resourceProvider<br><br><b>Ansprechpartner</b><br>Kontakt für Informationen zur Ressource oder deren Bezugsmöglichkeiten; ISO Adressrolle: pointOfContact<br><br><b>Autor</b><br>Verfasser der Ressource; ISO Adressrolle: author<br><br><b>Bearbeiter</b><br>Person oder Stelle, die die Ressource in einem Arbeitsschritt verändert hat; ISO Adressrolle: processor<br><br><b>Eigentümer</b><br>Eigentümer der Ressource; ISO Adressrolle: owner<br><br><b>Herausgeber</b><br>Person oder Stelle, welche die Ressource veröffentlicht; ISO Adressrolle: publisher<br><br><b>Nutzer</b><br>Nutzer der Ressource; ISO Adressrolle: user<br><br><b>Projektleitung</b><br>Person oder Stelle, die verantwortlich für die Erhebung der Daten, Untersuchung ist; ISO Adressrolle: principalInvestigator<br><br><b>Urheber</b><br>Erzeuger der Ressource; ISO Adressrolle: originator<br><br><b>Vertrieb</b><br>Person oder Stelle für den Vertrieb; ISO Adressrolle: distributor, wird für ISO Stuktur distributionContact verwendet<br><br><b>Verwalter</b><br>Person oder Stelle, welche die Zuständigkeit und Verantwortlichkeit für einen Datensatz übernommen hat und seine sachgerechte Pflege und Wartung sichert; ISO Adressrolle: custodian

## Beispiel:

Ansprechpartner / Robbe, Antje, Anbieter / Dr. Seehund, Siegfried

# ISO Abbildung

Kontaktinformation zu Person(en) und Organisation(en), welche im Bezug zur Ressource stehen

Domain: 29 (gmd:pointOfContact)


## Abbildung ISO 19139 XML

```XML
<MD_Metadata>
  <identificationInfo>
    <MD_DataIdentification>
      <pointOfContact>
        <CI_ResponsibleParty uuid="UUID OF CONTACT">
          CONTACT INFOS
          <role>
            <CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="ROLE CODE"/>
          </role>
        </CI_ResponsibleParty>
    </MD_DataIdentification>
  </identificationInfo>
</MD_Metadata>
```
