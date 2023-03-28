package de.ingrid.igeserver.profiles.mcloud

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.IndexIdFieldConfig
import de.ingrid.igeserver.research.quickfilter.Spatial
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.*
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.Permissions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service
@Profile("mcloud")
class MCloudProfile @Autowired constructor(
    @JsonIgnore val codelistHandler: CodelistHandler,
    @JsonIgnore val catalogRepo: CatalogRepository,
    @JsonIgnore val query: QueryRepository,
    @JsonIgnore val dateService: DateService
) : CatalogProfile {

    override val identifier = "mcloud"
    override val title = "mCLOUD Katalog"
    override val description = null
    override val indexExportFormatID = "portal"
    override val indexIdField = IndexIdFieldConfig("uuid", "uuid")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Draft(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX,
                combine = Operator.AND
            ),
            FacetGroup(
                "spatial", "Raumbezug", arrayOf(
                    Spatial()
                ),
                viewComponent = ViewComponent.SPATIAL
            ),
            FacetGroup(
                "timeRef", "Aktualität der Metadaten", arrayOf(
                    TimeSpan()
                ),
                viewComponent = ViewComponent.TIMESPAN
            )
        )
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Draft(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX
            )
        )
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist20000 = Codelist().apply {
            identifier = "20000"
            catalog = catalogRef
            name = "mCLOUD Kategorien"
            description = "Dies sind die Kategorien, die innerhalb von mCLOUD verwendet werden"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("railway", "Bahn"))
                add(CodelistHandler.toCodelistEntry("waters", "Wasserstraßen und Gewässer"))
                add(CodelistHandler.toCodelistEntry("infrastructure", "Infrastruktur"))
                add(CodelistHandler.toCodelistEntry("climate", "Klima und Wetter"))
                add(CodelistHandler.toCodelistEntry("aviation", "Luft- und Raumfahrt"))
                add(CodelistHandler.toCodelistEntry("roads", "Straßen"))
            }
        }
        val codelist20001 = Codelist().apply {
            identifier = "20001"
            catalog = catalogRef
            name = "OpenData Kategorien"
            description = "Dies sind die Kategorien, die im OpenData Kontext verwendet werden"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("SOCI", "Bevölkerung und Gesellschaft"))
                add(CodelistHandler.toCodelistEntry("EDUC", "Bildung, Kultur und Sport"))
                add(CodelistHandler.toCodelistEntry("ENER", "Energie"))
                add(CodelistHandler.toCodelistEntry("HEAL", "Gesundheit"))
                add(CodelistHandler.toCodelistEntry("INTR", "Internationale Themen"))
                add(CodelistHandler.toCodelistEntry("JUST", "Justiz, Rechtssystem und öffentliche Sicherheit"))
                add(CodelistHandler.toCodelistEntry("AGRI", "Landwirtschaft, Fischerei, Forstwirtschaft und Nahrungsmittel"))
                add(CodelistHandler.toCodelistEntry("GOVE", "Regierung und öffentlicher Sektor"))
                add(CodelistHandler.toCodelistEntry("REGI", "Regionen und Städte"))
                add(CodelistHandler.toCodelistEntry("ENVI", "Umwelt"))
                add(CodelistHandler.toCodelistEntry("TRAN", "Verkehr"))
                add(CodelistHandler.toCodelistEntry("ECON", "Wirtschaft und Finanzen"))
                add(CodelistHandler.toCodelistEntry("TECH", "Wissenschaft und Technologie"))
            }
        }
        val codelist20002 = Codelist().apply {
            identifier = "20002"
            catalog = catalogRef
            name = "Download Typ"
            description = "Dies sind die Typen, die ein Download-Eintrag haben kann"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("api", "API"))
                add(CodelistHandler.toCodelistEntry("atomFeed", "AtomFeed"))
                add(CodelistHandler.toCodelistEntry("download", "Dateidownload"))
                add(CodelistHandler.toCodelistEntry("ftp", "FTP"))
                add(CodelistHandler.toCodelistEntry("portal", "Portal"))
                add(CodelistHandler.toCodelistEntry("software", "Software"))
                add(CodelistHandler.toCodelistEntry("sos", "SOS"))
                add(CodelistHandler.toCodelistEntry("wcs", "WCS"))
                add(CodelistHandler.toCodelistEntry("wfs", "WFS"))
                add(CodelistHandler.toCodelistEntry("wms", "WMS"))
                add(CodelistHandler.toCodelistEntry("wmts", "WMTS"))
            }
        }
        val codelist20003 = Codelist().apply {
            identifier = "20003"
            catalog = catalogRef
            name = "Download Format"
            description = "Dies sind die Formate, die ein Download-Eintrag haben kann"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("ZIP", "ZIP"))
                add(CodelistHandler.toCodelistEntry("XML", "XML"))
                add(CodelistHandler.toCodelistEntry("RDF", "RDF"))
                add(CodelistHandler.toCodelistEntry("SKOS_XML", "SKOS_XML"))
                add(CodelistHandler.toCodelistEntry("XLSX", "XLSX"))
                add(CodelistHandler.toCodelistEntry("PDF", "PDF"))
                add(CodelistHandler.toCodelistEntry("ARC", "ARC"))
                add(CodelistHandler.toCodelistEntry("ARC_GZ", "ARC_GZ"))
                add(CodelistHandler.toCodelistEntry("ATOM", "ATOM"))
                add(CodelistHandler.toCodelistEntry("AZW", "AZW"))
                add(CodelistHandler.toCodelistEntry("BIN", "BIN"))
                add(CodelistHandler.toCodelistEntry("BMP", "BMP"))
                add(CodelistHandler.toCodelistEntry("BWF", "BWF"))
                add(CodelistHandler.toCodelistEntry("CSS", "CSS"))
                add(CodelistHandler.toCodelistEntry("CSV", "CSV"))
                add(CodelistHandler.toCodelistEntry("DBF", "DBF"))
                add(CodelistHandler.toCodelistEntry("DCR", "DCR"))
                add(CodelistHandler.toCodelistEntry("DMP", "DMP"))
                add(CodelistHandler.toCodelistEntry("DOC", "DOC"))
                add(CodelistHandler.toCodelistEntry("DOCX", "DOCX"))
                add(CodelistHandler.toCodelistEntry("DTD_SGML", "DTD_SGML"))
                add(CodelistHandler.toCodelistEntry("DTD_XML", "DTD_XML"))
                add(CodelistHandler.toCodelistEntry("E00", "E00"))
                add(CodelistHandler.toCodelistEntry("ECW", "ECW"))
                add(CodelistHandler.toCodelistEntry("EPS", "EPS"))
                add(CodelistHandler.toCodelistEntry("EPUB", "EPUB"))
                add(CodelistHandler.toCodelistEntry("FMX2", "FMX2"))
                add(CodelistHandler.toCodelistEntry("FMX3", "FMX3"))
                add(CodelistHandler.toCodelistEntry("FMX4", "FMX4"))
                add(CodelistHandler.toCodelistEntry("GDB", "GDB"))
                add(CodelistHandler.toCodelistEntry("GEOJSON", "GEOJSON"))
                add(CodelistHandler.toCodelistEntry("GIF", "GIF"))
                add(CodelistHandler.toCodelistEntry("GML", "GML"))
                add(CodelistHandler.toCodelistEntry("GMZ", "GMZ"))
                add(CodelistHandler.toCodelistEntry("GRID_ASCII", "GRID_ASCII"))
                add(CodelistHandler.toCodelistEntry("GZIP", "GZIP"))
                add(CodelistHandler.toCodelistEntry("HDF", "HDF"))
                add(CodelistHandler.toCodelistEntry("HTML", "HTML"))
                add(CodelistHandler.toCodelistEntry("HTML_SIMPL", "HTML_SIMPL"))
                add(CodelistHandler.toCodelistEntry("INDD", "INDD"))
                add(CodelistHandler.toCodelistEntry("JPEG", "JPEG"))
                add(CodelistHandler.toCodelistEntry("JPEG2000", "JPEG2000"))
                add(CodelistHandler.toCodelistEntry("JSON", "JSON"))
                add(CodelistHandler.toCodelistEntry("JSON_LD", "JSON_LD"))
                add(CodelistHandler.toCodelistEntry("KML", "KML"))
                add(CodelistHandler.toCodelistEntry("KMZ", "KMZ"))
                add(CodelistHandler.toCodelistEntry("LAS", "LAS"))
                add(CodelistHandler.toCodelistEntry("LAZ", "LAZ"))
                add(CodelistHandler.toCodelistEntry("MAP_PRVW", "MAP_PRVW"))
                add(CodelistHandler.toCodelistEntry("MAP_SRVC", "MAP_SRVC"))
                add(CodelistHandler.toCodelistEntry("MBOX", "MBOX"))
                add(CodelistHandler.toCodelistEntry("MDB", "MDB"))
                add(CodelistHandler.toCodelistEntry("METS", "METS"))
                add(CodelistHandler.toCodelistEntry("METS_ZIP", "METS_ZIP"))
                add(CodelistHandler.toCodelistEntry("MHTML", "MHTML"))
                add(CodelistHandler.toCodelistEntry("MOBI", "MOBI"))
                add(CodelistHandler.toCodelistEntry("MOP", "MOP"))
                add(CodelistHandler.toCodelistEntry("MPEG2", "MPEG2"))
                add(CodelistHandler.toCodelistEntry("MPEG4", "MPEG4"))
                add(CodelistHandler.toCodelistEntry("MPEG4_AVC", "MPEG4_AVC"))
                add(CodelistHandler.toCodelistEntry("MSG_HTTP", "MSG_HTTP"))
                add(CodelistHandler.toCodelistEntry("MXD", "MXD"))
                add(CodelistHandler.toCodelistEntry("NETCDF", "NETCDF"))
                add(CodelistHandler.toCodelistEntry("OCTET", "OCTET"))
                add(CodelistHandler.toCodelistEntry("ODB", "ODB"))
                add(CodelistHandler.toCodelistEntry("ODC", "ODC"))
                add(CodelistHandler.toCodelistEntry("ODF", "ODF"))
                add(CodelistHandler.toCodelistEntry("ODG", "ODG"))
                add(CodelistHandler.toCodelistEntry("ODS", "ODS"))
                add(CodelistHandler.toCodelistEntry("ODT", "ODT"))
                add(CodelistHandler.toCodelistEntry("OP_DATPRO", "OP_DATPRO"))
                add(CodelistHandler.toCodelistEntry("OVF", "OVF"))
                add(CodelistHandler.toCodelistEntry("OWL", "OWL"))
                add(CodelistHandler.toCodelistEntry("PDF1X", "PDF1X"))
                add(CodelistHandler.toCodelistEntry("PDFA1A", "PDFA1A"))
                add(CodelistHandler.toCodelistEntry("PDFA1B", "PDFA1B"))
                add(CodelistHandler.toCodelistEntry("PDFA2A", "PDFA2A"))
                add(CodelistHandler.toCodelistEntry("PDFA2B", "PDFA2B"))
                add(CodelistHandler.toCodelistEntry("PDFA3", "PDFA3"))
                add(CodelistHandler.toCodelistEntry("PDFX", "PDFX"))
                add(CodelistHandler.toCodelistEntry("PDFX1A", "PDFX1A"))
                add(CodelistHandler.toCodelistEntry("PDFX2A", "PDFX2A"))
                add(CodelistHandler.toCodelistEntry("PDFX4", "PDFX4"))
                add(CodelistHandler.toCodelistEntry("PNG", "PNG"))
                add(CodelistHandler.toCodelistEntry("PPS", "PPS"))
                add(CodelistHandler.toCodelistEntry("PPSX", "PPSX"))
                add(CodelistHandler.toCodelistEntry("PPT", "PPT"))
                add(CodelistHandler.toCodelistEntry("PPTX", "PPTX"))
                add(CodelistHandler.toCodelistEntry("PS", "PS"))
                add(CodelistHandler.toCodelistEntry("PSD", "PSD"))
                add(CodelistHandler.toCodelistEntry("RDFA", "RDFA"))
                add(CodelistHandler.toCodelistEntry("RDF_N_QUADS", "RDF_N_QUADS"))
                add(CodelistHandler.toCodelistEntry("RDF_N_TRIPLES", "RDF_N_TRIPLES"))
                add(CodelistHandler.toCodelistEntry("RDF_TRIG", "RDF_TRIG"))
                add(CodelistHandler.toCodelistEntry("RDF_TURTLE", "RDF_TURTLE"))
                add(CodelistHandler.toCodelistEntry("RDF_XML", "RDF_XML"))
                add(CodelistHandler.toCodelistEntry("REST", "REST"))
                add(CodelistHandler.toCodelistEntry("RSS", "RSS"))
                add(CodelistHandler.toCodelistEntry("RTF", "RTF"))
                add(CodelistHandler.toCodelistEntry("SCHEMA_XML", "SCHEMA_XML"))
                add(CodelistHandler.toCodelistEntry("SDMX", "SDMX"))
                add(CodelistHandler.toCodelistEntry("SGML", "SGML"))
                add(CodelistHandler.toCodelistEntry("SHP", "SHP"))
                add(CodelistHandler.toCodelistEntry("SPARQLQ", "SPARQLQ"))
                add(CodelistHandler.toCodelistEntry("SPARQLQRES", "SPARQLQRES"))
                add(CodelistHandler.toCodelistEntry("SQL", "SQL"))
                add(CodelistHandler.toCodelistEntry("TAB", "TAB"))
                add(CodelistHandler.toCodelistEntry("TAB_RSTR", "TAB_RSTR"))
                add(CodelistHandler.toCodelistEntry("TAR", "TAR"))
                add(CodelistHandler.toCodelistEntry("TAR_GZ", "TAR_GZ"))
                add(CodelistHandler.toCodelistEntry("TAR_XZ", "TAR_XZ"))
                add(CodelistHandler.toCodelistEntry("TIFF", "TIFF"))
                add(CodelistHandler.toCodelistEntry("TIFF_FX", "TIFF_FX"))
                add(CodelistHandler.toCodelistEntry("TMX", "TMX"))
                add(CodelistHandler.toCodelistEntry("TSV", "TSV"))
                add(CodelistHandler.toCodelistEntry("TXT", "TXT"))
                add(CodelistHandler.toCodelistEntry("WARC", "WARC"))
                add(CodelistHandler.toCodelistEntry("WARC_GZ", "WARC_GZ"))
                add(CodelistHandler.toCodelistEntry("WORLD", "WORLD"))
                add(CodelistHandler.toCodelistEntry("XHTML", "XHTML"))
                add(CodelistHandler.toCodelistEntry("XHTML_SIMPL", "XHTML_SIMPL"))
                add(CodelistHandler.toCodelistEntry("XLIFF", "XLIFF"))
                add(CodelistHandler.toCodelistEntry("XLS", "XLS"))
                add(CodelistHandler.toCodelistEntry("XSLFO", "XSLFO"))
                add(CodelistHandler.toCodelistEntry("XSLT", "XSLT"))
                add(CodelistHandler.toCodelistEntry("XYZ", "XYZ"))
                add(CodelistHandler.toCodelistEntry("BITS", "BITS"))
                add(CodelistHandler.toCodelistEntry("JATS", "JATS"))
                add(CodelistHandler.toCodelistEntry("PWP", "PWP"))
                add(CodelistHandler.toCodelistEntry("JS", "JS"))
                add(CodelistHandler.toCodelistEntry("N3", "N3"))
                add(CodelistHandler.toCodelistEntry("RAR", "RAR"))
                add(CodelistHandler.toCodelistEntry("WMS_SRVC", "WMS_SRVC"))
                add(CodelistHandler.toCodelistEntry("EXE", "EXE"))
                add(CodelistHandler.toCodelistEntry("ICS", "ICS"))
                add(CodelistHandler.toCodelistEntry("MRSID", "MRSID"))
                add(CodelistHandler.toCodelistEntry("PL", "PL"))
                add(CodelistHandler.toCodelistEntry("QGS", "QGS"))
                add(CodelistHandler.toCodelistEntry("SVG", "SVG"))
                add(CodelistHandler.toCodelistEntry("WFS_SRVC", "WFS_SRVC"))
                add(CodelistHandler.toCodelistEntry("ISO", "ISO"))
                add(CodelistHandler.toCodelistEntry("ISO_ZIP", "ISO_ZIP"))
                add(CodelistHandler.toCodelistEntry("GRID", "GRID"))
                add(CodelistHandler.toCodelistEntry("XLSB", "XLSB"))
                add(CodelistHandler.toCodelistEntry("XLSM", "XLSM"))
                add(CodelistHandler.toCodelistEntry("IMMC_XML", "IMMC_XML"))
                add(CodelistHandler.toCodelistEntry("HDT", "HDT"))
                add(CodelistHandler.toCodelistEntry("LEG", "LEG"))
                add(CodelistHandler.toCodelistEntry("7Z", "7Z"))
                add(CodelistHandler.toCodelistEntry("AAC", "AAC"))
                add(CodelistHandler.toCodelistEntry("APPX", "APPX"))
                add(CodelistHandler.toCodelistEntry("ARJ", "ARJ"))
                add(CodelistHandler.toCodelistEntry("DMG", "DMG"))
                add(CodelistHandler.toCodelistEntry("JAR", "JAR"))
                add(CodelistHandler.toCodelistEntry("MSI", "MSI"))
                add(CodelistHandler.toCodelistEntry("SWM", "SWM"))
                add(CodelistHandler.toCodelistEntry("APK", "APK"))
                add(CodelistHandler.toCodelistEntry("BZIP2", "BZIP2"))
                add(CodelistHandler.toCodelistEntry("DEB", "DEB"))
                add(CodelistHandler.toCodelistEntry("LHA", "LHA"))
                add(CodelistHandler.toCodelistEntry("LZMA", "LZMA"))
                add(CodelistHandler.toCodelistEntry("ODP", "ODP"))
                add(CodelistHandler.toCodelistEntry("RDF_TRIX", "RDF_TRIX"))
                add(CodelistHandler.toCodelistEntry("RPM", "RPM"))
                add(CodelistHandler.toCodelistEntry("SB3", "SB3"))
                add(CodelistHandler.toCodelistEntry("WAR", "WAR"))
                add(CodelistHandler.toCodelistEntry("WIM", "WIM"))
                add(CodelistHandler.toCodelistEntry("XZ", "XZ"))
                add(CodelistHandler.toCodelistEntry("Z", "Z"))
                add(CodelistHandler.toCodelistEntry("EAR", "EAR"))
                add(CodelistHandler.toCodelistEntry("LZIP", "LZIP"))
                add(CodelistHandler.toCodelistEntry("LZO", "LZO"))
                add(CodelistHandler.toCodelistEntry("AKN4EU", "AKN4EU"))
                add(CodelistHandler.toCodelistEntry("FMX4_ZIP", "FMX4_ZIP"))
                add(CodelistHandler.toCodelistEntry("ETSI_XML", "ETSI_XML"))
                add(CodelistHandler.toCodelistEntry("GPKG", "GPKG"))
                add(CodelistHandler.toCodelistEntry("AKN4EU_ZIP", "AKN4EU_ZIP"))
                add(CodelistHandler.toCodelistEntry("DGN", "DGN"))
                add(CodelistHandler.toCodelistEntry("DWG", "DWG"))
                add(CodelistHandler.toCodelistEntry("DXF", "DXF"))
                add(CodelistHandler.toCodelistEntry("WCS_SRVC", "WCS_SRVC"))
                add(CodelistHandler.toCodelistEntry("IPA", "IPA"))
                add(CodelistHandler.toCodelistEntry("PDFUA", "PDFUA"))
                add(CodelistHandler.toCodelistEntry("HTML5", "HTML5"))
            }
        }

        when (codelistId) {
            "20000" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20000)
            "20001" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20001)
            "20002" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20002)
            "20003" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20003)
            null -> {
                codelistHandler.removeAndAddCodelists(catalogId, listOf(codelist20000, codelist20001, codelist20002, codelist20003))
            }
            else -> throw ClientException.withReason("Codelist $codelistId is not supported by this profile: $identifier")
        }
    }

    override fun initCatalogQueries(catalogId: String) {
    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/mcloud/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/mcloud/default-settings.json")?.readText() ?: ""
    }

    override fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String>{
        val isSuperAdmin = principal.authorities.any { it.authority == "ige-super-admin" }

        return  if(isSuperAdmin) {
            permissions
        } else {
            permissions.filter { permission -> (!permission.equals(Permissions.can_import.name)
                    && !permission.equals(Permissions.can_export.name))
            }
        }
    }
}
