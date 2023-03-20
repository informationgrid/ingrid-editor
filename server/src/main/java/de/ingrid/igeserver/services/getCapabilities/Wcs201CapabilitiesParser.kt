package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.xml.Wcs201NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

class Wcs201CapabilitiesParser(codelistHandler: CodelistHandler) :
    GeneralCapabilitiesParser(XPathUtils(Wcs201NamespaceContext()), codelistHandler), ICapabilitiesParser {

    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        val result = CapabilitiesBean()

        // General settings
        result.serviceType = "WCS"
        result.dataServiceType = "3" // download
        result.title = xPathUtils.getString(doc, XPATH_EXP_WCS_TITLE)
        result.description = xPathUtils.getString(doc, XPATH_EXP_WCS_ABSTRACT)
        result.versions =
            addOGCtoVersions(getNodesContentAsList(doc, XPATH_EXP_WCS_VERSION))

        // Fees
        result.fees = getKeyValueForPath(doc, XPATH_EXP_WCS_FEES, "6500")

        // Access Constraints
        result.accessConstraints =
            mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WCS_ACCESS_CONSTRAINTS))

        // Online Resources
        result.onlineResources =
            getOnlineResources(doc, XPATH_EXP_WCS_ONLINE_RESOURCE)

        // TODO: Resource Locator / Type
        // ...

        // Keywords
        val keywords: List<String> = getKeywords(doc, XPATH_EXP_WCS_KEYWORDS)

        // Extended - Keywords
        // add found keywords to our result bean
        result.keywords = keywords.toMutableList()

        // get contact information
        result.address = getAddress(doc)

        // Operation List
        val operations: MutableList<OperationBean> = ArrayList()


        // Operation - GetCapabilities
        val getCapabilitiesOp = mapToOperationBean(
            doc, arrayOf(
                XPATH_EXP_WCS_OP_GET_CAPABILITIES_GET_HREF,
                XPATH_EXP_WCS_OP_GET_CAPABILITIES_POST_HREF
            ), arrayOf(ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST)
        )
        if (getCapabilitiesOp.addressList!!.isNotEmpty()) {
            getCapabilitiesOp.name = "GetCapabilities"
            getCapabilitiesOp.methodCall = "GetCapabilities"

            operations.add(getCapabilitiesOp)
        }

        // Operation - DescribeCoverage
        val describeCoverageOp = mapToOperationBean(
            doc, arrayOf(
                XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_GET_HREF,
                XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_POST_HREF
            ), arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (describeCoverageOp.addressList!!.isNotEmpty()) {
            describeCoverageOp.name = "DescribeCoverage"
            describeCoverageOp.methodCall = "DescribeCoverage"

            operations.add(describeCoverageOp)
        }

        // Operation - GetCoverage
        val getCoverageOp = mapToOperationBean(
            doc, arrayOf(
                XPATH_EXP_WCS_OP_GET_COVERAGE_GET_HREF,
                XPATH_EXP_WCS_OP_GET_COVERAGE_POST_HREF
            ), arrayOf(ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST)
        )
        if (getCoverageOp.addressList!!.isNotEmpty()) {
            getCoverageOp.name = "GetCoverage"
            getCoverageOp.methodCall = "GetCoverage"

            operations.add(getCoverageOp)
        }
        result.operations = operations
        val union = getBoundingBoxes(doc)
        result.boundingBoxes = union
        result.spatialReferenceSystems = getSpatialReferenceSystems(doc, "/wcs201:Capabilities/wcs201:ServiceMetadata/wcs201:Extension/crs:CrsMetadata/crs:crsSupported")
        return result
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
                "$XPATH_EXT_WCS_SERVICECONTACT/ows20:IndividualName"
            )
        )
        address.email = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:ElectronicMailAddress"
        )

        // try to find address in database and set the uuid if found
//        searchForAddress(address)
        address.street = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:DeliveryPoint"
        )
        address.city = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:City"
        )
        address.postcode = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:PostalCode"
        )
        address.country = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:Country"
        )
        address.state = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Address/ows20:AdministrativeArea"
        )
        address.phone = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows20:ContactInfo/ows20:Phone/ows20:Voice"
        )
        return address
    }

    private fun getBoundingBoxes(doc: Document): List<LocationBean> {
        val bboxes: MutableList<LocationBean> = ArrayList()
        val title = xPathUtils.getString(doc, "/wcs201:Capabilities/wcs201:Contents/wcs201:CoverageSummary/ows20:Title")
        val layers = xPathUtils.getNodeList(
            doc,
            "/wcs201:Capabilities/wcs201:Contents/wcs201:CoverageSummary/ows20:WGS84BoundingBox"
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
            box.latitude1 = java.lang.Double.valueOf(lower[0])
            box.longitude1 = java.lang.Double.valueOf(lower[1])
            box.latitude2 = java.lang.Double.valueOf(upper[0])
            box.longitude2 = java.lang.Double.valueOf(upper[1])

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