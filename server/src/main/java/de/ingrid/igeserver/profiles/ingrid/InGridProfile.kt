/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.imports.DocumentAnalysis
import de.ingrid.igeserver.imports.OptimizedImportAnalysis
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.profiles.ingrid.quickfilter.DocumentTypes
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid.quickfilter.SpatialInGrid
import de.ingrid.igeserver.profiles.uvp.quickfilter.TitleSearch
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.services.CodelistHandler.Companion.toCodelistEntry
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class InGridProfile(
    @JsonIgnore val catalogRepo: CatalogRepository,
    @JsonIgnore val codelistHandler: CodelistHandler,
    @JsonIgnore @Lazy val documentService: DocumentService,
    @JsonIgnore val query: QueryRepository,
    @JsonIgnore val dateService: DateService,
    @JsonIgnore val openDataCategory: OpenDataCategory
) : CatalogProfile {

    @Autowired
    @JsonIgnore
    lateinit var entityManager: EntityManager
    
    @Autowired
    @JsonIgnore
    private lateinit var transactionManager: PlatformTransactionManager

    companion object {
        const val id = "ingrid"
    }

    override val identifier = id
    override val title = "InGrid Katalog"
    override val description = null
    override val indexExportFormatID = "indexInGridIDF"
    override val indexIdField = IndexIdFieldConfig("t01_object.obj_id", "t02_address.adr_id")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders(),
                    TitleSearch()
                ),
                viewComponent = ViewComponent.CHECKBOX,
                combine = Operator.AND
            ),
            FacetGroup(
                "spatial", "Raumbezug", arrayOf(
                    SpatialInGrid()
                ),
                viewComponent = ViewComponent.SPATIAL
            ),
            FacetGroup(
                "timeRef", "Zeitbezug", arrayOf(
                    TimeSpan()
                ),
                viewComponent = ViewComponent.TIMESPAN
            ),
            FacetGroup(
                "docType", "Datensatztyp", arrayOf(
                    DocumentTypes()
                ),
                viewComponent = ViewComponent.SELECT
            ),
            FacetGroup(
                "openDataCategory", "OpenData Kategorie", arrayOf(
                    openDataCategory
                ),
                viewComponent = ViewComponent.SELECT
            ),
        )
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX
            )
        )
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist6006 = createCodelist6006(catalogRef)
        val codelist1350 = createCodelist1350(catalogRef)
        val codelist6250 = createCodelist6250(catalogRef)
        val codelist3535 = createCodelist3535(catalogRef)
        val codelist3555 = createCodelist3555(catalogRef)
        val codelist20003 = createCodelist20003(catalogRef)

        when (codelistId) {
            "6006" -> codelistHandler.removeAndAddCodelist(catalogId, codelist6006)
            "1350" -> codelistHandler.removeAndAddCodelist(catalogId, codelist1350)
            "6250" -> codelistHandler.removeAndAddCodelist(catalogId, codelist6250)
            "3535" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3535)
            "3555" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3555)
            "20003" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20003)
            null -> {
                codelistHandler.removeAndAddCodelists(
                    catalogId,
                    listOf(codelist6006, codelist1350, codelist6250, codelist3535, codelist3555, codelist20003)
                )
            }

            else -> throw ClientException.withReason("Codelist $codelistId is not supported by this profile: $identifier")
        }
    }

    private fun createCodelist6006(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "6006"
            catalog = catalogRef
            name = "Freie Konformitäten"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "Konformität - Freier Eintrag", "2018-02-22"))
            }
        }
    }

    private fun createCodelist6250(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "6250"
            catalog = catalogRef
            name = "Verwaltungsgebiet"
            description = ""
            defaultEntry = "0"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("0", "Bundesrepublik Deutschland", null, "Federal Republic of Germany"))
                add(CodelistHandler.toCodelistEntry("1", "Baden-Württemberg", null, "Baden Wurttemberg"))
                add(CodelistHandler.toCodelistEntry("2", "Bayern", null, "Bavaria"))
                add(CodelistHandler.toCodelistEntry("3", "Berlin", null, "Berlin"))
                add(CodelistHandler.toCodelistEntry("4", "Brandenburg", null, "Brandenburg"))
                add(CodelistHandler.toCodelistEntry("5", "Bremen", null, "Bremen"))
                add(CodelistHandler.toCodelistEntry("6", "Hamburg", null, "Hamburg"))
                add(CodelistHandler.toCodelistEntry("7", "Hessen", null, "Hessen"))
                add(CodelistHandler.toCodelistEntry("8", "Mecklenburg-Vorpommern", null, "Mecklenburg-West Pomerania"))
                add(CodelistHandler.toCodelistEntry("9", "Niedersachsen", null, "Lower Saxony"))
                add(CodelistHandler.toCodelistEntry("10", "Nordrhein-Westfalen", null, "North Rhine Westphalia"))
                add(CodelistHandler.toCodelistEntry("11", "Rheinland-Pfalz", null, "Rhineland Palatinate"))
                add(CodelistHandler.toCodelistEntry("12", "Saarland", null, "Saarland"))
                add(CodelistHandler.toCodelistEntry("13", "Sachsen", null, "Saxony "))
                add(CodelistHandler.toCodelistEntry("14", "Sachsen-Anhalt", null, "Saxony Anhalt"))
                add(CodelistHandler.toCodelistEntry("15", "Schleswig-Holstein", null, "Schleswig-Holstein"))
                add(CodelistHandler.toCodelistEntry("16", "Thüringen", null, "Thuringia"))
            }
        }
    }

    private fun createCodelist3555(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "3555"
            catalog = catalogRef
            name = "Symbolkatalog"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "Ganzflächige Biotopkartierung 94"))
            }
        }
    }

    private fun createCodelist3535(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "3535"
            catalog = catalogRef
            name = "Schlüsselkatalog"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "von Drachenfels 94"))
            }
        }
    }

    private fun createCodelist20003(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "20003"
            catalog = catalogRef
            name = "Download Format"
            description = "Dies sind die Formate, die ein Download-Eintrag haben kann"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(toCodelistEntry("ZIP", "ZIP"))
                add(toCodelistEntry("XML", "XML"))
                add(toCodelistEntry("RDF", "RDF"))
                add(toCodelistEntry("SKOS_XML", "SKOS_XML"))
                add(toCodelistEntry("XLSX", "XLSX"))
                add(toCodelistEntry("PDF", "PDF"))
                add(toCodelistEntry("ARC", "ARC"))
                add(toCodelistEntry("ARC_GZ", "ARC_GZ"))
                add(toCodelistEntry("ATOM", "ATOM"))
                add(toCodelistEntry("AZW", "AZW"))
                add(toCodelistEntry("BIN", "BIN"))
                add(toCodelistEntry("BMP", "BMP"))
                add(toCodelistEntry("BWF", "BWF"))
                add(toCodelistEntry("CSS", "CSS"))
                add(toCodelistEntry("CSV", "CSV"))
                add(toCodelistEntry("DBF", "DBF"))
                add(toCodelistEntry("DCR", "DCR"))
                add(toCodelistEntry("DMP", "DMP"))
                add(toCodelistEntry("DOC", "DOC"))
                add(toCodelistEntry("DOCX", "DOCX"))
                add(toCodelistEntry("DTD_SGML", "DTD_SGML"))
                add(toCodelistEntry("DTD_XML", "DTD_XML"))
                add(toCodelistEntry("E00", "E00"))
                add(toCodelistEntry("ECW", "ECW"))
                add(toCodelistEntry("EPS", "EPS"))
                add(toCodelistEntry("EPUB", "EPUB"))
                add(toCodelistEntry("FMX2", "FMX2"))
                add(toCodelistEntry("FMX3", "FMX3"))
                add(toCodelistEntry("FMX4", "FMX4"))
                add(toCodelistEntry("GDB", "GDB"))
                add(toCodelistEntry("GEOJSON", "GEOJSON"))
                add(toCodelistEntry("GIF", "GIF"))
                add(toCodelistEntry("GML", "GML"))
                add(toCodelistEntry("GMZ", "GMZ"))
                add(toCodelistEntry("GRID_ASCII", "GRID_ASCII"))
                add(toCodelistEntry("GZIP", "GZIP"))
                add(toCodelistEntry("HDF", "HDF"))
                add(toCodelistEntry("HTML", "HTML"))
                add(toCodelistEntry("HTML_SIMPL", "HTML_SIMPL"))
                add(toCodelistEntry("INDD", "INDD"))
                add(toCodelistEntry("JPEG", "JPEG"))
                add(toCodelistEntry("JPEG2000", "JPEG2000"))
                add(toCodelistEntry("JSON", "JSON"))
                add(toCodelistEntry("JSON_LD", "JSON_LD"))
                add(toCodelistEntry("KML", "KML"))
                add(toCodelistEntry("KMZ", "KMZ"))
                add(toCodelistEntry("LAS", "LAS"))
                add(toCodelistEntry("LAZ", "LAZ"))
                add(toCodelistEntry("MAP_PRVW", "MAP_PRVW"))
                add(toCodelistEntry("MAP_SRVC", "MAP_SRVC"))
                add(toCodelistEntry("MBOX", "MBOX"))
                add(toCodelistEntry("MDB", "MDB"))
                add(toCodelistEntry("METS", "METS"))
                add(toCodelistEntry("METS_ZIP", "METS_ZIP"))
                add(toCodelistEntry("MHTML", "MHTML"))
                add(toCodelistEntry("MOBI", "MOBI"))
                add(toCodelistEntry("MOP", "MOP"))
                add(toCodelistEntry("MPEG2", "MPEG2"))
                add(toCodelistEntry("MPEG4", "MPEG4"))
                add(toCodelistEntry("MPEG4_AVC", "MPEG4_AVC"))
                add(toCodelistEntry("MSG_HTTP", "MSG_HTTP"))
                add(toCodelistEntry("MXD", "MXD"))
                add(toCodelistEntry("NETCDF", "NETCDF"))
                add(toCodelistEntry("OCTET", "OCTET"))
                add(toCodelistEntry("ODB", "ODB"))
                add(toCodelistEntry("ODC", "ODC"))
                add(toCodelistEntry("ODF", "ODF"))
                add(toCodelistEntry("ODG", "ODG"))
                add(toCodelistEntry("ODS", "ODS"))
                add(toCodelistEntry("ODT", "ODT"))
                add(toCodelistEntry("OP_DATPRO", "OP_DATPRO"))
                add(toCodelistEntry("OVF", "OVF"))
                add(toCodelistEntry("OWL", "OWL"))
                add(toCodelistEntry("PDF1X", "PDF1X"))
                add(toCodelistEntry("PDFA1A", "PDFA1A"))
                add(toCodelistEntry("PDFA1B", "PDFA1B"))
                add(toCodelistEntry("PDFA2A", "PDFA2A"))
                add(toCodelistEntry("PDFA2B", "PDFA2B"))
                add(toCodelistEntry("PDFA3", "PDFA3"))
                add(toCodelistEntry("PDFX", "PDFX"))
                add(toCodelistEntry("PDFX1A", "PDFX1A"))
                add(toCodelistEntry("PDFX2A", "PDFX2A"))
                add(toCodelistEntry("PDFX4", "PDFX4"))
                add(toCodelistEntry("PNG", "PNG"))
                add(toCodelistEntry("PPS", "PPS"))
                add(toCodelistEntry("PPSX", "PPSX"))
                add(toCodelistEntry("PPT", "PPT"))
                add(toCodelistEntry("PPTX", "PPTX"))
                add(toCodelistEntry("PS", "PS"))
                add(toCodelistEntry("PSD", "PSD"))
                add(toCodelistEntry("RDFA", "RDFA"))
                add(toCodelistEntry("RDF_N_QUADS", "RDF_N_QUADS"))
                add(toCodelistEntry("RDF_N_TRIPLES", "RDF_N_TRIPLES"))
                add(toCodelistEntry("RDF_TRIG", "RDF_TRIG"))
                add(toCodelistEntry("RDF_TURTLE", "RDF_TURTLE"))
                add(toCodelistEntry("RDF_XML", "RDF_XML"))
                add(toCodelistEntry("REST", "REST"))
                add(toCodelistEntry("RSS", "RSS"))
                add(toCodelistEntry("RTF", "RTF"))
                add(toCodelistEntry("SCHEMA_XML", "SCHEMA_XML"))
                add(toCodelistEntry("SDMX", "SDMX"))
                add(toCodelistEntry("SGML", "SGML"))
                add(toCodelistEntry("SHP", "SHP"))
                add(toCodelistEntry("SPARQLQ", "SPARQLQ"))
                add(toCodelistEntry("SPARQLQRES", "SPARQLQRES"))
                add(toCodelistEntry("SQL", "SQL"))
                add(toCodelistEntry("TAB", "TAB"))
                add(toCodelistEntry("TAB_RSTR", "TAB_RSTR"))
                add(toCodelistEntry("TAR", "TAR"))
                add(toCodelistEntry("TAR_GZ", "TAR_GZ"))
                add(toCodelistEntry("TAR_XZ", "TAR_XZ"))
                add(toCodelistEntry("TIFF", "TIFF"))
                add(toCodelistEntry("TIFF_FX", "TIFF_FX"))
                add(toCodelistEntry("TMX", "TMX"))
                add(toCodelistEntry("TSV", "TSV"))
                add(toCodelistEntry("TXT", "TXT"))
                add(toCodelistEntry("WARC", "WARC"))
                add(toCodelistEntry("WARC_GZ", "WARC_GZ"))
                add(toCodelistEntry("WORLD", "WORLD"))
                add(toCodelistEntry("XHTML", "XHTML"))
                add(toCodelistEntry("XHTML_SIMPL", "XHTML_SIMPL"))
                add(toCodelistEntry("XLIFF", "XLIFF"))
                add(toCodelistEntry("XLS", "XLS"))
                add(toCodelistEntry("XSLFO", "XSLFO"))
                add(toCodelistEntry("XSLT", "XSLT"))
                add(toCodelistEntry("XYZ", "XYZ"))
                add(toCodelistEntry("BITS", "BITS"))
                add(toCodelistEntry("JATS", "JATS"))
                add(toCodelistEntry("PWP", "PWP"))
                add(toCodelistEntry("JS", "JS"))
                add(toCodelistEntry("N3", "N3"))
                add(toCodelistEntry("RAR", "RAR"))
                add(toCodelistEntry("WMS_SRVC", "WMS_SRVC"))
                add(toCodelistEntry("EXE", "EXE"))
                add(toCodelistEntry("ICS", "ICS"))
                add(toCodelistEntry("MRSID", "MRSID"))
                add(toCodelistEntry("PL", "PL"))
                add(toCodelistEntry("QGS", "QGS"))
                add(toCodelistEntry("SVG", "SVG"))
                add(toCodelistEntry("WFS_SRVC", "WFS_SRVC"))
                add(toCodelistEntry("ISO", "ISO"))
                add(toCodelistEntry("ISO_ZIP", "ISO_ZIP"))
                add(toCodelistEntry("GRID", "GRID"))
                add(toCodelistEntry("XLSB", "XLSB"))
                add(toCodelistEntry("XLSM", "XLSM"))
                add(toCodelistEntry("IMMC_XML", "IMMC_XML"))
                add(toCodelistEntry("HDT", "HDT"))
                add(toCodelistEntry("LEG", "LEG"))
                add(toCodelistEntry("7Z", "7Z"))
                add(toCodelistEntry("AAC", "AAC"))
                add(toCodelistEntry("APPX", "APPX"))
                add(toCodelistEntry("ARJ", "ARJ"))
                add(toCodelistEntry("DMG", "DMG"))
                add(toCodelistEntry("JAR", "JAR"))
                add(toCodelistEntry("MSI", "MSI"))
                add(toCodelistEntry("SWM", "SWM"))
                add(toCodelistEntry("APK", "APK"))
                add(toCodelistEntry("BZIP2", "BZIP2"))
                add(toCodelistEntry("DEB", "DEB"))
                add(toCodelistEntry("LHA", "LHA"))
                add(toCodelistEntry("LZMA", "LZMA"))
                add(toCodelistEntry("ODP", "ODP"))
                add(toCodelistEntry("RDF_TRIX", "RDF_TRIX"))
                add(toCodelistEntry("RPM", "RPM"))
                add(toCodelistEntry("SB3", "SB3"))
                add(toCodelistEntry("WAR", "WAR"))
                add(toCodelistEntry("WIM", "WIM"))
                add(toCodelistEntry("XZ", "XZ"))
                add(toCodelistEntry("Z", "Z"))
                add(toCodelistEntry("EAR", "EAR"))
                add(toCodelistEntry("LZIP", "LZIP"))
                add(toCodelistEntry("LZO", "LZO"))
                add(toCodelistEntry("AKN4EU", "AKN4EU"))
                add(toCodelistEntry("FMX4_ZIP", "FMX4_ZIP"))
                add(toCodelistEntry("ETSI_XML", "ETSI_XML"))
                add(toCodelistEntry("GPKG", "GPKG"))
                add(toCodelistEntry("AKN4EU_ZIP", "AKN4EU_ZIP"))
                add(toCodelistEntry("DGN", "DGN"))
                add(toCodelistEntry("DWG", "DWG"))
                add(toCodelistEntry("DXF", "DXF"))
                add(toCodelistEntry("WCS_SRVC", "WCS_SRVC"))
                add(toCodelistEntry("IPA", "IPA"))
                add(toCodelistEntry("PDFUA", "PDFUA"))
                add(toCodelistEntry("HTML5", "HTML5"))
            }
        }
    }

    private fun createCodelist1350(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "1350"
            catalog = catalogRef
            name = "Weitere rechtliche Grundlagen"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "Atomgesetz (AtG)"))
                add(CodelistHandler.toCodelistEntry("2", "Baugesetzbuch (BauGB)"))
                add(CodelistHandler.toCodelistEntry("3", "Bürgerl. Gesetzbuch (BGB)"))
                add(CodelistHandler.toCodelistEntry("4", "Bodenschutzgesetz (BodSchG)"))
                add(CodelistHandler.toCodelistEntry("5", "Bundesberggesetz (BBergG)"))
                add(CodelistHandler.toCodelistEntry("7", "Bundesnaturschutzgesetz (BNatSchG)"))
                add(CodelistHandler.toCodelistEntry("8", "Bundeswaldgesetz (BundeswaldG)"))
                add(CodelistHandler.toCodelistEntry("9", "Chemikaliengesetz (ChemG)"))
                add(CodelistHandler.toCodelistEntry("10", "Flurbereinigungsgesetz (FlurbG)"))
                add(CodelistHandler.toCodelistEntry("11", "Gentechnikgesetz (GenTG)"))
                add(CodelistHandler.toCodelistEntry("13", "Kreislaufwirtschafts- u. Abfallgesetz (KrW-/AbfG)"))
                add(CodelistHandler.toCodelistEntry("14", "Landesabfallgesetz (LAbfG)"))
                add(CodelistHandler.toCodelistEntry("15", "Landesabfallwirtschaftsgesetz (LAbfWG)"))
                add(CodelistHandler.toCodelistEntry("16", "Landschaftsgesetz (LG)"))
                add(CodelistHandler.toCodelistEntry("17", "Pflanzenschutzgesetz (PflSchG)"))
                add(CodelistHandler.toCodelistEntry("18", "Raumordnungsgesetz (ROG)"))
                add(CodelistHandler.toCodelistEntry("19", "Strahlenschutzvorsorgegesetz (StrVG)"))
                add(CodelistHandler.toCodelistEntry("20", "Tierschutzgesetz (TierSchG)"))
                add(CodelistHandler.toCodelistEntry("21", "Umwelthaftungsgesetz (UmweltHG)"))
                add(CodelistHandler.toCodelistEntry("22", "Umweltinformationsgesetz (UIG)"))
                add(CodelistHandler.toCodelistEntry("23", "Verwaltungsverfahrensgesetz (VwVfG)"))
                add(CodelistHandler.toCodelistEntry("24", "Bundeswasserstraßengesetz (WaStrG)"))
                add(CodelistHandler.toCodelistEntry("25", "Wasserhaushaltsgesetz (WHG)"))
                add(CodelistHandler.toCodelistEntry("26", "Umweltstatistikgesetz (Fass. 21.06.1994)"))
                add(CodelistHandler.toCodelistEntry("27", "Umweltstatistikgesetz (Fass. 14.03.1980)"))
                add(CodelistHandler.toCodelistEntry("29", "Trinkwasserverordnung (TrinkwV)"))
                add(CodelistHandler.toCodelistEntry("30", "TA Siedlungsabfall"))
                add(CodelistHandler.toCodelistEntry("31", "TA Abfall"))
                add(CodelistHandler.toCodelistEntry("32", "Strahlenschutzverordnung (StrlSchVO)"))
                add(CodelistHandler.toCodelistEntry("33", "Richtl. Em.- u. Im.-Überwachung. kerntech. Anl."))
                add(CodelistHandler.toCodelistEntry("34", "RdErl. d. ML v. 16.1.1986, GültL 10/66"))
                add(CodelistHandler.toCodelistEntry("35", "Nieders. Wassergesetz (NWG)"))
                add(CodelistHandler.toCodelistEntry("36", "Nieders. Naturschutzgesetz (NNatG)"))
                add(CodelistHandler.toCodelistEntry("38", "Nieders. Abfallgesetz (NAbfG)"))
                add(CodelistHandler.toCodelistEntry("39", "Nieders. Deichgesetz (NDG)"))
                add(CodelistHandler.toCodelistEntry("40", "Nieders. Abfallgesetz. 6. Teil \"Altlasten\""))
                add(CodelistHandler.toCodelistEntry("41", "Nieders. Abfallabgabengesetz"))
                add(CodelistHandler.toCodelistEntry("42", "Landesraumordnungsprogramm LROP"))
                add(CodelistHandler.toCodelistEntry("43", "KTA 1508"))
                add(CodelistHandler.toCodelistEntry("45", "Gesetz über eine Holzstatistik"))
                add(CodelistHandler.toCodelistEntry("46", "Ges. Statistik im Produzierenden Gewerbe"))
                add(CodelistHandler.toCodelistEntry("47", "Gesetz ü. d. Umweltverträglichkeitsprüfung (UVPG)"))
                add(CodelistHandler.toCodelistEntry("48", "Erlaß Nds. Umweltministerium vom 16.10.1992"))
                add(CodelistHandler.toCodelistEntry("49", "Bundesimmissionsschutzgesetz (BImSchG)"))
                add(CodelistHandler.toCodelistEntry("50", "BImSchG §47a"))
                add(CodelistHandler.toCodelistEntry("51", "Arbeitsschutzgesetz"))
                add(CodelistHandler.toCodelistEntry("52", "Anleitung zur Berechnung von Fluglärm"))
                add(CodelistHandler.toCodelistEntry("53", "Agrarstatistikgesetz (AgrStatG)"))
                add(CodelistHandler.toCodelistEntry("54", "Abfallklärschlammverordnung (AbfKlärV)"))
                add(CodelistHandler.toCodelistEntry("55", "Bundesimmissionsschutzverordnung, 23."))
                add(CodelistHandler.toCodelistEntry("56", "Abwasserabgabengesetz (AbwAG)"))
                add(CodelistHandler.toCodelistEntry("57", "Wasserhaushaltsgesetz (WHG) § 7a"))
                add(CodelistHandler.toCodelistEntry("58", "§ 152 NWG (Abwasserbeseitigungspläne)"))
                add(CodelistHandler.toCodelistEntry("59", "§ 52 Nieders. Wassergesetz (NWG)"))
                add(CodelistHandler.toCodelistEntry("60", "§ 67 NWG"))
                add(CodelistHandler.toCodelistEntry("61", "23. Bundesimmissionsschutzverordnung"))
                add(CodelistHandler.toCodelistEntry("62", "Abfallgesetz (AbfG)"))
                add(CodelistHandler.toCodelistEntry("63", "AdV-Plenumsbeschluß von 1994"))
                add(CodelistHandler.toCodelistEntry("64", "AdV-Plenumsbeschluß von1994"))
                add(CodelistHandler.toCodelistEntry("65", "Agrarstatistikgesetz AgrStatG"))
                add(CodelistHandler.toCodelistEntry("67", "Betriebssatzung der LGN v. 7.7.1997"))
                add(CodelistHandler.toCodelistEntry("68", "Bundesimmissionsschutzverordnung"))
            }
        }
    }

    override fun initCatalogQueries(catalogId: String) {
        val queryTest = Query().apply {
            this.catalog = catalogRepo.findByIdentifier(catalogId)
            category = "sql"
            name = "Alle Dokumente ohne Adressreferenzen"
            description = "Zeigt alle Dokumente an, die keine Adresse angegeben haben"
            data = jacksonObjectMapper().createObjectNode().apply {
                put(
                    "sql", """
                SELECT document1.*, document_wrapper.category
                FROM document_wrapper JOIN document document1 ON document_wrapper.uuid=document1.uuid
                WHERE document1.is_latest = true AND document_wrapper.category = 'data'
                  AND document_wrapper.type <> 'FOLDER'
                  AND (data ->> 'pointOfContact' IS NULL OR data -> 'pointOfContact' = '[]'\:\:jsonb)
            """.trimIndent()
                )
            }
            global = true
            modified = dateService.now()
        }
        query.save(queryTest)
    }

    override fun initIndices() {
        ClosableTransaction(transactionManager).use {
            entityManager
                .createNativeQuery(
                    """
                    CREATE INDEX IF NOT EXISTS parentIdentGin  ON document USING gin((data -> 'parentIdentifier'));
                    CREATE INDEX IF NOT EXISTS coupledResourcesGin ON document USING gin((data->'service'->'coupledResources'));
                    CREATE INDEX IF NOT EXISTS referencesGin ON document USING gin((data->'references'));
                """.trimIndent()
                )
                .executeUpdate()
        }
    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/ingrid/mappings/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/ingrid/default-settings.json")?.readText() ?: ""
    }

    override fun additionalImportAnalysis(catalogId: String, report: OptimizedImportAnalysis, message: Message) {
        val notExistingCoupledResources = mutableListOf<String>()

        report.references
            .flatMap { it.document.data.get("service")?.get("coupledResources")?.toList() ?: emptyList() }
            .filter { !it.get("isExternalRef").asBoolean() }
            .map { it.get("uuid").asText() }
            .forEach { coupledUuid ->
                val referenceInImport = report.references.any { it.document.uuid == coupledUuid }
                if (!referenceInImport) {
                    try {
                        documentService.getWrapperByCatalogAndDocumentUuid(catalogId, coupledUuid)
                    } catch (ex: Exception) {
                        message.infos.add("Coupled Resource with UUID $coupledUuid was not found. Removing reference.")
                        notExistingCoupledResources.add(coupledUuid)
                    }
                }
            }

        removeReferencesFromDatasets(report.references, notExistingCoupledResources)
    }

    private fun removeReferencesFromDatasets(refs: List<DocumentAnalysis>, uuids: MutableList<String>) {
        refs.forEach { ref ->
            ref.document.data.get("service")?.let {
                val coupledResources = it.get("coupledResources") as ArrayNode
                coupledResources.removeAll { node -> node.get("uuid")?.asText() in uuids }
            }
        }
    }
}
