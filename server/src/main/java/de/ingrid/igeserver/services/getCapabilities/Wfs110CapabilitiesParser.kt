/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import de.ingrid.utils.xml.Wfs110NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document
import javax.xml.xpath.XPathExpressionException

class Wfs110CapabilitiesParser(
    codelistHandler: CodelistHandler,
    private val researchService: ResearchService,
    val catalogId: String
) :
    GeneralCapabilitiesParser(XPathUtils(Wfs110NamespaceContext()), codelistHandler), ICapabilitiesParser {

    private val versionSyslistMap = mapOf("1.1.0" to "1", "2.0" to "2")

    /* (non-Javadoc)
     * @see de.ingrid.mdek.dwr.services.capabilities.ICapabilityDocument#setTitle(org.w3c.dom.Document)
     */
    @Throws(XPathExpressionException::class)
    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        return CapabilitiesBean().apply {
            serviceType = "WFS"
            dataServiceType = "3" // download
            title = xPathUtils.getString(doc, XPATH_EXP_WFS_TITLE)
            description = xPathUtils.getString(doc, XPATH_EXP_WFS_ABSTRACT)
            val versionList = getNodesContentAsList(doc, XPATH_EXP_WFS_VERSION)
            versions = mapVersionsFromCodelist("5153", versionList, versionSyslistMap)
            fees = getKeyValueForPath(doc, XPATH_EXP_WFS_FEES, "6500")
            accessConstraints =
                mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WFS_ACCESS_CONSTRAINTS))
            onlineResources =
                getOnlineResources(doc, XPATH_EXP_WFS_ONLINE_RESOURCE)
            addExtendedCapabilities(this, doc, XPATH_EXP_WFS_EXTENDED_CAPABILITIES)
            keywords += (getKeywords(doc, XPATH_EXP_WFS_KEYWORDS) + getKeywords(
                doc,
                XPATH_EXP_WFS_KEYWORDS_FEATURE_TYPE
            )).distinctBy { it.lowercase() }
            boundingBoxes = getBoundingBoxesFromLayers(doc)
            spatialReferenceSystems = getSpatialReferenceSystems(
                doc,
                "/wfs:WFS_Capabilities/wfs:FeatureTypeList/wfs:FeatureType/wfs:DefaultSRS",
                "/wfs:WFS_Capabilities/wfs:FeatureTypeList/wfs:FeatureType/wfs:OtherSRS"
            )
            address = getAddress(doc)
            operations = getOperations(doc)
        }
    }

    private fun getOperations(doc: Document): List<OperationBean> {

        // Operation List
        val operations: MutableList<OperationBean> = ArrayList()

        // Operation - GetCapabilities
        val getCapabilitiesOp = mapToOperationBean(
            doc, arrayOf(XPATH_EXP_WFS_OP_GET_CAPABILITIES_HREF, XPATH_EXP_WFS_OP_POST_CAPABILITIES_HREF), arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getCapabilitiesOp.addressList!!.isNotEmpty()) {
            getCapabilitiesOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "GetCapabilities", "de"),
                "GetCapabilities"
            )
            getCapabilitiesOp.methodCall = "GetCapabilities"

            operations.add(getCapabilitiesOp)
        }

        // Operation - DescribeFeatureType
        val describeFeatureTypeOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_GET_HREF,
                XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (describeFeatureTypeOp.addressList!!.isNotEmpty()) {
            describeFeatureTypeOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "DescribeFeatureType", "de"),
                "DescribeFeatureType"
            )
            describeFeatureTypeOp.methodCall = "DescribeFeatureType"

            operations.add(describeFeatureTypeOp)
        }

        // Operation - GetFeature
        val getFeatureOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WFS_OP_GET_FEATURE_GET_HREF,
                XPATH_EXP_WFS_OP_GET_FEATURE_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getFeatureOp.addressList!!.isNotEmpty()) {
            getFeatureOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "GetFeature", "de"),
                "GetFeature"
            )
            getFeatureOp.methodCall = "GetFeature"

            operations.add(getFeatureOp)
        }

        // Operation - GetGmlObject - optional
        val getGmlObjectOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WFS_OP_GET_GML_OBJECT_GET_HREF,
                XPATH_EXP_WFS_OP_GET_GML_OBJECT_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getGmlObjectOp.addressList!!.isNotEmpty()) {
            getGmlObjectOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "GetGmlObject", "de"),
                "GetGmlObject"
            )
            getGmlObjectOp.methodCall = "GetGmlObject"

            operations.add(getGmlObjectOp)
        }

        // Operation - LockFeature - optional
        val lockFeatureOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WFS_OP_LOCK_FEATURE_GET_HREF,
                XPATH_EXP_WFS_OP_LOCK_FEATURE_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (lockFeatureOp.addressList!!.isNotEmpty()) {
            lockFeatureOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "LockFeature", "de"),
                "LockFeature"
            )
            lockFeatureOp.methodCall = "LockFeature"

            operations.add(lockFeatureOp)
        }

        // Operation - Transaction - optional
        val transactionOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WFS_OP_TRANSACTION_GET_HREF,
                XPATH_EXP_WFS_OP_TRANSACTION_POST_HREF
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (transactionOp.addressList!!.isNotEmpty()) {
            transactionOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "Transaction", "de"),
                "Transaction"
            )
            transactionOp.methodCall = "Transaction"

            operations.add(transactionOp)
        }
        return operations
    }

    private fun getBoundingBoxesFromLayers(doc: Document): List<LocationBean> {
        val bboxes: MutableList<LocationBean> = ArrayList()
        val layers = xPathUtils.getNodeList(doc, "/wfs:WFS_Capabilities/wfs:FeatureTypeList/wfs:FeatureType")
        for (i in 0 until layers.length) {
            val layer = layers.item(i)
            val boundingBoxNode = xPathUtils.getNode(layer, "ows:WGS84BoundingBox")
            val title = xPathUtils.getString(layer, "wfs:Title")
            val box = if (boundingBoxNode != null) {
                val lower = xPathUtils.getString(boundingBoxNode, "ows:LowerCorner").split(" ".toRegex())
                    .dropLastWhile { it.isEmpty() }
                    .toTypedArray()
                val upper = xPathUtils.getString(boundingBoxNode, "ows:UpperCorner").split(" ".toRegex())
                    .dropLastWhile { it.isEmpty() }
                    .toTypedArray()
                LocationBean(
                    java.lang.Double.valueOf(lower[0]),
                    java.lang.Double.valueOf(lower[1]),
                    java.lang.Double.valueOf(upper[0]),
                    java.lang.Double.valueOf(upper[1]),
                    title, "free"
                )
            } else {
                LocationBean(name = title, type = "free")
            }

            bboxes.add(box)
        }
        return bboxes
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
                "$XPATH_EXT_WFS_SERVICECONTACT/ows:IndividualName"
            )
        )
        address.email = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WFS_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:ElectronicMailAddress"
        )

        // try to find address in database and set the uuid if found
        searchForAddress(researchService, catalogId, address)

        address.street = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WFS_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:DeliveryPoint"
        )
        address.city = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WFS_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:City"
        )
        address.postcode = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WFS_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:PostalCode"
        )
        address.country = getKeyValue(
            "6200", xPathUtils.getString(
                doc,
                "$XPATH_EXT_WFS_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:Country"
            )
        )
        address.state = getKeyValue(
            "110", xPathUtils.getString(
                doc,
                "$XPATH_EXT_WFS_SERVICECONTACT/ows:ContactInfo/ows:Address/ows:AdministrativeArea"
            ), "name"
        )
        address.phone = xPathUtils.getString(
            doc,
            "$XPATH_EXT_WFS_SERVICECONTACT/ows:ContactInfo/ows:Phone/ows:Voice"
        )
        return address
    }

    companion object {
        private const val XPATH_EXP_WFS_KEYWORDS_FEATURE_TYPE =
            "/wfs:WFS_Capabilities/wfs:FeatureTypeList/wfs:FeatureType/ows:Keywords/ows:Keyword"
        private const val XPATH_EXP_WFS_TITLE = "/wfs:WFS_Capabilities/ows:ServiceIdentification/ows:Title"
        private const val XPATH_EXP_WFS_ABSTRACT = "/wfs:WFS_Capabilities/ows:ServiceIdentification/ows:Abstract"
        private const val XPATH_EXP_WFS_VERSION =
            "/wfs:WFS_Capabilities/ows:ServiceIdentification/ows:ServiceTypeVersion"
        private const val XPATH_EXP_WFS_OP_GET_CAPABILITIES_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetCapabilities']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_POST_CAPABILITIES_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetCapabilities']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_GET_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='DescribeFeatureType']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_POST_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='DescribeFeatureType']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_GET_FEATURE_GET_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetFeature']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_GET_FEATURE_POST_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetFeature']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_GET_GML_OBJECT_GET_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetGmlObject']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_GET_GML_OBJECT_POST_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='GetGmlObject']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_LOCK_FEATURE_GET_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='LockFeature']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_LOCK_FEATURE_POST_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='LockFeature']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_TRANSACTION_GET_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='Transaction']/ows:DCP[1]/ows:HTTP[1]/ows:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_TRANSACTION_POST_HREF =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata[1]/ows:Operation[@name='Transaction']/ows:DCP[1]/ows:HTTP[1]/ows:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_FEES = "/wfs:WFS_Capabilities/ows:ServiceIdentification/ows:Fees"
        private const val XPATH_EXP_WFS_ACCESS_CONSTRAINTS =
            "/wfs:WFS_Capabilities/ows:ServiceIdentification/ows:AccessConstraints"
        private const val XPATH_EXP_WFS_ONLINE_RESOURCE =
            "/wfs:WFS_Capabilities/ows:ServiceProvider/ows:ServiceContact/ows:ContactInfo/ows:OnlineResource"
        private const val XPATH_EXP_WFS_KEYWORDS =
            "/wfs:WFS_Capabilities/ows:ServiceIdentification/ows:Keywords/ows:Keyword"
        private const val XPATH_EXT_WFS_SERVICECONTACT = "/wfs:WFS_Capabilities/ows:ServiceProvider/ows:ServiceContact"
        private const val XPATH_EXP_WFS_EXTENDED_CAPABILITIES =
            "/wfs:WFS_Capabilities/ows:OperationsMetadata/ows:ExtendedCapabilities/inspire_dls:ExtendedCapabilities"
    }
}