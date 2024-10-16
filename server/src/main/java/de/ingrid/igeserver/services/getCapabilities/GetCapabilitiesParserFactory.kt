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
package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.utils.xml.ConfigurableNamespaceContext
import de.ingrid.utils.xml.Csw202NamespaceContext
import de.ingrid.utils.xml.Wcs11NamespaceContext
import de.ingrid.utils.xml.Wcs201NamespaceContext
import de.ingrid.utils.xml.WcsNamespaceContext
import de.ingrid.utils.xml.WctsNamespaceContext
import de.ingrid.utils.xml.Wfs110NamespaceContext
import de.ingrid.utils.xml.Wfs200NamespaceContext
import de.ingrid.utils.xml.Wms130NamespaceContext
import de.ingrid.utils.xml.WmtsNamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import org.w3c.dom.Document

@Service
class GetCapabilitiesParserFactory(val codelistHandler: CodelistHandler, val researchService: ResearchService) {

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
        WMS130,
        WMS111,
        WFS110,
        WFS200,
        WCS,
        WCS11,
        WCS201,
        CSW,
        WCTS,
        WMTS,
    }

    companion object {
        // identifier for each service type
        private const val SERVICE_TYPE_WMS = "WMS"
        private const val SERVICE_TYPE_WFS = "WFS"
        private const val SERVICE_TYPE_WCS = "WCS"
        private const val SERVICE_TYPE_CSW = "CSW"
        private const val SERVICE_TYPE_WCTS = "WCTS"
        private const val SERVICE_TYPE_WMTS = "WMTS"
    }

    fun get(doc: Document, catalogId: String): ICapabilitiesParser = when (getServiceType(doc)) {
        ServiceType.WMS111 -> Wms111CapabilitiesParser(codelistHandler, researchService, catalogId)
        ServiceType.WMS130 -> Wms130CapabilitiesParser(codelistHandler, researchService, catalogId)
        ServiceType.WFS110 -> Wfs110CapabilitiesParser(codelistHandler, researchService, catalogId)
        ServiceType.WFS200 -> Wfs200CapabilitiesParser(codelistHandler, researchService, catalogId)
        ServiceType.WCS -> WcsCapabilitiesParser(codelistHandler, researchService, catalogId)
        ServiceType.WCS11 -> Wcs11CapabilitiesParser(codelistHandler, researchService, catalogId)
        ServiceType.WCS201 -> Wcs201CapabilitiesParser(codelistHandler, researchService, catalogId)
        ServiceType.CSW -> CswCapabilitiesParser(codelistHandler, researchService, catalogId)
        ServiceType.WCTS -> WctsCapabilitiesParser(codelistHandler, researchService, catalogId)
        ServiceType.WMTS -> WmtsCapabilitiesParser(codelistHandler, researchService, catalogId)
    }

    private fun getServiceType(doc: Document): ServiceType = when {
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
                ?.uppercase()
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

    private fun isServiceType(doc: Document, serviceType: ServiceType): Boolean = when (serviceType) {
        ServiceType.WMS130 -> xPathUtils.getString(doc, "/wms:WMS_Capabilities/wms:Service/wms:Name[1]") != null
        ServiceType.WMS111 -> xPathUtils.getString(doc, "/WMT_MS_Capabilities/Service/Name[1]") != null
        ServiceType.WFS110 -> xPathUtils.getString(
            doc,
            "/wfs:WFS_Capabilities/ows:ServiceIdentification/ows:ServiceType[1]",
        ) != null

        ServiceType.WFS200 -> xPathUtils.getString(
            doc,
            "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:ServiceType[1]",
        ) != null

        ServiceType.WCS -> xPathUtils.getString(doc, "/wcs:WCS_Capabilities") != null
        ServiceType.WCS11 -> xPathUtils.getString(
            doc,
            "/wcs11:Capabilities/ows11:ServiceIdentification/ows11:ServiceType[1]",
        )?.uppercase()?.contains(SERVICE_TYPE_WCS) ?: false

        ServiceType.WCS201 -> xPathUtils.getString(
            doc,
            "/wcs201:Capabilities/ows20:ServiceIdentification/ows20:ServiceType[1]",
        )?.uppercase()?.contains(SERVICE_TYPE_WCS) ?: false

        ServiceType.WCTS -> xPathUtils.getString(
            doc,
            "/wcts:Capabilities/owsgeo:ServiceIdentification/owsgeo:ServiceType[1]",
        )?.uppercase()?.contains(SERVICE_TYPE_WCTS) ?: false

        ServiceType.WMTS -> xPathUtils.getString(
            doc,
            "/wmts:Capabilities/ows11:ServiceIdentification/ows11:ServiceType",
        ) != null

        else -> false
    }
}
