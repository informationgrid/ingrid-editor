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

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_baw.importer.ISOImportBaw
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
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
    override val indexExportFormatID = "indexInGridIDFBaw"

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        super.initCatalogCodelists(catalogId, codelistId)
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelists = mapOf(
            "3950000" to createCodelistDimensionCode(catalogRef),
            "3950001" to createCodelistModellverfahrenCode(catalogRef),
            "3950011" to createCodelist3950011(catalogRef),
            "3950012" to createCodelist3950012(catalogRef),
            "3950014" to createCodelist3950014(catalogRef),
            "3950020" to createCodelist3950020(catalogRef),
            "3950021" to createCodelist3950021(catalogRef),
            "3950003" to createCodelist3950003(catalogRef),
            "3950004" to createCodelist3950004(catalogRef),
            "verticalCoordinateReferenceSystem" to createCodelistPlaceholder("verticalCoordinateReferenceSystem", catalogRef),
        )

        if (codelists.containsKey(codelistId)) {
            codelistHandler.removeAndAddCodelist(catalogId, codelists[codelistId]!!)
        } else if (codelistId == null) {
            // remove all codelists and add them again
            codelistHandler.removeAndAddCodelists(catalogId, codelists.values.toList())
        }
    }

    private fun createCodelist3950011(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950011"
        catalog = catalogRef
        name = "3950011"
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
        name = "3950012"
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
        name = "3950014"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Gemessen", english = "Measured"))
            add(CodelistHandler.toCodelistEntry("2", "Berechnet", english = "Calculated"))
        }
    }

    private fun createCodelist3950020(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950020"
        catalog = catalogRef
        name = "3950020"
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
        name = "3950021"
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
        name = "3950003"
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
        name = "3950004"
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
            add(CodelistHandler.toCodelistEntry("999", "keine"))
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
            add(CodelistHandler.toCodelistEntry("999", "kein"))
            add(CodelistHandler.toCodelistEntry("23", "DuMuˣ"))
        }
    }

    private fun createCodelistPlaceholder(id: String, catalogRef: Catalog): Codelist = Codelist().apply {
        // TODO remove when all codelists are implemented
        identifier = id
        catalog = catalogRef
        name = "Placeholder"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Placeholder1"))
            add(CodelistHandler.toCodelistEntry("2", "Placeholder2"))
        }
    }
}
