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
import de.ingrid.utils.xml.Wfs200NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

/**
 * @author André Wallat
 */
class Wfs200CapabilitiesParser(
    codelistHandler: CodelistHandler,
    private val researchService: ResearchService,
    catalogId: String,
) :
    GeneralCapabilitiesParser(XPathUtils(Wfs200NamespaceContext()), codelistHandler, catalogId), ICapabilitiesParser {

    private val versionSyslistMap = mapOf("1.1.0" to "1", "2.0" to "2", "2.0.0" to "2")

    companion object /*: SingletonHolder<Wfs200CapabilitiesParser, CodelistHandler>(::Wfs200CapabilitiesParser)*/ {
        private const val XPATH_EXP_WFS_KEYWORDS_FEATURE_TYPE =
            "/wfs20:WFS_Capabilities/wfs20:FeatureTypeList/wfs20:FeatureType/ows11:Keywords/ows11:Keyword"
        private const val XPATH_EXP_WFS_TITLE = "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:Title"
        private const val XPATH_EXP_WFS_ABSTRACT = "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:Abstract"
        private const val XPATH_EXP_WFS_VERSION =
            "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:ServiceTypeVersion"
        private const val XPATH_EXP_WFS_OP_GET_CAPABILITIES_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_POST_CAPABILITIES_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_GET_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='DescribeFeatureType']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_POST_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='DescribeFeatureType']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_GET_FEATURE_GET_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetFeature']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_GET_FEATURE_POST_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetFeature']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_GET_GML_OBJECT_GET_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetGmlObject']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_GET_GML_OBJECT_POST_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetGmlObject']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_LOCK_FEATURE_GET_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='LockFeature']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_LOCK_FEATURE_POST_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='LockFeature']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_TRANSACTION_GET_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='Transaction']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_TRANSACTION_POST_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='Transaction']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WFS_FEES = "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:Fees"
        private const val XPATH_EXP_WFS_ACCESS_CONSTRAINTS =
            "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:AccessConstraints"
        private const val XPATH_EXP_WFS_ONLINE_RESOURCE =
            "/wfs20:WFS_Capabilities/ows11:ServiceProvider/ows11:ServiceContact/ows11:ContactInfo/ows11:OnlineResource"
        private const val XPATH_EXP_WFS_KEYWORDS =
            "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:Keywords/ows11:Keyword"
        private const val XPATH_EXT_WFS_SERVICECONTACT =
            "/wfs20:WFS_Capabilities/ows11:ServiceProvider/ows11:ServiceContact"
        private const val XPATH_EXP_WFS_EXTENDED_CAPABILITIES =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata/ows11:ExtendedCapabilities/inspire_dls:ExtendedCapabilities"
    }

    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        return CapabilitiesBean().apply {
            serviceType = "WFS"
            dataServiceType = "3" // download
            title = xPathUtils.getString(doc, XPATH_EXP_WFS_TITLE)
            description = xPathUtils.getString(doc, XPATH_EXP_WFS_ABSTRACT)
            versions =
                mapVersionsFromCodelist("5153", getNodesContentAsList(doc, XPATH_EXP_WFS_VERSION), versionSyslistMap)
            fees = getKeyValueForPath(doc, XPATH_EXP_WFS_FEES, "6500")
            accessConstraints =
                mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WFS_ACCESS_CONSTRAINTS))
            onlineResources = getOnlineResources(doc, XPATH_EXP_WFS_ONLINE_RESOURCE)
            addExtendedCapabilities(this, doc, XPATH_EXP_WFS_EXTENDED_CAPABILITIES)
            keywords.addAll(getMoreKeywords(doc))
            boundingBoxes = getBoundingBoxesFromLayers(doc)
            spatialReferenceSystems = getSpatialReferenceSystems(
                doc,
                "/wfs20:WFS_Capabilities/wfs20:FeatureTypeList/wfs20:FeatureType/wfs20:DefaultCRS",
                "/wfs20:WFS_Capabilities/wfs20:FeatureTypeList/wfs20:FeatureType/wfs20:OtherCRS",
            )
            address = getAddress(doc)
            operations = getOperations(doc)
        }
    }

    private fun getOperations(doc: Document): List<OperationBean> {
        // Operation List
        val operations: MutableList<OperationBean> = mutableListOf()

        // Operation - GetCapabilities
        val getCapabilitiesOp = mapToOperationBean(
            doc,
            arrayOf(XPATH_EXP_WFS_OP_GET_CAPABILITIES_HREF, XPATH_EXP_WFS_OP_POST_CAPABILITIES_HREF),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_POST,
            ),
        )
        if (getCapabilitiesOp.addressList?.isNotEmpty() == true) {
            getCapabilitiesOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "GetCapabilities", "de"),
                "GetCapabilities",
            )
            getCapabilitiesOp.methodCall = "GetCapabilities"
            operations.add(getCapabilitiesOp)
        }

        // Operation - DescribeFeatureType
        val describeFeatureTypeOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_GET_HREF,
                XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_POST_HREF,
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_POST,
            ),
        )
        if (describeFeatureTypeOp.addressList?.isNotEmpty() == true) {
            describeFeatureTypeOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "DescribeFeatureType", "de"),
                "DescribeFeatureType",
            )
            describeFeatureTypeOp.methodCall = "DescribeFeatureType"
            operations.add(describeFeatureTypeOp)
        }

        // Operation - GetFeature
        val getFeatureOp = mapToOperationBean(
            doc,
            arrayOf(XPATH_EXP_WFS_OP_GET_FEATURE_GET_HREF, XPATH_EXP_WFS_OP_GET_FEATURE_POST_HREF),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_POST,
            ),
        )
        if (getFeatureOp.addressList?.isNotEmpty() == true) {
            getFeatureOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "GetFeature", "de"),
                "GetFeature",
            )
            getFeatureOp.methodCall = "GetFeature"
            operations.add(getFeatureOp)
        }

        // Operation - GetGmlObject - optional
        val getGmlObjectOp = mapToOperationBean(
            doc,
            arrayOf(XPATH_EXP_WFS_OP_GET_GML_OBJECT_GET_HREF, XPATH_EXP_WFS_OP_GET_GML_OBJECT_POST_HREF),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_POST,
            ),
        )
        if (getGmlObjectOp.addressList?.isNotEmpty() == true) {
            getGmlObjectOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "GetGmlObject", "de"),
                "GetGmlObject",
            )
            getGmlObjectOp.methodCall = "GetGmlObject"
            operations.add(getGmlObjectOp)
        }

        // Operation - LockFeature - optional
        val lockFeatureOp = mapToOperationBean(
            doc,
            arrayOf(XPATH_EXP_WFS_OP_LOCK_FEATURE_GET_HREF, XPATH_EXP_WFS_OP_LOCK_FEATURE_POST_HREF),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_POST,
            ),
        )
        if (lockFeatureOp.addressList?.isNotEmpty() == true) {
            lockFeatureOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "LockFeature", "de"),
                "LockFeature",
            )
            lockFeatureOp.methodCall = "LockFeature"
            operations.add(lockFeatureOp)
        }

        // Operation - Transaction - optional
        val transactionOp = mapToOperationBean(
            doc,
            arrayOf(XPATH_EXP_WFS_OP_TRANSACTION_GET_HREF, XPATH_EXP_WFS_OP_TRANSACTION_POST_HREF),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_POST,
            ),
        )
        if (transactionOp.addressList?.isNotEmpty() == true) {
            transactionOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5120", "Transaction", "de"),
                "Transaction",
            )
            transactionOp.methodCall = "Transaction"
            operations.add(transactionOp)
        }
        return operations
    }

    private fun getMoreKeywords(doc: Document): Collection<String> {
        // Keywords
        val keywords = getKeywords(doc, XPATH_EXP_WFS_KEYWORDS)

        // add keywords from feature types
        val keywordsFeatureType = getKeywords(doc, XPATH_EXP_WFS_KEYWORDS_FEATURE_TYPE)

        // add found keywords to our this bean
        keywords.addAll(keywordsFeatureType)
        return keywords.distinctBy { it.lowercase() }
    }

    private fun getBoundingBoxesFromLayers(doc: Document): List<LocationBean> {
        val bboxes: MutableList<LocationBean> = ArrayList()
        val layers = xPathUtils.getNodeList(doc, "/wfs20:WFS_Capabilities/wfs20:FeatureTypeList/wfs20:FeatureType")
        for (i in 0 until layers.length) {
            val layer = layers.item(i)
            val boundingBoxNode = xPathUtils.getNode(layer, "ows11:WGS84BoundingBox")
            val title = xPathUtils.getString(layer, "wfs20:Title")
            val box = if (boundingBoxNode != null) {
                val lower = xPathUtils.getString(boundingBoxNode, "ows11:LowerCorner").split(" ".toRegex())
                    .dropLastWhile { it.isEmpty() }
                    .toTypedArray()
                val upper = xPathUtils.getString(boundingBoxNode, "ows11:UpperCorner").split(" ".toRegex())
                    .dropLastWhile { it.isEmpty() }
                    .toTypedArray()
                LocationBean(
                    java.lang.Double.valueOf(lower[1]),
                    java.lang.Double.valueOf(lower[0]),
                    java.lang.Double.valueOf(upper[1]),
                    java.lang.Double.valueOf(upper[0]),
                    title,
                    "free",
                )
            } else {
                LocationBean(name = title, type = "free")
            }

            bboxes.add(box)
        }
        return bboxes
    }

    private fun getAddress(doc: Document): AddressBean {
        return AddressBean().apply {
            setNameInAddressBean(
                this,
                xPathUtils.getString(doc, "$XPATH_EXT_WFS_SERVICECONTACT/ows11:IndividualName"),
            )
            email = xPathUtils.getString(
                doc,
                "$XPATH_EXT_WFS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:ElectronicMailAddress",
            )

            // try to find address in database and set the uuid if found
            searchForAddress(researchService, catalogId, this)

            street = xPathUtils.getString(
                doc,
                "$XPATH_EXT_WFS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:DeliveryPoint",
            )
            city =
                xPathUtils.getString(doc, "$XPATH_EXT_WFS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:City")
            postcode = xPathUtils.getString(
                doc,
                "$XPATH_EXT_WFS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:PostalCode",
            )
            country =
                getKeyValue(
                    "6200",
                    xPathUtils.getString(
                        doc,
                        "$XPATH_EXT_WFS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:Country",
                    ),
                )
            state = getKeyValue(
                "6250",
                xPathUtils.getString(
                    doc,
                    "$XPATH_EXT_WFS_SERVICECONTACT/ows11:ContactInfo/ows11:Address/ows11:AdministrativeArea",
                ),
                "name",
            )
            phone =
                xPathUtils.getString(doc, "$XPATH_EXT_WFS_SERVICECONTACT/ows11:ContactInfo/ows11:Phone/ows11:Voice")
        }
    }
}
