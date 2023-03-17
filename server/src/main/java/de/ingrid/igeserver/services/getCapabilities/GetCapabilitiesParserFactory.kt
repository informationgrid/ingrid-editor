package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.xml.*
import de.ingrid.utils.xpath.XPathUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import org.w3c.dom.Document


@Service
class GetCapabilitiesParserFactory constructor(val codelistHandler: CodelistHandler) {

    private lateinit var xPathUtils: XPathUtils
    val log = logger()

    init {
        val ns = ConfigurableNamespaceContext().apply {
            addNamespaceContext(Csw202NamespaceContext())
            addNamespaceContext(Wms130NamespaceContext())
            addNamespaceContext(Wfs110NamespaceContext())
            addNamespaceContext(Wfs200NamespaceContext())
            addNamespaceContext(WcsNamespaceContext())
            addNamespaceContext(Wcs11NamespaceContext())
            addNamespaceContext(Wcs201NamespaceContext())
            addNamespaceContext(WctsNamespaceContext())
            addNamespaceContext(WmtsNamespaceContext())
        }

        xPathUtils = XPathUtils(ns)
    }

    private enum class ServiceType {
        WMS130, WMS111, WFS110, WFS200, WCS, WCS11, WCS201, CSW, WCTS, WMTS
    }

    // identifier for each service type
    private val SERVICE_TYPE_WMS = "WMS"
    private val SERVICE_TYPE_WFS = "WFS"
    private val SERVICE_TYPE_WCS = "WCS"
    private val SERVICE_TYPE_CSW = "CSW"
    private val SERVICE_TYPE_WCTS = "WCTS"
    private val SERVICE_TYPE_WMTS = "WMTS"

    fun get(doc: Document): ICapabilitiesParser {
        return when (getServiceType(doc)) {
            ServiceType.WMS111 -> Wms111CapabilitiesParser(codelistHandler)
            ServiceType.WMS130 -> Wms130CapabilitiesParser(codelistHandler)
            ServiceType.WFS110 -> Wfs110CapabilitiesParser(codelistHandler)
            ServiceType.WFS200 -> Wfs200CapabilitiesParser(codelistHandler)
            ServiceType.WCS -> WcsCapabilitiesParser(codelistHandler)
            ServiceType.WCS11 -> Wcs11CapabilitiesParser(codelistHandler)
            ServiceType.WCS201 -> Wcs201CapabilitiesParser(codelistHandler)
            ServiceType.CSW -> CswCapabilitiesParser(codelistHandler)
            ServiceType.WCTS -> WctsCapabilitiesParser(codelistHandler)
            ServiceType.WMTS -> WmtsCapabilitiesParser(codelistHandler)
        }
    }

    private fun getServiceType(doc: Document): ServiceType {

        return when {
            // WMS Version 1.3.0
            isServiceType(doc, ServiceType.WMS130) -> ServiceType.WMS130
            // WMS Version 1.1.1
            isServiceType(doc, ServiceType.WMS111) -> ServiceType.WMS111
            // WCS Version 1.0.0. Doesn't have a Service or ServiceType/Name Element. Just check if WCS_Capabilities exists
            isServiceType(doc, ServiceType.WCS) -> ServiceType.WCS
            isServiceType(doc, ServiceType.WCS11) -> ServiceType.WCS11
            isServiceType(doc, ServiceType.WCS201) -> ServiceType.WCS201
            isServiceType(doc, ServiceType.WCTS) -> ServiceType.WCTS
            isServiceType(doc, ServiceType.WFS110) -> ServiceType.WFS110
            isServiceType(doc, ServiceType.WFS200) -> ServiceType.WFS200
            isServiceType(doc, ServiceType.WMTS) -> ServiceType.WMTS
            else -> {
                val value = xPathUtils.getString(doc, "/csw:Capabilities/ows:ServiceIdentification/ows:ServiceType[1]")
                    ?: throw RuntimeException("Service Type not found")
                when { // TODO: handle lowercase!
                    value.contains(SERVICE_TYPE_WMS) -> ServiceType.WMS130
                    value.contains(SERVICE_TYPE_WFS) -> ServiceType.WFS200
                    value.contains(SERVICE_TYPE_WCS) -> ServiceType.WCS
                    value.contains(SERVICE_TYPE_CSW) -> ServiceType.CSW
                    value.contains(SERVICE_TYPE_WCTS) -> ServiceType.WCTS
                    else -> {
                        log.debug("Invalid service type: $value")
                        throw RuntimeException("Invalid service type: $value")
                    }
                }
            }
        }
    }

    private fun isServiceType(doc: Document, serviceType: ServiceType): Boolean {
        return when (serviceType) {
            ServiceType.WMS130 -> xPathUtils.getString(doc, "/wms:WMS_Capabilities/wms:Service/wms:Name[1]") != null
            ServiceType.WMS111 -> xPathUtils.getString(doc, "/WMT_MS_Capabilities/Service/Name[1]") != null
            ServiceType.WFS110 -> xPathUtils.getString(
                doc,
                "/wfs:WFS_Capabilities/ows:ServiceIdentification/ows:ServiceType[1]"
            ) != null

            ServiceType.WFS200 -> xPathUtils.getString(
                doc,
                "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:ServiceType[1]"
            ) != null

            ServiceType.WCS -> xPathUtils.getString(doc, "/wcs:WCS_Capabilities") != null
            ServiceType.WCS11 -> xPathUtils.getString(
                doc,
                "/wcs11:Capabilities/ows11:ServiceIdentification/ows11:ServiceType[1]"
            )?.contains(SERVICE_TYPE_WCS) ?: false

            ServiceType.WCS201 -> xPathUtils.getString(
                doc,
                "/wcs201:Capabilities/ows20:ServiceIdentification/ows20:ServiceType[1]"
            )?.contains(SERVICE_TYPE_WCS) ?: false

            ServiceType.WCTS -> xPathUtils.getString(
                doc,
                "/wcts:Capabilities/owsgeo:ServiceIdentification/owsgeo:ServiceType[1]"
            )?.contains(SERVICE_TYPE_WCTS) ?: false

            ServiceType.WMTS -> xPathUtils.getString(
                doc,
                "/wmts:Capabilities/ows11:ServiceIdentification/ows11:ServiceType"
            ) != null

            else -> false
        }
    }

}