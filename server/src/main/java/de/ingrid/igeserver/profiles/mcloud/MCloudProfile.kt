package de.ingrid.igeserver.profiles.mcloud

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.mcloud.research.quickfilter.Spatial
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.DocMCloud
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.research.quickfilter.address.Organisations
import de.ingrid.igeserver.research.quickfilter.address.Persons
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.Permissions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service()
@Profile("mcloud")
class MCloudProfile : CatalogProfile {

    @Autowired
    @JsonIgnore
    lateinit var codelistRepo: CodelistRepository

    @Autowired
    @JsonIgnore
    lateinit var catalogRepo: CatalogRepository

    @Autowired
    @JsonIgnore
    lateinit var query: QueryRepository

    @Autowired
    @JsonIgnore
    lateinit var dateService: DateService

    override val identifier: String = "mcloud"
    override val title: String = "mCLOUD Katalog"
    override val description: String? = null

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX,
                combine = Operator.AND
            ),
            FacetGroup(
                "docType", "Dokumententyp", arrayOf(
                    DocMCloud()
                )
            ),
            FacetGroup(
                "spatial", "Raumbezug", arrayOf(
                    Spatial()
                ),
                viewComponent = ViewComponent.SPATIAL
            ),
            FacetGroup(
                "timeRef", "Zeitbezug", arrayOf(
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
                    Published(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX
            ),
            FacetGroup(
                "addrType", "Typ", arrayOf(
                    Organisations(),
                    Persons()
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
                add(toCodelistEntry("railway", "Bahn"))
                add(toCodelistEntry("waters", "Wasserstraßen und Gewässer"))
                add(toCodelistEntry("infrastructure", "Infrastruktur"))
                add(toCodelistEntry("climate", "Klima und Wetter"))
                add(toCodelistEntry("aviation", "Luft- und Raumfahrt"))
                add(toCodelistEntry("roads", "Straßen"))
            }
        }
        val codelist20001 = Codelist().apply {
            identifier = "20001"
            catalog = catalogRef
            name = "OpenData Kategorien"
            description = "Dies sind die Kategorien, die im OpenData Kontext verwendet werden"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(toCodelistEntry("SOCI", "Bevölkerung und Gesellschaft"))
                add(toCodelistEntry("EDUC", "Bildung, Kultur und Sport"))
                add(toCodelistEntry("ENER", "Energie"))
                add(toCodelistEntry("HEAL", "Gesundheit"))
                add(toCodelistEntry("INTR", "Internationale Themen"))
                add(toCodelistEntry("JUST", "Justiz, Rechtssystem und öffentliche Sicherheit"))
                add(toCodelistEntry("AGRI", "Landwirtschaft, Fischerei, Forstwirtschaft und Nahrungsmittel"))
                add(toCodelistEntry("GOVE", "Regierung und öffentlicher Sektor"))
                add(toCodelistEntry("REGI", "Regionen und Städte"))
                add(toCodelistEntry("ENVI", "Umwelt"))
                add(toCodelistEntry("TRAN", "Verkehr"))
                add(toCodelistEntry("ECON", "Wirtschaft und Finanzen"))
                add(toCodelistEntry("TECH", "Wissenschaft und Technologie"))
            }
        }
        val codelist20002 = Codelist().apply {
            identifier = "20002"
            catalog = catalogRef
            name = "Download Typ"
            description = "Dies sind die Typen, die ein Download-Eintrag haben kann"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(toCodelistEntry("API", "API"))
                add(toCodelistEntry("AtomFeed", "AtomFeed"))
                add(toCodelistEntry("Dateidownload", "Dateidownload"))
                add(toCodelistEntry("FTP", "FTP"))
                add(toCodelistEntry("Portal", "Portal"))
                add(toCodelistEntry("Software", "Software"))
                add(toCodelistEntry("SOS", "SOS"))
                add(toCodelistEntry("WCS", "WCS"))
                add(toCodelistEntry("WFS", "WFS"))
                add(toCodelistEntry("WMS", "WMS"))
                add(toCodelistEntry("WMTS", "WMTS"))
            }
        }
        val codelist20003 = Codelist().apply {
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

        when (codelistId) {
            "20000" -> removeAndAddCodelist(catalogId, codelist20000)
            "20001" -> removeAndAddCodelist(catalogId, codelist20001)
            "20002" -> removeAndAddCodelist(catalogId, codelist20002)
            "20003" -> removeAndAddCodelist(catalogId, codelist20003)
            null -> {
                removeAndAddCodelist(catalogId, codelist20000)
                codelistRepo.save(codelist20000)
                removeAndAddCodelist(catalogId, codelist20001)
                codelistRepo.save(codelist20001)
                removeAndAddCodelist(catalogId, codelist20002)
                codelistRepo.save(codelist20002)
                removeAndAddCodelist(catalogId, codelist20003)
                codelistRepo.save(codelist20003)
            }
            else -> throw ClientException.withReason("Codelist $codelistId is not supported by this profile: $identifier")
        }
    }

    override fun initCatalogQueries(catalogId: String) {
        val querymCloud = Query().apply {
            this.catalog = catalogRepo.findByIdentifier(catalogId)
            category = "facet"
            name = "Alle mCloud-Dokumente"
            description = "Zeigt alle Dokumente vom Typ mCloud"
            data = jacksonObjectMapper().createObjectNode().apply {
                val model = jacksonObjectMapper().createObjectNode().apply {
                    put("type", "selectDocuments")
                    set<ObjectNode>("docType", jacksonObjectMapper().createObjectNode().apply {
                        put("selectDocMCloud", true)
                    })
                }
                set<ObjectNode>("model", model)
            }
            modified = dateService.now()
        }
        query.save(querymCloud)
    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/mcloud/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/mcloud/default-settings.json")?.readText() ?: ""
    }

    private fun removeAndAddCodelist(catalogId: String, codelist: Codelist) {

        codelistRepo.deleteByCatalog_IdentifierAndIdentifier(catalogId, codelist.identifier)
        codelistRepo.flush()
        codelistRepo.save(codelist)

    }

    private fun toCodelistEntry(id: String, german: String, english: String? = null): JsonNode {
        return jacksonObjectMapper().createObjectNode().apply {
            put("id", id)
            put("localisations", jacksonObjectMapper().createObjectNode().apply {
                put("de", german)
            })
        }
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
