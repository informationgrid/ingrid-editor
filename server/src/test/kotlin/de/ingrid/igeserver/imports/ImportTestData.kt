/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.imports

val minimalMetadata = """
    <gmd:MD_Metadata xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:gmx="http://www.isotc211.org/2005/gmx" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:igctx="https://www.ingrid-oss.eu/schemas/igctx" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.isotc211.org/2005/gmd http://repository.gdi-de.org/schemas/geonetwork/2020-12-11/csw/2.0.2/profiles/apiso/1.0.1/apiso.xsd https://www.ingrid-oss.eu/schemas/igctx https://www.ingrid-oss.eu/schemas/igctx/igctx.xsd">
        <gmd:language>
            <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/" codeListValue="ger"/>
        </gmd:language>
        <gmd:contact></gmd:contact>
        <gmd:dateStamp></gmd:dateStamp>
        <gmd:hierarchyLevel>
            <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="service">service</gmd:MD_ScopeCode>
        </gmd:hierarchyLevel>
        <gmd:identificationInfo>
            <srv:SV_ServiceIdentification uuid="http://portalu.de/igc_testNS#/24E752FF-CB61-37A8-ADD9-105F9A28943A">
                <gmd:citation></gmd:citation>
                <gmd:abstract></gmd:abstract>
            </srv:SV_ServiceIdentification>
        </gmd:identificationInfo>
    </gmd:MD_Metadata>
""".trimIndent()

val expectedParentOrganisation = """
{
  "_uuid": "D",
  "_type": "InGridOrganisationDoc",
  "organization": "Objektbesitzer Institut",
  "contact": [],
  "positionName": "",
  "hoursOfService": ""
}""".trimIndent()

val expectedOrganisationWithPositionName = """
{
  "_uuid": "2B83F58E-60C2-11D6-884A-0000F4ABB4D8",
  "_type": "InGridOrganisationDoc",
  "organization": "Objektbesitzer Institut",
  "contact": [],
  "positionName": "Something",
  "hoursOfService": ""
}""".trimIndent()

val expectedOrganisationReferat1 = """
{
  "_uuid": "A",
  "_type": "InGridOrganisationDoc",
  "organization": "Referat 1",
  "contact": [],
  "positionName": "",
  "hoursOfService": "",
  "parentAsUuid": "D"
}""".trimIndent()

val expectedOrganisationAbteilung3 = """
{
  "_uuid": "B",
  "_type": "InGridOrganisationDoc",
  "organization": "Abteilung 3",
  "contact": [],
  "positionName": "",
  "hoursOfService": "",
  "parentAsUuid": "A"
}""".trimIndent()

val expectedPersonSingle = """
{
  "_uuid": "2B83F58E-60C2-11D6-884A-0000F4ABB4D8",
  "_type": "InGridPersonDoc",
  "salutation": {
    "key": "2"
  },
  "firstName": "Besitzervorname",
  "lastName": "Besitzername",
  "contact": [],
  "positionName": "",
  "hoursOfService": ""
}""".trimIndent()

val expectedPersonPositionName = """
{
  "_uuid": "2B83F58E-60C2-11D6-884A-0000F4ABB4D8",
  "_type": "InGridPersonDoc",
  "salutation": {
    "key": "2"
  },
  "firstName": "Besitzervorname",
  "lastName": "Besitzername",
  "contact": [],
  "positionName": "Liegenschaftsbuch (ALB)",
  "hoursOfService": ""
}""".trimIndent()

val expectedPersonUnderOrganisation = """
{
  "_uuid": "2B83F58E-60C2-11D6-884A-0000F4ABB4D8",
  "_type": "InGridPersonDoc",
  "salutation": {
    "key": "2"
  },
  "firstName": "Besitzervorname",
  "lastName": "Besitzername",
  "contact": [],
  "positionName": "Liegenschaftsbuch (ALB)",
  "hoursOfService": "",
  "parentAsUuid": "D"
}""".trimIndent()

val expectedPersonUnderOrganisation2 = """
{
  "_uuid": "2B83F58E-60C2-11D6-884A-0000F4ABB4D8",
  "_type": "InGridPersonDoc",
  "salutation": {
    "key": "2"
  },
  "firstName": "Besitzervorname",
  "lastName": "Besitzername",
  "contact": [],
  "positionName": "Referat 1,Abteilung 3",
  "hoursOfService": "",
  "parentAsUuid": "D"
}""".trimIndent()