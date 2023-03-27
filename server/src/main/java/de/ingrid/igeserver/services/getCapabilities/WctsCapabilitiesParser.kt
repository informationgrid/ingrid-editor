package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.utils.xml.WctsNamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

class WctsCapabilitiesParser(codelistHandler: CodelistHandler,
                             private val researchService: ResearchService,
                             val catalogId: String) :
    GeneralCapabilitiesParser(XPathUtils(WctsNamespaceContext()), codelistHandler), ICapabilitiesParser {


    private val versionSyslistMap = mapOf("1.0" to "1")

    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        return CapabilitiesBean().apply {
            serviceType = "WCTS"
            dataServiceType = "4" // transformation
            title = xPathUtils.getString(doc, XPATH_EXP_WCTS_TITLE)
            description = xPathUtils.getString(doc, XPATH_EXP_WCTS_ABSTRACT)
            val versionList = getNodesContentAsList(doc, XPATH_EXP_WCTS_VERSION)
            versions = mapVersionsFromCodelist("5154", versionList, versionSyslistMap)
            fees = getKeyValueForPath(doc, XPATH_EXP_WCTS_FEES, "6500")
            accessConstraints =
                mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WCTS_ACCESS_CONSTRAINTS))

            // TODO: Resource Locator / Type
            // ...

            keywords = getKeywords(doc, XPATH_EXP_WCTS_KEYWORDS).toMutableList()
            address = getAddress(doc)
            operations = getOperations(doc)
        }
    }

    private fun getOperations(doc: Document): List<OperationBean> {

        // Operation List
        val operations: MutableList<OperationBean> = ArrayList()

        // Operation - GetCapabilities
        val getCapabilitiesOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCTS_OP_GET_CAPABILITIES_GET_HREF,
                XPATH_EXP_WCTS_OP_GET_CAPABILITIES_POST_HREF
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

        // Operation - Transform
        val transformOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCTS_OP_TRANSFORM_GET_HREF,
                XPATH_EXP_WCTS_OP_TRANSFORM_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (transformOp.addressList!!.isNotEmpty()) {
            transformOp.name = "Transform"
            transformOp.methodCall = "Transform"

            operations.add(transformOp)
        }


        // Operation - IsTransformable
        val isTransformableOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCTS_OP_IS_TRANSFORMABLE_GET_HREF,
                XPATH_EXP_WCTS_OP_IS_TRANSFORMABLE_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (isTransformableOp.addressList!!.isNotEmpty()) {
            isTransformableOp.name = "IsTransformable"
            isTransformableOp.methodCall = "IsTransformable"

            operations.add(isTransformableOp)
        }

        // Operation - GetTransformation
        val getTransformationOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCTS_OP_GET_TRANSFORMATION_GET_HREF,
                XPATH_EXP_WCTS_OP_GET_TRANSFORMATION_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getTransformationOp.addressList!!.isNotEmpty()) {
            getTransformationOp.name = "GetTransformation"
            getTransformationOp.methodCall = "GetTransformation"

            operations.add(getTransformationOp)
        }

        // Operation - DescribeTransformation
        // TODO: Does this operation still exists???
        val describeTransformationOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCTS_OP_DESCRIBE_TRANSFORMATION_GET_HREF,
                XPATH_EXP_WCTS_OP_DESCRIBE_TRANSFORMATION_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (describeTransformationOp.addressList!!.isNotEmpty()) {
            describeTransformationOp.name = "DescribeTransformation"
            describeTransformationOp.methodCall = "DescribeTransformation"

            operations.add(describeTransformationOp)
        }

        // Operation - DescribeTransformation
        val getResourceByIdOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCTS_OP_GET_RESOURCE_BY_ID_GET_HREF,
                XPATH_EXP_WCTS_OP_GET_RESOURCE_BY_ID_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getResourceByIdOp.addressList!!.isNotEmpty()) {
            getResourceByIdOp.name = "GetResourceById"
            getResourceByIdOp.methodCall = "GetResourceByID"

            operations.add(getResourceByIdOp)
        }

        // Operation - DescribeCRS
        val describeCRSOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCTS_OP_DESCRIBE_CRS_GET_HREF,
                XPATH_EXP_WCTS_OP_DESCRIBE_CRS_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (describeCRSOp.addressList!!.isNotEmpty()) {
            describeCRSOp.name = "DescribeCRS"
            describeCRSOp.methodCall = "DescribeCRS"

            operations.add(describeCRSOp)
        }

        // Operation - DescribeMethod
        val describeMethodOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WCTS_OP_DESCRIBE_METHOD_GET_HREF,
                XPATH_EXP_WCTS_OP_DESCRIBE_METHOD_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (describeMethodOp.addressList!!.isNotEmpty()) {
            describeMethodOp.name = "DescribeMethod"
            describeMethodOp.methodCall = "DescribeMethod"

            operations.add(describeMethodOp)
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
                "$XPATH_EXT_WCTS_SERVICECONTACT/owsgeo:IndividualName"
            )
        )
        address.email = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCTS_SERVICECONTACT/owsgeo:ContactInfo/owsgeo:Address/owsgeo:ElectronicMailAddress"
        )

        // try to find address in database and set the uuid if found
        searchForAddress(researchService, catalogId, address)
        
        address.street = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCTS_SERVICECONTACT/owsgeo:ContactInfo/owsgeo:Address/owsgeo:DeliveryPoint"
        )
        address.city = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCTS_SERVICECONTACT/owsgeo:ContactInfo/owsgeo:Address/owsgeo:City"
        )
        address.postcode = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCTS_SERVICECONTACT/owsgeo:ContactInfo/owsgeo:Address/owsgeo:PostalCode"
        )
        address.country = getKeyValue("6200", xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCTS_SERVICECONTACT/owsgeo:ContactInfo/owsgeo:Address/owsgeo:Country"
        ))
        address.state = getKeyValue("110", xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCTS_SERVICECONTACT/owsgeo:ContactInfo/owsgeo:Address/owsgeo:AdministrativeArea"
        ), "name")
        address.phone = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WCTS_SERVICECONTACT/owsgeo:ContactInfo/owsgeo:Phone/owsgeo:Voice"
        )
        return address
    }

    companion object {
        private const val XPATH_EXP_WCTS_FEES = "/wcts:Capabilities/owsgeo:ServiceIdentification/owsgeo:Fees"
        private const val XPATH_EXP_WCTS_ACCESS_CONSTRAINTS =
            "/wcts:Capabilities/owsgeo:ServiceIdentification/owsgeo:AccessConstraints"
        private const val XPATH_EXP_WCTS_KEYWORDS =
            "/wcts:Capabilities/owsgeo:ServiceIdentification/owsgeo:Keywords/owsgeo:Keyword"
        private const val XPATH_EXP_WCTS_TITLE = "/wcts:Capabilities/owsgeo:ServiceIdentification[1]/owsgeo:Title[1]"
        private const val XPATH_EXP_WCTS_ABSTRACT =
            "/wcts:Capabilities/owsgeo:ServiceIdentification[1]/owsgeo:Abstract[1]"
        private const val XPATH_EXP_WCTS_VERSION = "/wcts:Capabilities/@version"
        private const val XPATH_EXP_WCTS_OP_GET_CAPABILITIES_GET_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='GetCapabilities']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_GET_CAPABILITIES_POST_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='GetCapabilities']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_TRANSFORM_GET_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='Transform']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_TRANSFORM_POST_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='Transform']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_IS_TRANSFORMABLE_GET_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='IsTransformable']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_IS_TRANSFORMABLE_POST_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='IsTransformable']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_GET_TRANSFORMATION_GET_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='GetTransformation']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_GET_TRANSFORMATION_POST_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='GetTransformation']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_DESCRIBE_TRANSFORMATION_GET_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='DescribeTransformation']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_DESCRIBE_TRANSFORMATION_POST_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='DescribeTransformation']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_GET_RESOURCE_BY_ID_GET_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='GetResourceByID']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_GET_RESOURCE_BY_ID_POST_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='GetResourceByID']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_DESCRIBE_CRS_GET_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='DescribeCRS']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_DESCRIBE_CRS_POST_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='DescribeCRS']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Post[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_DESCRIBE_METHOD_GET_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='DescribeMethod']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Get[1]/@xlink:href"
        private const val XPATH_EXP_WCTS_OP_DESCRIBE_METHOD_POST_HREF =
            "/wcts:Capabilities/owsgeo:OperationsMetadata[1]/owsgeo:Operation[@name='DescribeMethod']/owsgeo:DCP[1]/owsgeo:HTTP[1]/owsgeo:Post[1]/@xlink:href"
        private const val XPATH_EXT_WCTS_SERVICECONTACT =
            "/wcts:Capabilities/owsgeo:ServiceProvider/owsgeo:ServiceContact"
    }
}