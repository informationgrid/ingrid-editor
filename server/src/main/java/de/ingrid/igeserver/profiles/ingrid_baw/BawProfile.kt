/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_baw

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_baw.importer.ISOImportBaw
import de.ingrid.igeserver.profiles.ingrid_baw.quickfilter.DocumentTypesBaw
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class BawProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
    isoImport: ISOImport,
    isoImportBaw: ISOImportBaw,
    @JsonIgnore val behaviourService: BehaviourService,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val ID = "ingrid-baw"
    }

    override val identifier = ID
    override val title = "InGrid Katalog (BAW)"
    override val parentProfile = "ingrid"

    init {
        isoImport.profileMapper[ID] = isoImportBaw
    }

    override fun getElasticsearchMapping(format: String): String = {}.javaClass.getResource("/ingrid/mappings/baw/default-mapping.json")?.readText() ?: ""

    override val indexExportFormatID = "indexInGridIDFBaw"
    private val boundingBoxGermany = """{ "lat1": 47.2701114, "lon1": 5.8663153, "lat2": 55.099161, "lon2": 15.0419309 }"""

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> = super.getFacetDefinitionsForDocuments().map { if (it.id == "docType") bawTypeFacetGroup else it }.toTypedArray()

    val bawTypeFacetGroup = FacetGroup(
        "docType",
        "Datensatztyp",
        arrayOf(
            DocumentTypesBaw(),
        ),
        viewComponent = ViewComponent.SELECT,
    )

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelists = mapOf(
            "3950000" to createCodelistDimensionCode(catalogRef),
            "3950001" to createCodelistModellverfahrenCode(catalogRef),
            "3950003" to createCodelist3950003(catalogRef),
            "3950004" to createCodelist3950004(catalogRef),
            "3950007" to createCodelist3950007(catalogRef),
            "3950011" to createCodelist3950011(catalogRef),
            "3950012" to createCodelist3950012(catalogRef),
            "3950014" to createCodelist3950014(catalogRef),
            "3950020" to createCodelist3950020(catalogRef),
            "3950021" to createCodelist3950021(catalogRef),
            "3950030" to createCodelist3950030(catalogRef),
            "3950031" to createCodelist3950031(catalogRef),
            "3950032" to createCodelist3950032(catalogRef),
            "3950033" to createCodelist3950033(catalogRef),
            "identifierType" to createCodelistIdentifierType(catalogRef),
            "verticalSpatialSystems" to createCodelistVerticalSpatialSystems(catalogRef),
            "bwastrids" to createBwaStrIds(catalogRef),
        )

        if (codelists.containsKey(codelistId)) {
            codelistHandler.removeAndAddCodelist(catalogId, codelists[codelistId]!!)
        } else if (codelistId == null) {
            // remove all codelists and add them again
            codelistHandler.removeAndAddCodelists(catalogId, codelists.values.toList())
            super.initCatalogCodelists(catalogId, null)
        } else {
            super.initCatalogCodelists(catalogId, codelistId)
        }
    }

    override fun initCatalogQueries(catalogId: String) {
        val behaviours = listOf("plugin.publish").map {
            Behaviour().apply {
                name = it
                active = true
                data = mapOf("unpublishDisabled" to true)
            }
        }
        behaviourService.save(catalogId, behaviours)
    }

    private fun createBwaStrIds(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "bwastrids"
        catalog = catalogRef
        name = "Bundeswasserstraßen-IDs"
        description = "Zusätzliche IDs, die nicht im BWaStr. Locator vorhanden sind"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("7000", "7000 Nordsee", """{ "lat1": 53.28, "lon1": 3.34, "lat2": 56.04, "lon2": 9.05 }"""))
            add(CodelistHandler.toCodelistEntry("8000", "8000 Ostsee", """{ "lat1": 53.68, "lon1": 9.41, "lat2": 55.11, "lon2": 14.82 }"""))
            add(CodelistHandler.toCodelistEntry("8300", "8300 Ryck"))
            add(CodelistHandler.toCodelistEntry("9600", "9600 Binnenwasserstraßen", boundingBoxGermany))
            add(CodelistHandler.toCodelistEntry("9700", "9700 Seewasserstraßen", boundingBoxGermany))
            add(CodelistHandler.toCodelistEntry("9800", "9800 Bundeswasserstraßen", boundingBoxGermany))
            add(CodelistHandler.toCodelistEntry("9900", "9900 Sonstige Gewässer", boundingBoxGermany))
            add(CodelistHandler.toCodelistEntry("9999", "9999 Sonstiger Ortsbezug", boundingBoxGermany))
        }
    }

    private fun createCodelist3950011(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950011"
        catalog = catalogRef
        name = "Messverfahren"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Vertikalecholot"))
            add(CodelistHandler.toCodelistEntry("2", "Fächerecholot"))
            add(CodelistHandler.toCodelistEntry("3", "Stangenpeilung"))
            add(CodelistHandler.toCodelistEntry("4", "ADV (Acoustic Doppler Velocimetry)"))
            add(CodelistHandler.toCodelistEntry("5", "ADCP (Acoustic Doppler Current Profiler)"))
            add(CodelistHandler.toCodelistEntry("6", "Photogrammetrie"))
            add(CodelistHandler.toCodelistEntry("7", "PIV (Particle Image Velocimetry)"))
            add(CodelistHandler.toCodelistEntry("8", "Messflügel"))
            add(CodelistHandler.toCodelistEntry("9", "Drucksonde"))
            add(CodelistHandler.toCodelistEntry("10", "CTD (Conductivity, Temperature, Depth)"))
            add(CodelistHandler.toCodelistEntry("11", "Terrestrische Messung"))
            add(CodelistHandler.toCodelistEntry("12", "Laserscanner"))
            add(CodelistHandler.toCodelistEntry("13", "Siebung"))
        }
    }

    private fun createCodelist3950012(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950012"
        catalog = catalogRef
        name = "Räumlichkeit"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Querprofil (voll)"))
            add(CodelistHandler.toCodelistEntry("2", "Querprofil (teil)"))
            add(CodelistHandler.toCodelistEntry("3", "Längsprofil"))
            add(CodelistHandler.toCodelistEntry("4", "Punkt"))
            add(CodelistHandler.toCodelistEntry("5", "Fläche"))
        }
    }

    private fun createCodelist3950014(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950014"
        catalog = catalogRef
        name = "Zielparameter - Art"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Gemessen", english = "Measured"))
            add(CodelistHandler.toCodelistEntry("2", "Berechnet", english = "Calculated"))
        }
    }

    private fun createCodelist3950020(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950020"
        catalog = catalogRef
        name = "Maßeinheiten"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "s", iso = "s"))
            add(CodelistHandler.toCodelistEntry("2", "m", iso = "m"))
            add(CodelistHandler.toCodelistEntry("3", "kg", iso = "kg"))
            add(CodelistHandler.toCodelistEntry("4", "A", iso = "A"))
            add(CodelistHandler.toCodelistEntry("5", "K", iso = "K"))
            add(CodelistHandler.toCodelistEntry("6", "mol", iso = "mol"))
            add(CodelistHandler.toCodelistEntry("7", "cd", iso = "cd"))
            add(CodelistHandler.toCodelistEntry("8", "cm", iso = "cm"))
            add(CodelistHandler.toCodelistEntry("9", "m s-1", iso = "m s-1"))
            add(CodelistHandler.toCodelistEntry("10", "min", iso = "min"))
            add(CodelistHandler.toCodelistEntry("11", "m3 s-1", iso = "m3 s-1"))
            add(CodelistHandler.toCodelistEntry("12", "Hz", iso = "Hz"))
            add(CodelistHandler.toCodelistEntry("13", "kHz", iso = "kHz"))
            add(CodelistHandler.toCodelistEntry("14", "℃", iso = "℃"))
            add(CodelistHandler.toCodelistEntry("15", "kg m-3", iso = "kg m-3"))
            add(CodelistHandler.toCodelistEntry("16", "%", iso = "%"))
        }
    }

    private fun createCodelist3950021(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950021"
        catalog = catalogRef
        name = "Zielparameter - Name"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Frequenz"))
            add(CodelistHandler.toCodelistEntry("2", "Temperatur"))
            add(CodelistHandler.toCodelistEntry("3", "Wasserstand"))
            add(CodelistHandler.toCodelistEntry("4", "Wassertiefe"))
            add(CodelistHandler.toCodelistEntry("5", "Dichte"))
            add(CodelistHandler.toCodelistEntry("6", "Druck"))
            add(CodelistHandler.toCodelistEntry("7", "Luftdruck"))
            add(CodelistHandler.toCodelistEntry("8", "Durchfluss"))
            add(CodelistHandler.toCodelistEntry("9", "Korngrößenverteilung"))
            add(CodelistHandler.toCodelistEntry("10", "Sohlhöhe"))
            add(CodelistHandler.toCodelistEntry("11", "Salzgehalt"))
            add(CodelistHandler.toCodelistEntry("12", "Strömungsrichtung"))
            add(CodelistHandler.toCodelistEntry("13", "Strömungsgeschwindigkeit (Betrag)"))
            add(CodelistHandler.toCodelistEntry("14", "Strömungsgeschwindigkeit (Komponenten)"))
            add(CodelistHandler.toCodelistEntry("15", "Windgeschwindigkeit"))
            add(CodelistHandler.toCodelistEntry("16", "Windrichtung"))
            add(CodelistHandler.toCodelistEntry("17", "Turbulente kinetische Energie"))
            add(CodelistHandler.toCodelistEntry("18", "Trübung"))
            add(CodelistHandler.toCodelistEntry("19", "Pegelstand"))
            add(CodelistHandler.toCodelistEntry("20", "Signifikante Wellenhöhe"))
            add(CodelistHandler.toCodelistEntry("21", "Peak-Periode"))
            add(CodelistHandler.toCodelistEntry("22", "Richtung des Energiemaximums"))
        }
    }

    private fun createCodelist3950003(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950003"
        catalog = catalogRef
        name = "Simulationsmodellart"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "fahrdynamisch"))
            add(CodelistHandler.toCodelistEntry("2", "Feststofftransportmodell"))
            add(CodelistHandler.toCodelistEntry("3", "numerisch-hydraulisch", description = "Telemac"))
            add(CodelistHandler.toCodelistEntry("4", "gegenständlich-hydraulisch"))
            add(CodelistHandler.toCodelistEntry("5", "hydrodynamisch", description = "Telemac"))
            add(CodelistHandler.toCodelistEntry("6", "hydrologisch"))
            add(CodelistHandler.toCodelistEntry("7", "Mehrphasenmodell"))
            add(CodelistHandler.toCodelistEntry("8", "Naturversuch"))
            add(CodelistHandler.toCodelistEntry("9", "numerisch"))
            add(CodelistHandler.toCodelistEntry("10", "gegenständlich"))
            add(CodelistHandler.toCodelistEntry("11", "Advektion", description = "Telemac\nRismo"))
            add(CodelistHandler.toCodelistEntry("12", "Diffusion", description = "Telemac\nRismo"))
            add(CodelistHandler.toCodelistEntry("13", "Turbulenz", description = "Telemac\nRismo"))
            add(CodelistHandler.toCodelistEntry("14", "Seegang"))
            add(CodelistHandler.toCodelistEntry("15", "Morphodynamik"))
        }
    }

    private fun createCodelist3950004(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950004"
        catalog = catalogRef
        name = "Simulationsparameter - Rolle"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Bathymetrie"))
            add(CodelistHandler.toCodelistEntry("2", "Randbedingung"))
            add(CodelistHandler.toCodelistEntry("3", "Anfangsbedingung"))
            add(CodelistHandler.toCodelistEntry("4", "Ergebnis"))
            add(CodelistHandler.toCodelistEntry("5", "Kennwert"))
            add(CodelistHandler.toCodelistEntry("6", "Grafik"))
            add(CodelistHandler.toCodelistEntry("7", "Peilung"))
            add(CodelistHandler.toCodelistEntry("8", "Steuerungsdaten"))
            add(CodelistHandler.toCodelistEntry("9", "Protokoll"))
        }
    }

    private fun createCodelist3950007(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950007"
        catalog = catalogRef
        name = "Baugrunddynamik-Schlagworte"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Beweissicherung"))
            add(CodelistHandler.toCodelistEntry("2", "Messdaten BD"))
            add(CodelistHandler.toCodelistEntry("3", "Probemaßnahme"))
            add(CodelistHandler.toCodelistEntry("4", "Produktion"))
            add(CodelistHandler.toCodelistEntry("5", "Prognose"))
            add(CodelistHandler.toCodelistEntry("6", "Baugrund"))
            add(CodelistHandler.toCodelistEntry("7", "Bauteil"))
            add(CodelistHandler.toCodelistEntry("8", "Bauwerk"))
            add(CodelistHandler.toCodelistEntry("9", "Beton"))
            add(CodelistHandler.toCodelistEntry("10", "Boden"))
            add(CodelistHandler.toCodelistEntry("11", "Erdbeben"))
            add(CodelistHandler.toCodelistEntry("12", "Erschütterung"))
            add(CodelistHandler.toCodelistEntry("13", "Fundament"))
            add(CodelistHandler.toCodelistEntry("14", "Geophysik"))
            add(CodelistHandler.toCodelistEntry("15", "Schaden"))
            add(CodelistHandler.toCodelistEntry("16", "Schiffsschwingung"))
            add(CodelistHandler.toCodelistEntry("17", "Schiffsstoß"))
            add(CodelistHandler.toCodelistEntry("18", "Schwingung"))
            add(CodelistHandler.toCodelistEntry("19", "Schwingungsanregung"))
            add(CodelistHandler.toCodelistEntry("20", "Schwingungsminderung"))
            add(CodelistHandler.toCodelistEntry("21", "Seismik"))
            add(CodelistHandler.toCodelistEntry("22", "Denkmalschutz"))
            add(CodelistHandler.toCodelistEntry("23", "Erdbauwerk"))
            add(CodelistHandler.toCodelistEntry("24", "historische Bebauung"))
            add(CodelistHandler.toCodelistEntry("25", "Hochhaus"))
            add(CodelistHandler.toCodelistEntry("26", "Industriebau"))
            add(CodelistHandler.toCodelistEntry("27", "Kernkraftwerk"))
            add(CodelistHandler.toCodelistEntry("28", "Maschine"))
            add(CodelistHandler.toCodelistEntry("29", "Massivbauwerk"))
            add(CodelistHandler.toCodelistEntry("30", "Menschen"))
            add(CodelistHandler.toCodelistEntry("31", "Rohrleitung"))
            add(CodelistHandler.toCodelistEntry("32", "Tunnel"))
            add(CodelistHandler.toCodelistEntry("33", "Wohnhaus"))
            add(CodelistHandler.toCodelistEntry("34", "Dieselramme"))
            add(CodelistHandler.toCodelistEntry("35", "Fallgewicht"))
            add(CodelistHandler.toCodelistEntry("36", "Freifallramme"))
            add(CodelistHandler.toCodelistEntry("37", "Hydraulikramme"))
            add(CodelistHandler.toCodelistEntry("38", "Schnellschlagramme"))
            add(CodelistHandler.toCodelistEntry("39", "Vibrationsramme - HF"))
            add(CodelistHandler.toCodelistEntry("40", "Vibrieren"))
            add(CodelistHandler.toCodelistEntry("41", "Dalben"))
            add(CodelistHandler.toCodelistEntry("42", "Doppelbohle"))
            add(CodelistHandler.toCodelistEntry("43", "Einzelbohle"))
            add(CodelistHandler.toCodelistEntry("44", "Frankipfahl"))
            add(CodelistHandler.toCodelistEntry("45", "Schrägpfahl"))
            add(CodelistHandler.toCodelistEntry("46", "Sonderprofil"))
            add(CodelistHandler.toCodelistEntry("47", "Baggern"))
            add(CodelistHandler.toCodelistEntry("48", "Bohren"))
            add(CodelistHandler.toCodelistEntry("49", "Bohren - Austausch"))
            add(CodelistHandler.toCodelistEntry("50", "Fräsen"))
            add(CodelistHandler.toCodelistEntry("51", "Meißeln Abbruch"))
            add(CodelistHandler.toCodelistEntry("52", "Meißeln Fels"))
            add(CodelistHandler.toCodelistEntry("53", "Pressen"))
            add(CodelistHandler.toCodelistEntry("54", "Reißen"))
            add(CodelistHandler.toCodelistEntry("55", "Sprengung Abbruch"))
            add(CodelistHandler.toCodelistEntry("56", "Sprengung Boden"))
            add(CodelistHandler.toCodelistEntry("57", "Verdichten"))
            add(CodelistHandler.toCodelistEntry("58", "Verdichten-Intensivverdichtung"))
            add(CodelistHandler.toCodelistEntry("59", "Verkehr"))
            add(CodelistHandler.toCodelistEntry("60", "Ziehen"))
            add(CodelistHandler.toCodelistEntry("61", "Messwerte im Gutachten"))
            add(CodelistHandler.toCodelistEntry("62", "s-Bauwerk"))
            add(CodelistHandler.toCodelistEntry("63", "s-Boden"))
            add(CodelistHandler.toCodelistEntry("64", "Setzung"))
            add(CodelistHandler.toCodelistEntry("65", "v-1D"))
            add(CodelistHandler.toCodelistEntry("66", "v-3D"))
            add(CodelistHandler.toCodelistEntry("67", "v-Bauwerk"))
            add(CodelistHandler.toCodelistEntry("68", "v-Boden"))
            add(CodelistHandler.toCodelistEntry("69", "v-Decke"))
            add(CodelistHandler.toCodelistEntry("70", "v-Fundament"))
            add(CodelistHandler.toCodelistEntry("71", "v-Obergeschoss"))
            add(CodelistHandler.toCodelistEntry("72", "v-Vektor"))
            add(CodelistHandler.toCodelistEntry("73", "Schall"))
        }
    }

    private fun createCodelist3950030(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950030"
        catalog = catalogRef
        name = "Programmiersprache"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Java", english = "Java"))
            add(CodelistHandler.toCodelistEntry("2", "Fortran", english = "Fortran"))
            add(CodelistHandler.toCodelistEntry("3", "Fortran 2003", english = "Fortran 2003"))
            add(CodelistHandler.toCodelistEntry("4", "Python", english = "Python"))
            add(CodelistHandler.toCodelistEntry("5", "C", english = "C"))
            add(CodelistHandler.toCodelistEntry("6", "C++", english = "C++"))
            add(CodelistHandler.toCodelistEntry("7", "C#", english = "C#"))
            add(CodelistHandler.toCodelistEntry("8", "PHP", english = "PHP"))
            add(CodelistHandler.toCodelistEntry("9", "R", english = "R"))
            add(CodelistHandler.toCodelistEntry("10", "VB", english = "VB"))
            add(CodelistHandler.toCodelistEntry("11", "MicroStation", english = "MicroStation"))
            add(CodelistHandler.toCodelistEntry("12", "Delphi", english = "Delphi"))
            add(CodelistHandler.toCodelistEntry("13", "Access", english = "Access"))
        }
    }
    private fun createCodelist3950031(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950031"
        catalog = catalogRef
        name = "Entwicklungsumgebung"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Visual Studio", english = "Visual Studio"))
            add(CodelistHandler.toCodelistEntry("2", "Visual Studio Code", english = "Visual Studio Code"))
            add(CodelistHandler.toCodelistEntry("3", "Eclipse", english = "Eclipse"))
        }
    }
    private fun createCodelist3950032(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950032"
        catalog = catalogRef
        name = "Installation über"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Ticket", english = "Ticket"))
            add(CodelistHandler.toCodelistEntry("2", "Software Center", english = "Software Center"))
            add(CodelistHandler.toCodelistEntry("3", "Netzwerkinstallation", english = "Network installation"))
            add(CodelistHandler.toCodelistEntry("4", "Download", english = "Download"))
        }
    }
    private fun createCodelist3950033(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950033"
        catalog = catalogRef
        name = "Name des HLR"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Rhenus", english = "Rhenus", iso = "Rhenus"))
            add(CodelistHandler.toCodelistEntry("2", "Automatix", english = "Automatix", iso = "Automatix"))
        }
    }

    private fun createCodelistDimensionCode(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950000"
        catalog = catalogRef
        name = "BAW_DimensionCode"
        description = "Dimensionalität der numerischen Modelle der BAW"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "1D"))
            add(CodelistHandler.toCodelistEntry("2", "2D"))
            add(CodelistHandler.toCodelistEntry("3", "2D-hor"))
            add(CodelistHandler.toCodelistEntry("4", "2D-vert"))
            add(CodelistHandler.toCodelistEntry("5", "3D"))
//            add(CodelistHandler.toCodelistEntry("999", "keine"))
        }
    }

    private fun createCodelistModellverfahrenCode(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950001"
        catalog = catalogRef
        name = "BAW_ModellverfahrenCode"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "BSQUAT"))
            add(CodelistHandler.toCodelistEntry("2", "Cascade"))
            add(CodelistHandler.toCodelistEntry("3", "Delft3D 4"))
            add(CodelistHandler.toCodelistEntry("4", "Delft3D FM"))
            add(CodelistHandler.toCodelistEntry("5", "HEC-6T"))
            add(CodelistHandler.toCodelistEntry("6", "Hec-Ras"))
            add(CodelistHandler.toCodelistEntry("7", "Hydro-AS"))
            add(CodelistHandler.toCodelistEntry("8", "k-Modell"))
            add(CodelistHandler.toCodelistEntry("9", "NCAGGREGATE"))
            add(CodelistHandler.toCodelistEntry("10", "NCANALYSE"))
            add(CodelistHandler.toCodelistEntry("11", "NCAUTO"))
            add(CodelistHandler.toCodelistEntry("12", "NCDELTA"))
            add(CodelistHandler.toCodelistEntry("13", "NCPLOT"))
            add(CodelistHandler.toCodelistEntry("14", "OpenFOAM"))
            add(CodelistHandler.toCodelistEntry("15", "PeTra2d"))
            add(CodelistHandler.toCodelistEntry("16", "Rismo2D"))
            add(CodelistHandler.toCodelistEntry("17", "SediMorph"))
            add(CodelistHandler.toCodelistEntry("18", "STAR-CCM+"))
            add(CodelistHandler.toCodelistEntry("19", "Telemac"))
            add(CodelistHandler.toCodelistEntry("20", "UnTRIM"))
            add(CodelistHandler.toCodelistEntry("21", "UnTRIM2007"))
            add(CodelistHandler.toCodelistEntry("22", "UnTRIM2009"))
//            add(CodelistHandler.toCodelistEntry("999", "kein"))
            add(CodelistHandler.toCodelistEntry("23", "DuMuˣ"))
        }
    }

    private fun createCodelistIdentifierType(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "identifierType"
        catalog = catalogRef
        name = "Identifier Type"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Handle"))
            add(CodelistHandler.toCodelistEntry("2", "ISBN"))
            add(CodelistHandler.toCodelistEntry("3", "ISSN"))
        }
    }

    private fun createCodelistVerticalSpatialSystems(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "verticalSpatialSystems"
        catalog = catalogRef
        name = "Vertical Coordinate Reference System"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("5783", "EPSG:5783 DHHN92 Höhe"))
            add(CodelistHandler.toCodelistEntry("7699", "EPSG:7699 DHHN12 Höhe"))
            add(CodelistHandler.toCodelistEntry("7837", "EPSG:7837 DHHN2016 Höhe"))
        }
    }
}
