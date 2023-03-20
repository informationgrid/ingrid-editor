package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.xml.Wcs11NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

class Wcs11CapabilitiesParser(codelistHandler: CodelistHandler) :
    GeneralCapabilitiesParser(XPathUtils(Wcs11NamespaceContext()), codelistHandler), ICapabilitiesParser {

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
        if (!getCapabilitiesOp.addressList!!.isEmpty()) {
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
        if (!describeCoverageOp.addressList!!.isEmpty()) {
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
        if (!getCoverageOp.addressList!!.isEmpty()) {
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
                XPATH_EXT_WCS_SERVICECONTACT + "/ows11:IndividualName"
            )
        )
        address.email = xPathUtils.getString(
            doc,
            XPATH_EXT_WCS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:ElectronicMailAddress"
        )

        // try to find address in database and set the uuid if found
//        searchForAddress(address)
        address.street = xPathUtils.getString(
            doc,
            XPATH_EXT_WCS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:DeliveryPoint"
        )
        address.city = xPathUtils.getString(
            doc,
            XPATH_EXT_WCS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:City"
        )
        address.postcode = xPathUtils.getString(
            doc,
            XPATH_EXT_WCS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:PostalCode"
        )
        address.country = xPathUtils.getString(
            doc,
            XPATH_EXT_WCS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:Country"
        )
        address.state = xPathUtils.getString(
            doc,
            XPATH_EXT_WCS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:AdministrativeArea"
        )
        address.phone = xPathUtils.getString(
            doc,
            XPATH_EXT_WCS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Phone/ows11:Voice"
        )
        return address
    }

    companion object {
        private const val XPATH_EXT_WCS_SERVICECONTACT =
            "/wcs11:Capabilities/ows11:ServiceProvider/ows11:ServiceContact"
        private const val XPATH_EXP_WCS_FEES = "/wcs11:Capabilities/ows11:ServiceIdentification/ows11:Fees"
        private const val XPATH_EXP_WCS_ACCESS_CONSTRAINTS =
            "/wcs11:Capabilities/ows11:ServiceIdentification/ows11:AccessConstraints"
        private const val XPATH_EXP_WCS_ONLINE_RESOURCE =
            "/wcs11:Capabilities/ows11:ServiceProvider/ows11:ServiceContact/ows11:ContactInfo/ows11:OnlineResource"
        private const val XPATH_EXP_WCS_TITLE = "/wcs11:Capabilities/ows11:ServiceIdentification[1]/ows11:Title[1]"
        private const val XPATH_EXP_WCS_ABSTRACT =
            "/wcs11:Capabilities/ows11:ServiceIdentification[1]/ows11:Abstract[1]"
        private const val XPATH_EXP_WCS_VERSION =
            "/wcs11:Capabilities/ows11:ServiceIdentification/ows11:ServiceTypeVersion"
        private const val XPATH_EXP_WCS_OP_GET_CAPABILITIES_GET_HREF =
            "/wcs11:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_GET_CAPABILITIES_POST_HREF =
            "/wcs11:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_GET_HREF =
            "/wcs11:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='DescribeCoverage']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_DESCRIBE_COVERAGE_POST_HREF =
            "/wcs11:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='DescribeCoverage']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_GET_COVERAGE_GET_HREF =
            "/wcs11:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCoverage']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCS_OP_GET_COVERAGE_POST_HREF =
            "/wcs11:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCoverage']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCS_KEYWORDS =
            "/wcs11:Capabilities/ows11:ServiceIdentification/ows11:Keywords/ows11:Keyword"
    }
}