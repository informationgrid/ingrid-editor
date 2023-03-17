package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.xml.WcsNamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

class WcsCapabilitiesParser(codelistHandler: CodelistHandler) :
    GeneralCapabilitiesParser(XPathUtils(WcsNamespaceContext()), codelistHandler), ICapabilitiesParser {


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
        result.fees = xPathUtils.getString(doc, XPATH_EXP_WCS_FEES)

        // Access Constraints
        result.accessConstraints =
            getNodesContentAsList(doc, XPATH_EXP_WCS_ACCESS_CONSTRAINTS)

        // Online Resources
        result.onlineResources = getOnlineResources(doc, XPATH_EXP_WCS_ONLINE_RESOURCE)

        // TODO: Resource Locator / Type
        // ...

        // Keywords
        val keywords: List<String> = getKeywords(doc, XPATH_EXP_WCS_KEYWORDS)

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
            ), arrayOf(ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST)
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
                "$XPATH_EXT_WCS_SERVICECONTACT/wcs:individualName"
            )
        )
        address.email = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/wcs:contactInfo/wcs:address/wcs:electronicMailAddress"
        )

        // try to find address in database and set the uuid if found
//        searchForAddress(address)
        address.street = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/wcs:contactInfo/wcs:address/wcs:deliveryPoint"
        )
        address.city = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/wcs:contactInfo/wcs:address/wcs:city"
        )
        address.postcode = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/wcs:contactInfo/wcs:address/wcs:postalCode"
        )
        address.country = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/wcs:contactInfo/wcs:address/wcs:country"
        )
        address.state = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/wcs:contactInfo/wcs:address/wcs:administrativeArea"
        )
        address.phone = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/wcs:contactInfo/wcs:phone/wcs:voice"
        )
        return address
    }

    companion object {
        private const val XPATH_EXP_WCS_TITLE = "/wcs:WCS_Capabilities/wcs:Service/wcs:name"
        private const val XPATH_EXP_WCS_ABSTRACT = "/wcs:WCS_Capabilities/wcs:Service/wcs:description"
        private const val XPATH_EXP_WCS_VERSION = "/wcs:WCS_Capabilities/@version"
        private const val XPATH_EXP_WCS_OP_GET_CAPABILITIES_GET_HREF =
            "/wcs:WCS_Capabilities/wcs:Capability/wcs:Request/wcs:GetCapabilities/wcs:DCPType/wcs:HTTP/wcs:Get/wcs:OnlineResource"
        private const val XPATH_EXP_WCS_OP_GET_CAPABILITIES_POST_HREF =
            "/wcs:WCS_Capabilities/wcs:Capability/wcs:Request/wcs:GetCapabilities/wcs:DCPType/wcs:HTTP/wcs:Post/wcs:OnlineResource/@xlink:href"
        private const val XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_GET_HREF =
            "/wcs:WCS_Capabilities/wcs:Capability/wcs:Request/wcs:DescribeCoverage/wcs:DCPType/wcs:HTTP/wcs:Get/wcs:OnlineResource/@xlink:href"
        private const val XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_POST_HREF =
            "/wcs:WCS_Capabilities/wcs:Capability/wcs:Request/wcs:DescribeCoverage/wcs:DCPType/wcs:HTTP/wcs:Post/wcs:OnlineResource/@xlink:href"
        private const val XPATH_EXP_WCS_OP_GET_COVERAGE_GET_HREF =
            "/wcs:WCS_Capabilities/wcs:Capability/wcs:Request/wcs:GetCoverage/wcs:DCPType/wcs:HTTP/wcs:Get/wcs:OnlineResource/@xlink:href"
        private const val XPATH_EXP_WCS_OP_GET_COVERAGE_POST_HREF =
            "/wcs:WCS_Capabilities/wcs:Capability/wcs:Request/wcs:GetCoverage/wcs:DCPType/wcs:HTTP/wcs:Post/wcs:OnlineResource/@xlink:href"
        private const val XPATH_EXT_WCS_SERVICECONTACT = "/wcs:WCS_Capabilities/wcs:Service/wcs:responsibleParty"
        private const val XPATH_EXP_WCS_FEES = "/wcs:WCS_Capabilities/wcs:Service/wcs:fees"
        private const val XPATH_EXP_WCS_ACCESS_CONSTRAINTS = "/wcs:WCS_Capabilities/wcs:Service/wcs:accessConstraints"
        private const val XPATH_EXP_WCS_ONLINE_RESOURCE =
            "/wcs:WCS_Capabilities/wcs:Service/wcs:responsibleParty/wcs:contactInfo/wcs:onlineResource"
        private const val XPATH_EXP_WCS_KEYWORDS =
            "/wcs:WCS_Capabilities/wcs:ContentMetadata/wcs:CoverageOfferingBrief/wcs:keywords/wcs:keyword"
    }
}