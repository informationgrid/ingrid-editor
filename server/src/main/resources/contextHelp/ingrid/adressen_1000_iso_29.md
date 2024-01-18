---
# ID des GUI Elements
id: pointOfContact
docType:
  - InGridDataCollection
  - InGridGeoDataset
  - InGridGeoService
  - InGridSpecialisedTask
  - InGridInformationSystem
  - InGridPublication
  - InGridProject
profile: ingrid


# title, used as window title
title: Adressen
---

# Adressen

Geben Sie hir Adressverweise zu Personen oder Organisationen an. Es sind mindestens zwei Adressen erforderlich:<br>
<li>Es ist mindestens eine Adresse anzugeben, die weitergehende Informationen zum beschriebenen Datensatz (der Ressource) geben kann. Für diese Adresse kann aus verschiedenen Typen (z.B. Ansprechpartner, Herausgeber, ...) ausgewählt werden, siehe Liste unten.<br>
<li>Es ist außerdem mindestens eine Adresse anzugeben, die Informationen zum Metadatensatz geben kann. Für diese Adresse muss der Adresstyp "Ansprechpartner MD" ausgewählt werden.<br><br>
Über den Button "Adresse hinzufügen" legen Sie einen neuen Adressverweis an. Im ersten Schritt wählen Sie eine Adresse aus allen Adressen aus, die in der Adressverwaltung des aktuellen Kataloges eingetragenen sind. Im zweiten Schritt wählen Sie einen Adresstyp aus. Bei Bedarf können Sie die Adressverweise ändern. 
<br><br><br><br><b>Mögliche Adresstypen laut ISO/INSPIRE (Abweichungen möglich):
</b><br><br><b>Anbieter</b><br>Anbieter der Ressource; ISO Adressrolle: resourceProvider<br><br><b>Ansprechpartner</b><br>Kontakt für Informationen zur Ressource oder deren Bezugsmöglichkeiten; ISO Adressrolle: pointOfContact<br><br><b>Ansprechpartner MD</b><br>Kontakt für Informationen zu den Metadaten; ISO Adressrolle: contact<br><br><b>Autor</b><br>Verfasser der Ressource; ISO Adressrolle: author<br><br><b>Bearbeiter</b><br>Person oder Stelle, die die Ressource in einem Arbeitsschritt verändert hat; ISO Adressrolle: processor<br><br><b>Eigentümer</b><br>Eigentümer der Ressource; ISO Adressrolle: owner<br><br><b>Herausgeber</b><br>Person oder Stelle, welche die Ressource veröffentlicht; ISO Adressrolle: publisher<br><br><b>Nutzer</b><br>Nutzer der Ressource; ISO Adressrolle: user<br><br><b>Projektleitung</b><br>Person oder Stelle, die verantwortlich für die Erhebung der Daten, Untersuchung ist; ISO Adressrolle: principalInvestigator<br><br><b>Urheber</b><br>Erzeuger der Ressource; ISO Adressrolle: originator<br><br><b>Vertrieb</b><br>Person oder Stelle für den Vertrieb; ISO Adressrolle: distributor, wird für ISO Stuktur distributionContact verwendet<br><br><b>Verwalter</b><br>Person oder Stelle, welche die Zuständigkeit und Verantwortlichkeit für einen Datensatz übernommen hat und seine sachgerechte Pflege und Wartung sichert; ISO Adressrolle: custodian

## Beispiel:

Ansprechpartner / Seehund, Siegrfried, Anbieter / Dr. Robbe, Antje

# ISO Abbildung

Kontaktinformation zu Person(en) und Organisation(en), welche im Bezug zu den Daten (zu der Ressource) stehen.

Domain: 29 (gmd:pointOfContact) 

Kontaktinformation zu Person(en) und Organisation(en), welche Informationen zu den Metadaten geben können oder für diese verantwortlich sind.

Domain: 8 (gmd:contact)

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
