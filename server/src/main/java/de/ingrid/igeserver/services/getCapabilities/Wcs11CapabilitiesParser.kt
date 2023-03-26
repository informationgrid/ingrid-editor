package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.utils.xml.Wcs11NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

class Wcs11CapabilitiesParser(codelistHandler: CodelistHandler,
                              private val researchService: ResearchService,
                              val catalogId: String) :
    GeneralCapabilitiesParser(XPathUtils(Wcs11NamespaceContext()), codelistHandler), ICapabilitiesParser {

    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        return CapabilitiesBean().apply {
            serviceType = "WCS"
            dataServiceType = "3" // download
            title = xPathUtils.getString(doc, XPATH_EXP_WCS_TITLE)
            description = xPathUtils.getString(doc, XPATH_EXP_WCS_ABSTRACT)
            versions =
                addOGCtoVersions(getNodesContentAsList(doc, XPATH_EXP_WCS_VERSION))
            fees = getKeyValueForPath(doc, XPATH_EXP_WCS_FEES, "6500")
            accessConstraints =
                mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WCS_ACCESS_CONSTRAINTS))
            onlineResources =
                getOnlineResources(doc, XPATH_EXP_WCS_ONLINE_RESOURCE)

            // TODO: Resource Locator / Type
            // ...
            keywords = getKeywords(doc, XPATH_EXP_WCS_KEYWORDS).toMutableList()
            address = getAddress(doc)
            operations = getOperations(doc)
        }
    }

    private fun getOperations(doc: Document): List<OperationBean> {
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
                "$XPATH_EXT_WCS_SERVICECONTACT/ows11:IndividualName"
            )
        )
        address.email = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:ElectronicMailAddress"
        )

        // try to find address in database and set the uuid if found
        searchForAddress(researchService, catalogId, address)
        
        address.street = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:DeliveryPoint"
        )
        address.city = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:City"
        )
        address.postcode = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:PostalCode"
        )
        address.country = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:Country"
        )
        address.state = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:AdministrativeArea"
        )
        address.phone = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCS_SERVICECONTACT/ows11:ContactInfo/ows11:Phone/ows11:Voice"
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