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
import de.ingrid.utils.xml.Wcs201NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

class Wcs201CapabilitiesParser(
    codelistHandler: CodelistHandler,
    private val researchService: ResearchService,
    catalogId: String,
) :
    GeneralCapabilitiesParser(XPathUtils(Wcs201NamespaceContext()), codelistHandler, catalogId), ICapabilitiesParser {

    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        return CapabilitiesBean().apply {
            // General settings
            serviceType = "WCS"
            dataServiceType = "3" // download
            title = xPathUtils.getString(doc, XPATH_EXP_WCS_TITLE)
            description = xPathUtils.getString(doc, XPATH_EXP_WCS_ABSTRACT)
            versions = addOGCtoVersions(getNodesContentAsList(doc, XPATH_EXP_WCS_VERSION))

            // Fees
            fees = getKeyValueForPath(doc, XPATH_EXP_WCS_FEES, "6500")

            // Access Constraints
            accessConstraints =
                mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WCS_ACCESS_CONSTRAINTS))

            // Online Resources
            onlineResources = getOnlineResources(doc, XPATH_EXP_WCS_ONLINE_RESOURCE)

            // TODO: Resource Locator / Type
            // ...

            keywords = getKeywords(doc, XPATH_EXP_WCS_KEYWORDS).toMutableList()
            address = getAddress(doc)
            operations = getOperations(doc)
            boundingBoxes = getBoundingBoxes(doc)
            spatialReferenceSystems = getSpatialReferenceSystems(
                doc,
                "/wcs201:Capabilities/wcs201:ServiceMetadata/wcs201:Extension/crs:CrsMetadata/crs:crsSupported",
            )
        }
    }

    private fun getOperations(doc: Document): List<OperationBean> {
        // Operation List
        val operations: MutableList<OperationBean> = ArrayList()

        // Operation - GetCapabilities
        val getCapabilitiesOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCS_OP_GET_CAPABILITIES_GET_HREF,
                XPATH_EXP_WCS_OP_GET_CAPABILITIES_POST_HREF,
            ),
            arrayOf(ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST),
        )
        if (getCapabilitiesOp.addressList!!.isNotEmpty()) {
            getCapabilitiesOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "GetCapabilities", "de"),
                "GetCapabilities",
            )
            getCapabilitiesOp.methodCall = "GetCapabilities"

            operations.add(getCapabilitiesOp)
        }

        // Operation - DescribeCoverage
        val describeCoverageOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_GET_HREF,
                XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_POST_HREF,
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_POST,
            ),
        )
        if (describeCoverageOp.addressList!!.isNotEmpty()) {
            describeCoverageOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "DescribeCoverage", "de"),
                "DescribeCoverage",
            )
            describeCoverageOp.methodCall = "DescribeCoverage"

            operations.add(describeCoverageOp)
        }

        // Operation - GetCoverage
        val getCoverageOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCS_OP_GET_COVERAGE_GET_HREF,
                XPATH_EXP_WCS_OP_GET_COVERAGE_POST_HREF,
            ),
            arrayOf(ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST),
        )
        if (getCoverageOp.addressList!!.isNotEmpty()) {
            getCoverageOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "GetCoverage", "de"),
                "GetCoverage",
            )
            getCoverageOp.methodCall = "GetCoverage"

            operations.add(getCoverageOp)
        }
        return operations
    }

    /**
     * @param doc
     * @return
     */
    private fun getAddress(doc: Document): AddressBean {
        val address = AddressBean()
        setNameInAddressBean(
            address,
            xPathUtils.getString(
                doc,
                "$XPATH_EXT_WCS_SERVICECONTACT/ows20:IndividualName",
            ),
        )
        address.email = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:ElectronicMailAddress",
        )

        // try to find address in database and set the uuid if found
        searchForAddress(researchService, catalogId, address)

        address.street = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:DeliveryPoint",
        )
        address.city = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:City",
        )
        address.postcode = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:PostalCode",
        )
        address.country = getKeyValue(
            "6200",
            xPathUtils.getString(
                doc,
                "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:Country",
            ),
        )
        address.state = getKeyValue(
            "6250",
            xPathUtils.getString(
                doc,
                "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:AdministrativeArea",
            ),
            "name",
        )
        address.phone = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Phone/ows20:Voice",
        )
        return address
    }

    private fun getBoundingBoxes(doc: Document): List<LocationBean> {
        val bboxes: MutableList<LocationBean> = ArrayList()
        val title = xPathUtils.getString(doc, "/wcs201:Capabilities/wcs201:Contents/wcs201:CoverageSummary/ows20:Title")
        val layers = xPathUtils.getNodeList(
            doc,
            "/wcs201:Capabilities/wcs201:Contents/wcs201:CoverageSummary/ows20:WGS84BoundingBox",
        )
        for (i in 0 until layers.length) {
            val layer = layers.item(i)
            val lower =
                xPathUtils.getString(layer, "ows20:LowerCorner").split(" ".toRegex()).dropLastWhile { it.isEmpty() }
                    .toTypedArray()
            val upper =
                xPathUtils.getString(layer, "ows20:UpperCorner").split(" ".toRegex()).dropLastWhile { it.isEmpty() }
                    .toTypedArray()
            val box = LocationBean()
            box.latitude1 = java.lang.Double.valueOf(lower[1])
            box.longitude1 = java.lang.Double.valueOf(lower[0])
            box.latitude2 = java.lang.Double.valueOf(upper[1])
            box.longitude2 = java.lang.Double.valueOf(upper[0])

            // add a fallback for the name, since it's mandatory
            box.name = title
            // shall be a free spatial reference, but needs an ID to check for duplications!
//            box.setTopicId(box.name)
            box.type = "free"
            bboxes.add(box)
        }
        return bboxes
    }

    companion object {
        private const val XPATH_EXT_WCS_SERVICECONTACT =
            "/wcs201:Capabilities/ows20:ServiceProvider/ows20:ServiceContact"
        private const val XPATH_EXP_WCS_FEES = "/wcs201:Capabilities/ows20:ServiceIdentification/ows20:Fees"
        private const val XPATH_EXP_WCS_ACCESS_CONSTRAINTS =
            "/wcs201:Capabilities/ows20:ServiceIdentification/ows20:AccessConstraints"
        private const val XPATH_EXP_WCS_ONLINE_RESOURCE =
            "/wcs201:Capabilities/ows20:ServiceProvider/ows20:ServiceContact/ows20:ContactInfo/ows20:OnlineResource"
        private const val XPATH_EXP_WCS_TITLE = "/wcs201:Capabilities/ows20:ServiceIdentification[1]/ows20:Title[1]"
        private const val XPATH_EXP_WCS_ABSTRACT =
            "/wcs201:Capabilities/ows20:ServiceIdentification[1]/ows20:Abstract[1]"
        private const val XPATH_EXP_WCS_VERSION =
            "/wcs201:Capabilities/ows20:ServiceIdentification/ows20:ServiceTypeVersion"
        private const val XPATH_EXP_WCS_OP_GET_CAPABILITIES_GET_HREF =
            "/wcs201:Capabilities/ows20:OperationsMetadata[1]/ows20:Operation[@name='GetCapabilities']/ows20:DCP[1]/ows20:HTTP[1]/ows20:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_GET_CAPABILITIES_POST_HREF =
            "/wcs201:Capabilities/ows20:OperationsMetadata[1]/ows20:Operation[@name='GetCapabilities']/ows20:DCP[1]/ows20:HTTP[1]/ows20:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_GET_HREF =
            "/wcs201:Capabilities/ows20:OperationsMetadata[1]/ows20:Operation[@name='DescribeCoverage']/ows20:DCP[1]/ows20:HTTP[1]/ows20:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_POST_HREF =
            "/wcs201:Capabilities/ows20:OperationsMetadata[1]/ows20:Operation[@name='DescribeCoverage']/ows20:DCP[1]/ows20:HTTP[1]/ows20:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_GET_COVERAGE_GET_HREF =
            "/wcs201:Capabilities/ows20:OperationsMetadata[1]/ows20:Operation[@name='GetCoverage']/ows20:DCP[1]/ows20:HTTP[1]/ows20:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_GET_COVERAGE_POST_HREF =
            "/wcs201:Capabilities/ows20:OperationsMetadata[1]/ows20:Operation[@name='GetCoverage']/ows20:DCP[1]/ows20:HTTP[1]/ows20:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCS_KEYWORDS =
            "/wcs201:Capabilities/ows20:ServiceIdentification/ows20:Keywords/ows20:Keyword"
    }
}
