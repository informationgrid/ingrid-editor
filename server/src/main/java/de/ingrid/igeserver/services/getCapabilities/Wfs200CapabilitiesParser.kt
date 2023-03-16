package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.utils.xml.Wfs200NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.apache.commons.lang3.ArrayUtils
import org.w3c.dom.Document

/**
 * @author André Wallat
 */
class Wfs200CapabilitiesParser : GeneralCapabilitiesParser(XPathUtils(Wfs200NamespaceContext())), ICapabilitiesParser {
    private val versionSyslistMap: MutableMap<String, Int>

    init {
        versionSyslistMap = HashMap()
        versionSyslistMap["1.1.0"] = 1
        versionSyslistMap["2.0"] = 2
        versionSyslistMap["2.0.0"] = 2
    }

    /* (non-Javadoc)
     * @see de.ingrid.mdek.dwr.services.capabilities.ICapabilityDocument#setTitle(org.w3c.dom.Document)
     */
    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        val result = CapabilitiesBean()

        // General settings
        result.serviceType = "WFS"
        result.dataServiceType = 3 // download
        result.title = xPathUtils.getString(doc, XPATH_EXP_WFS_TITLE)
        result.description = xPathUtils.getString(doc, XPATH_EXP_WFS_ABSTRACT)
        val versionList = getNodesContentAsList(doc, XPATH_EXP_WFS_VERSION)
        //        List<String> mappedVersionList = mapVersionsFromCodelist(MdekSysList.OBJ_SERV_VERSION_WFS.getDbValue(), versionList, versionSyslistMap);
//        result.setVersions(mappedVersionList);
        val version = versionList.getOrNull(0)

        // Fees
        result.fees = xPathUtils.getString(doc, XPATH_EXP_WFS_FEES)

        // Access Constraints
        result.accessConstraints = getNodesContentAsList(doc, XPATH_EXP_WFS_ACCESS_CONSTRAINTS)

        // Online Resources
        result.onlineResources = getOnlineResources(doc, XPATH_EXP_WFS_ONLINE_RESOURCE)

        // add extended capabilities to the bean which contains even more information to be used
        addExtendedCapabilities(result, doc, XPATH_EXP_WFS_EXTENDED_CAPABILITIES)

        // Keywords
        val keywords = getKeywords(doc, XPATH_EXP_WFS_KEYWORDS)

        // add keywords from feature types
        val keywordsFeatureType = getKeywords(doc, XPATH_EXP_WFS_KEYWORDS_FEATURE_TYPE)

        // add found keywords to our result bean
        keywords.addAll(keywordsFeatureType)
        result.keywords?.addAll(keywords)
        val union = getBoundingBoxesFromLayers(doc)
        result.boundingBoxes = union
        val spatialReferenceSystems = getSpatialReferenceSystems(doc)
        result.spatialReferenceSystems = spatialReferenceSystems

        // get contact information
        result.address = getAddress(doc)

        // Operation List
        val operations: MutableList<OperationBean> = ArrayList()

        // Operation - GetCapabilities
        val getCapabilitiesOp = mapToOperationBean(
            doc, arrayOf(XPATH_EXP_WFS_OP_GET_CAPABILITIES_HREF), arrayOf(
                ID_OP_PLATFORM_HTTP_GET
            )
        )
        if (getCapabilitiesOp.addressList?.isNotEmpty() == true) {
            getCapabilitiesOp.name = "GetCapabilities"
            getCapabilitiesOp.methodCall = "GetCapabilities"
            operations.add(getCapabilitiesOp)
        }

        // Operation - DescribeFeatureType
        val describeFeatureTypeOp = mapToOperationBean(
            doc,
            arrayOf(XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_GET_HREF, XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_POST_HREF),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (describeFeatureTypeOp.addressList?.isNotEmpty() == true) {
            describeFeatureTypeOp.name = "DescribeFeatureType"
            describeFeatureTypeOp.methodCall = "DescribeFeatureType"
            operations.add(describeFeatureTypeOp)
        }

        // Operation - GetFeature
        val getFeatureOp = mapToOperationBean(
            doc, arrayOf(XPATH_EXP_WFS_OP_GET_FEATURE_GET_HREF, XPATH_EXP_WFS_OP_GET_FEATURE_POST_HREF), arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getFeatureOp.addressList?.isNotEmpty() == true) {
            getFeatureOp.name = "GetFeature"
            getFeatureOp.methodCall = "GetFeature"
            operations.add(getFeatureOp)
        }

        // Operation - GetGmlObject - optional
        val getGmlObjectOp = mapToOperationBean(
            doc, arrayOf(XPATH_EXP_WFS_OP_GET_GML_OBJECT_GET_HREF, XPATH_EXP_WFS_OP_GET_GML_OBJECT_POST_HREF), arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (getGmlObjectOp.addressList?.isNotEmpty() == true) {
            getGmlObjectOp.name = "GetGmlObject"
            getGmlObjectOp.methodCall = "GetGmlObject"
            operations.add(getGmlObjectOp)
        }

        // Operation - LockFeature - optional
        val lockFeatureOp = mapToOperationBean(
            doc, arrayOf(XPATH_EXP_WFS_OP_LOCK_FEATURE_GET_HREF, XPATH_EXP_WFS_OP_LOCK_FEATURE_POST_HREF), arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (lockFeatureOp.addressList?.isNotEmpty() == true) {
            lockFeatureOp.name = "LockFeature"
            lockFeatureOp.methodCall = "LockFeature"
            operations.add(lockFeatureOp)
        }

        // Operation - Transaction - optional
        val transactionOp = mapToOperationBean(
            doc, arrayOf(XPATH_EXP_WFS_OP_TRANSACTION_GET_HREF, XPATH_EXP_WFS_OP_TRANSACTION_POST_HREF), arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (transactionOp.addressList?.isNotEmpty() == true) {
            transactionOp.name = "Transaction"
            transactionOp.methodCall = "Transaction"
            operations.add(transactionOp)
        }
        result.operations = operations
        return result
    }

    /**
     * @param doc
     * @return
     */
    private fun getBoundingBoxesFromLayers(doc: Document): List<LocationBean> {
        val bboxes: MutableList<LocationBean> = ArrayList()
        val layers = xPathUtils.getNodeList(doc, "/wfs20:WFS_Capabilities/wfs20:FeatureTypeList/wfs20:FeatureType")
        for (i in 0 until layers.length) {
            val layer = layers.item(i)
            val lower = xPathUtils.getString(layer, "ows11:WGS84BoundingBox/ows11:LowerCorner").split(" ".toRegex())
                .dropLastWhile { it.isEmpty() }
                .toTypedArray()
            val upper = xPathUtils.getString(layer, "ows11:WGS84BoundingBox/ows11:UpperCorner").split(" ".toRegex())
                .dropLastWhile { it.isEmpty() }
                .toTypedArray()
            val box = LocationBean(
                java.lang.Double.valueOf(lower[0]),
                java.lang.Double.valueOf(lower[1]),
                java.lang.Double.valueOf(upper[0]),
                java.lang.Double.valueOf(upper[1]), "???", "frei"
            )

            // add a fallback for the name, since it's mandatory
            val title = xPathUtils.getString(layer, "wfs20:Title")
            box.name = title
            // shall be a free spatial reference, but needs an ID to check for duplications!
//            box.setTopicId(box.getName());
//            box.setType("free");
            bboxes.add(box)
        }
        return bboxes
    }

    /**
     * @param doc
     * @return
     */
    private fun getSpatialReferenceSystems(doc: Document): List<SpatialReferenceSystemBean> {
        val result: MutableList<SpatialReferenceSystemBean> = ArrayList()
        val crs = xPathUtils.getStringArray(
            doc,
            "/wfs20:WFS_Capabilities/wfs20:FeatureTypeList/wfs20:FeatureType/wfs20:DefaultCRS"
        )
        val crsOther = xPathUtils.getStringArray(
            doc,
            "/wfs20:WFS_Capabilities/wfs20:FeatureTypeList/wfs20:FeatureType/wfs20:OtherCRS"
        )
        val crsAll = ArrayUtils.addAll(crs, *crsOther) as Array<String>
        val uniqueCrs: MutableList<String?> = ArrayList()

        // check codelists for matching entryIds
        for (item in crsAll) {
            val srsBean = SpatialReferenceSystemBean()
            var itemId: Int?
            itemId = try {
                val splittedItem = item.split(":".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                Integer.valueOf(splittedItem[splittedItem.size - 1])
            } catch (e: NumberFormatException) {
                // also detect crs like: http://www.opengis.net/def/crs/[epsg|ogc]/0/{code} (REDMINE-2108)
                val splittedItem = item.split("/".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                Integer.valueOf(splittedItem[splittedItem.size - 1])
            }
            val value: String? = null // TODO: syslistCache.getValueFromListId(100, itemId, false);
            if (value == null || value.isEmpty()) {
                srsBean.id = -1
                srsBean.name = item
            } else {
                srsBean.id = itemId
                srsBean.name = value
            }
            if (!uniqueCrs.contains(srsBean.name)) {
                result.add(srsBean)
                uniqueCrs.add(srsBean.name)
            }
        }
        return result
    }

    private fun getAddress(doc: Document): AddressBean {
        val address = AddressBean()
        setNameInAddressBean(address, xPathUtils.getString(doc, XPATH_EXT_WFS_SERVICECONTACT + "/ows11:IndividualName"))
        address.email = xPathUtils.getString(
            doc,
            XPATH_EXT_WFS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:ElectronicMailAddress"
        )

        // try to find address in database and set the uuid if found
//        searchForAddress(address);
        address.street = xPathUtils.getString(
            doc,
            XPATH_EXT_WFS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:DeliveryPoint"
        )
        address.city =
            xPathUtils.getString(doc, XPATH_EXT_WFS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:City")
        address.postcode = xPathUtils.getString(
            doc,
            XPATH_EXT_WFS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:PostalCode"
        )
        address.country =
            xPathUtils.getString(doc, XPATH_EXT_WFS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:Country")
        address.state = xPathUtils.getString(
            doc,
            XPATH_EXT_WFS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:AdministrativeArea"
        )
        address.phone =
            xPathUtils.getString(doc, XPATH_EXT_WFS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Phone/ows11:Voice")
        return address
    }

    companion object {
        private const val XPATH_EXP_WFS_KEYWORDS_FEATURE_TYPE =
            "/wfs20:WFS_Capabilities/wfs20:FeatureTypeList/wfs20:FeatureType/ows11:Keywords/ows11:Keyword"
        private const val XPATH_EXP_WFS_TITLE = "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:Title"
        private const val XPATH_EXP_WFS_ABSTRACT = "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:Abstract"
        private const val XPATH_EXP_WFS_VERSION =
            "/wfs20:WFS_Capabilities/ows11:ServiceIdentification/ows11:ServiceTypeVersion"
        private const val XPATH_EXP_WFS_OP_GET_CAPABILITIES_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_GET_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='DescribeFeatureType']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WFS_OP_DESCRIBE_FEATURE_TYPE_POST_HREF =
            "/wfs20:WFS_Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='DescribeFeatureType']/ows11:DCP[1]/ows11:HTTP[1]/Post[1]/@xlink:href"
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
}