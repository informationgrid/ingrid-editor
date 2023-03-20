package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.xml.Csw202NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

class CswCapabilitiesParser(codelistHandler: CodelistHandler) :
    GeneralCapabilitiesParser(XPathUtils(Csw202NamespaceContext()), codelistHandler), ICapabilitiesParser {

    private val versionSyslistMap = mapOf("2.0.2" to "1")

    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        val result = CapabilitiesBean()

        // General settings
        result.serviceType = "CSW"
        result.dataServiceType = "1" // discovery
        result.title = xPathUtils.getString(doc, XPATH_EXP_CSW_TITLE)
        result.description = xPathUtils.getString(doc, XPATH_EXP_CSW_ABSTRACT)
        val versionList = getNodesContentAsList(doc, XPATH_EXP_CSW_VERSION)
        val mappedVersionList =
            mapVersionsFromCodelist("???", versionList, versionSyslistMap)
        result.versions = mappedVersionList

        // Fees
        result.fees = getKeyValueForPath(doc, XPATH_EXP_CSW_FEES, "6500")

        // Access Constraints
        result.accessConstraints =
            mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_CSW_ACCESS_CONSTRAINTS))

        // Online Resources
        result.onlineResources = getOnlineResources(doc, XPATH_EXP_CSW_ONLINE_RESOURCE)

        // add extended capabilities to the bean which contains even more information to be used
        addExtendedCapabilities(result, doc, XPATH_EXP_CSW_EXTENDED_CAPABILITIES)

        // Keywords
        val keywords: List<String> = getKeywords(doc, XPATH_EXP_CSW_KEYWORDS)

        // add found keywords to our result bean
        result.keywords.addAll(keywords)

        // get contact information
        result.address = getAddress(doc)

        // Operation List
        val operations: MutableList<OperationBean> = ArrayList()

        // Operation - GetCapabilities
        val getCapabilitiesOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_CSW_OP_GET_CAPABILITIES_GET_HREF,
                XPATH_EXP_CSW_OP_GET_CAPABILITIES_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getCapabilitiesOp.addressList!!.isNotEmpty()) {
            getCapabilitiesOp.name = "GetCapabilities"
            getCapabilitiesOp.methodCall = "GetCapabilities"
            
            operations.add(getCapabilitiesOp)
        }


        // Operation - DescribeRecord
        val describeRecordOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_CSW_OP_DESCRIBE_RECORD_GET_HREF,
                XPATH_EXP_CSW_OP_DESCRIBE_RECORD_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (describeRecordOp.addressList!!.isNotEmpty()) {
            describeRecordOp.name = "DescribeRecord"
            describeRecordOp.methodCall = "DescribeRecord"
            
            operations.add(describeRecordOp)
        }


        // Operation - GetDomain
        val getDomainOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_CSW_OP_GET_DOMAIN_GET_HREF,
                XPATH_EXP_CSW_OP_GET_DOMAIN_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getDomainOp.addressList!!.isNotEmpty()) {
            getDomainOp.name = "GetDomain"
            getDomainOp.methodCall = "GetDomain"
            
            operations.add(getDomainOp)
        }

        // Operation - GetRecords
        val getRecordsOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_CSW_OP_GET_RECORDS_GET_HREF,
                XPATH_EXP_CSW_OP_GET_RECORDS_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getRecordsOp.addressList!!.isNotEmpty()) {
            getRecordsOp.name = "GetRecords"
            getRecordsOp.methodCall = "GetRecords"
            
            operations.add(getRecordsOp)
        }

        // Operation - GetRecordById
        val getRecordByIdOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_CSW_OP_GET_RECORD_BY_ID_GET_HREF,
                XPATH_EXP_CSW_OP_GET_RECORD_BY_ID_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getRecordByIdOp.addressList!!.isNotEmpty()) {
            getRecordByIdOp.name = "GetRecordById"
            getRecordByIdOp.methodCall = "GetRecordById"
            
            operations.add(getRecordByIdOp)
        }

        // Operation - Harvest
        val harvestOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_CSW_OP_HARVEST_GET_HREF,
                XPATH_EXP_CSW_OP_HARVEST_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (harvestOp.addressList!!.isNotEmpty()) {
            harvestOp.name = "Harvest"
            harvestOp.methodCall = "Harvest"
            
            operations.add(harvestOp)
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
                "$XPATH_EXT_CSW_SERVICECONTACT/ows:IndividualName"
            )
        )
        address.email = xPathUtils.getString(
            doc,
            "$XPATH_EXT_CSW_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:ElectronicMailAddress"
        )

        // try to find address in database and set the uuid if found
//        searchForAddress(address)
        address.street = xPathUtils.getString(
            doc,
            "$XPATH_EXT_CSW_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:DeliveryPoint"
        )
        address.city = xPathUtils.getString(
            doc,
            "$XPATH_EXT_CSW_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:City"
        )
        address.postcode = xPathUtils.getString(
            doc,
            "$XPATH_EXT_CSW_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:PostalCode"
        )
        address.country = xPathUtils.getString(
            doc,
            "$XPATH_EXT_CSW_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:Country"
        )
        address.state = xPathUtils.getString(
            doc,
            "$XPATH_EXT_CSW_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:AdministrativeArea"
        )
        address.phone = xPathUtils.getString(
            doc,
            "$XPATH_EXT_CSW_SERVICECONTACT/ows:ContactInfo/ows:Phone/ows:Voice"
        )
        return address
    }

    companion object {
        private const val XPATH_EXP_CSW_EXTENDED_CAPABILITIES =
            "/csw:Capabilities/ows:OperationsMetadata/inspire_ds:ExtendedCapabilities"
        private const val XPATH_EXT_CSW_SERVICECONTACT = "/csw:Capabilities/ows:ServiceProvider/ows:ServiceContact"
        private const val XPATH_EXP_CSW_KEYWORDS =
            "/csw:Capabilities/ows:ServiceIdentification/ows:Keywords/ows:Keyword/text()"
        private const val XPATH_EXP_CSW_TITLE = "/csw:Capabilities/ows:ServiceIdentification[1]/ows:Title[1]"
        private const val XPATH_EXP_CSW_ABSTRACT = "/csw:Capabilities/ows:ServiceIdentification[1]/ows:Abstract[1]"
        private const val XPATH_EXP_CSW_VERSION = "/csw:Capabilities/@version"
        private const val XPATH_EXP_CSW_OP_GET_CAPABILITIES_GET_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetCapabilities']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_GET_CAPABILITIES_POST_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetCapabilities']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_DESCRIBE_RECORD_GET_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='DescribeRecord']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_DESCRIBE_RECORD_POST_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='DescribeRecord']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_GET_DOMAIN_GET_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetDomain']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_GET_DOMAIN_POST_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetDomain']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_GET_RECORDS_GET_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetRecords']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_GET_RECORDS_POST_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetRecords']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_GET_RECORD_BY_ID_GET_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetRecordById']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_GET_RECORD_BY_ID_POST_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetRecordById']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_HARVEST_GET_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='Harvest']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_CSW_OP_HARVEST_POST_HREF =
            "/csw:Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='Harvest']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_CSW_FEES = "/csw:Capabilities/ows:ServiceIdentification/ows:Fees"
        private const val XPATH_EXP_CSW_ACCESS_CONSTRAINTS =
            "/csw:Capabilities/ows:ServiceIdentification/ows:AccessConstraints"
        private const val XPATH_EXP_CSW_ONLINE_RESOURCE =
            "/csw:Capabilities/ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:OnlineResource"
    }
}