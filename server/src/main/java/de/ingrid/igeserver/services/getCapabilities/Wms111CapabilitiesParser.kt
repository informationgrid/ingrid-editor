package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.xml.Wms130NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document
import org.w3c.dom.Node


/**
 * @author André Wallat
 */
class Wms111CapabilitiesParser(codelistHandler: CodelistHandler) :
    GeneralCapabilitiesParser(XPathUtils(Wms130NamespaceContext()), codelistHandler), ICapabilitiesParser {

    private val versionSyslistMap = mapOf("1.1.1" to "1", "1.3.0" to "2")

    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        return CapabilitiesBean().apply {

            // General settings
            serviceType = "WMS"
            dataServiceType = "2" // view
            title = xPathUtils.getString(doc, XPATH_EXP_WMS_1_1_1_TITLE)
            description = xPathUtils.getString(doc, XPATH_EXP_WMS_1_1_1_ABSTRACT)
            val versionList = getNodesContentAsList(doc, XPATH_EXP_WMS_1_1_1_VERSION)
            versions = mapVersionsFromCodelist("5152", versionList, versionSyslistMap)
            fees = getKeyValueForPath(doc, XPATH_EXP_WMS_FEES, "6500")
            accessConstraints =
                mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WMS_ACCESS_CONSTRAINTS))
            onlineResources =
                getOnlineResources(doc, XPATH_EXP_WMS_ONLINE_RESOURCE)
            val commonKeywords: List<String> = getKeywords(doc, XPATH_EXP_WMS_KEYWORDS)
            val allKeywordsSet: List<String> = getKeywords(doc, XPATH_EXP_WMS_KEYWORDS_LAYER).toList()
            keywords.addAll(commonKeywords + allKeywordsSet)
            val boundingBoxesFromLayers = emptyList<LocationBean>() // getBoundingBoxesFromLayers(doc)
            var unionOfBoundingBoxes: LocationBean?
            if (boundingBoxesFromLayers.isNotEmpty()) {
                unionOfBoundingBoxes = getUnionOfBoundingBoxes(boundingBoxesFromLayers)
//            if (catalogService.getCatalogData().getLanguageShort().equals("de")) {
                unionOfBoundingBoxes.name = "Raumbezug von: " + title
//            } else {
//                unionOfBoundingBoxes.name = "spatial extent from: " + title
//            }
                boundingBoxes = listOf(unionOfBoundingBoxes)
            }

            // Coupled Resources
            /* TODO: val identifierNodes = xPathUtils.getNodeList(doc, "/WMT_MS_Capabilities/Capability/Layer//Identifier")
        val coupledResources: MutableList<MdekDataBean?> = ArrayList<MdekDataBean?>()
        val commonSNSTopics: List<SNSTopic> = transformKeywordListToSNSTopics(commonKeywords)
        for (i in 0 until identifierNodes.length) {
            val id = identifierNodes.item(i).textContent
            // check for the found IDs if a metadata with this resource identifier exists
            val coupledResource: MdekDataBean = checkForCoupledResource(id)
            // the dataset does not exist yet
            if (coupledResource == null) {
                val newDataset = MdekDataBean()
                val layerNode = xPathUtils.getNode(identifierNodes.item(i), "..")
                newDataset.setUuid(null)
                newDataset.setRef1ObjectIdentifier(id)
                newDataset.setTitle(xPathUtils.getString(layerNode, "Title"))
                val keywordsFromLayer: MutableList<SNSTopic> =
                    transformKeywordListToSNSTopics(getKeywords(layerNode, "KeywordList/Keyword"))
                keywordsFromLayer.addAll(commonSNSTopics)
                newDataset.setThesaurusTermsTable(keywordsFromLayer)
                val boxes: MutableList<LocationBean> = ArrayList()
                val box = getBoundingBoxFromLayer(layerNode)
                if (box != null) boxes.add(box) else if (unionOfBoundingBoxes != null) boxes.add(unionOfBoundingBoxes)
                newDataset.setSpatialRefLocationTable(boxes)
                coupledResources.add(newDataset)
            } else {
                coupledResources.add(coupledResource)
            }
        }
        setCoupledResources(coupledResources)*/

            // Spatial Reference Systems (SRS / CRS)
            // Note: The root <Layer> element shall include a sequence of zero or more
            // CRS elements listing all CRSs that are common to all subsidiary layers.
            // see: 7.2.4.6.7 CRS (WMS Implementation Specification, page 26)

            // get all root Layer coordinate Reference Systems
            // there only can be one root layer!
            spatialReferenceSystems = getSpatialReferenceSystems(doc, XPATH_EXP_WMS_LAYER_CRS)

            // get contact information
            address = getAddress(doc)


            // Conformity
            // setConformities(mapToConformityBeans(doc, XPATH_EXP_CSW_CONFORMITY));

            operations = getOperations(doc)
        }
    }

    private fun getOperations(doc: Document): List<OperationBean> {

        // Operation List
        val operations: MutableList<OperationBean> = ArrayList()

        // Operation - GetCapabilities
        val getCapabilitiesOp = OperationBean()
        getCapabilitiesOp.name = "GetCapabilities"
        getCapabilitiesOp.methodCall = "GetCapabilities"
        val getCapabilitiesOpPlatform: MutableList<Int> = ArrayList()
        getCapabilitiesOpPlatform.add(ID_OP_PLATFORM_HTTP_GET)
        getCapabilitiesOp.platform = getCapabilitiesOpPlatform
        val getCapabilitiesOpAddressList: MutableList<String> = ArrayList()
        val address =
            xPathUtils.getString(doc, XPATH_EXP_WMS_1_1_1_OP_GET_CAPABILITIES_HREF)
        getCapabilitiesOpAddressList.add(address)
        getCapabilitiesOp.addressList = getCapabilitiesOpAddressList

        operations.add(getCapabilitiesOp)

        // Operation - GetMap
        val getMapOp = OperationBean()
        getMapOp.name = "GetMap"
        getMapOp.methodCall = "GetMap"
        val getMapOpPlatform: MutableList<Int> = ArrayList()
        getMapOpPlatform.add(ID_OP_PLATFORM_HTTP_GET)
        getMapOp.platform = getMapOpPlatform
        val getMapOpAddressList: MutableList<String> = ArrayList()
        getMapOpAddressList.add(
            xPathUtils.getString(
                doc,
                XPATH_EXP_WMS_1_1_1_OP_GET_MAP_HREF
            )
        )
        getMapOp.addressList = getMapOpAddressList

        operations.add(getMapOp)

        // Operation - GetFeatureInfo - optional
        val getFeatureInfoAddress =
            xPathUtils.getString(doc, XPATH_EXP_WMS_1_1_1_OP_GET_FEATURE_INFO_HREF)
        if (getFeatureInfoAddress != null && getFeatureInfoAddress.length != 0) {
            val getFeatureInfoOp = OperationBean()
            getFeatureInfoOp.name = "GetFeatureInfo"
            getFeatureInfoOp.methodCall = "GetFeatureInfo"
            val getFeatureInfoOpPlatform: MutableList<Int> = ArrayList()
            getFeatureInfoOpPlatform.add(ID_OP_PLATFORM_HTTP_GET)
            getFeatureInfoOp.platform = getFeatureInfoOpPlatform
            val getFeatureInfoOpAddressList: MutableList<String> = ArrayList()
            getFeatureInfoOpAddressList.add(getFeatureInfoAddress)
            getFeatureInfoOp.addressList = getFeatureInfoOpAddressList

            operations.add(getFeatureInfoOp)
        }
        return operations
    }

    private fun getAddress(doc: Document): AddressBean {
        val address = AddressBean()
        setNameInAddressBean(
            address,
            xPathUtils.getString(
                doc,
                XPATH_EXT_WMS_CONTACTINFORMATION + "/ContactPersonPrimary/ContactPerson"
            )
        )
        address.organization = xPathUtils.getString(
            doc,
            XPATH_EXT_WMS_CONTACTINFORMATION + "/ContactPersonPrimary/ContactOrganization"
        )

        address.email = xPathUtils.getString(
            doc,
            XPATH_EXT_WMS_CONTACTINFORMATION + "/ContactElectronicMailAddress"
        )

        // try to find address in database and set the uuid if found
//        searchForAddress(address)
        address.street = xPathUtils.getString(
            doc,
            XPATH_EXT_WMS_CONTACTINFORMATION + "/ContactAddress/Address"
        )
        address.city = xPathUtils.getString(
            doc,
            XPATH_EXT_WMS_CONTACTINFORMATION + "/ContactAddress/City"
        )
        address.postcode = xPathUtils.getString(
            doc,
            XPATH_EXT_WMS_CONTACTINFORMATION + "/ContactAddress/PostCode"
        )
        address.country = xPathUtils.getString(
            doc,
            XPATH_EXT_WMS_CONTACTINFORMATION + "/ContactAddress/Country"
        )
        address.state = xPathUtils.getString(
            doc,
            XPATH_EXT_WMS_CONTACTINFORMATION + "/ContactAddress/StateOrProvince"
        )
        address.phone = xPathUtils.getString(
            doc,
            XPATH_EXT_WMS_CONTACTINFORMATION + "/ContactVoiceTelephone"
        )
        return address
    }

// TODO:
/*
    private fun getBoundingBoxesFromLayers(doc: Document): List<LocationBean> {
        val bboxes: MutableList<LocationBean> = ArrayList()
        val coordUtils: CoordTransformUtil = CoordTransformUtil.getInstance()
        val layers = xPathUtils.getNodeList(doc, "/WMT_MS_Capabilities/Capability/Layer/Layer")
        for (i in 0 until layers.length) {
            val layer = layers.item(i)

            // iterate over bounding boxes until it could be transformed to WGS84
            val boundingBoxesNodes = xPathUtils.getNodeList(layer, "BoundingBox")
            for (j in 0 until boundingBoxesNodes.length) {
                val bboxNode = boundingBoxesNodes.item(j)
                var box: LocationBean? = null
                val coordType: CoordType? = getCoordType(bboxNode, coordUtils)
                var coordinates: DoubleArray? = null
                coordinates = if (coordType == null) {
                    // if coordinate type could not be determined, then try the next available
                    // bounding box of the layer, which should use a different CRS
                    continue
//                } else if (coordType.equals(CoordTransformUtil.CoordType.COORDS_WGS84)) {
//                    getBoundingBoxCoordinates(bboxNode)
                } else { // TRANSFORM
                    getBoundingBoxCoordinates(bboxNode, coordUtils, coordType)
                }
                if (coordinates != null) {
                    box = LocationBean()
                    box.latitude1 = coordinates[1]
                    box.longitude1 = coordinates[0]
                    box.latitude2 = coordinates[3]
                    box.longitude2 = coordinates[2]

                    // add a fallback for the name, since it's mandatory
                    var name = xPathUtils.getString(layer, "wms:Name")
                    if (name == null) name = xPathUtils.getString(layer, "wms:Title")
                    if (name == null) name = "UNKNOWN"
                    box.name = name
                    // shall be a free spatial reference, but needs an ID to check for duplications!
//                    box.setTopicId(box.name)
                    box.type = "frei"
                    bboxes.add(box)
                    // go to next layer!
                    break
                }
            }
        }
        return bboxes
    }
*/

/*
    private fun getBoundingBoxCoordinates(
        bboxNode: Node,
        coordUtils: CoordTransformUtil,
        coordType: CoordType
    ): DoubleArray? {
        var coordsTrans: DoubleArray? = DoubleArray(4)
        val coords = getBoundingBoxCoordinates(bboxNode)
        try {
            val transMin: DoubleArray = coordUtils.transformToWGS84(coords[0], coords[1], coordType)
            val transMax: DoubleArray = coordUtils.transformToWGS84(coords[2], coords[3], coordType)
            coordsTrans!![0] = transMin[0]
            coordsTrans[1] = transMin[1]
            coordsTrans[2] = transMax[0]
            coordsTrans[3] = transMax[1]
        } catch (e: Exception) {
            coordsTrans = null
            e.printStackTrace()
        }
        return coordsTrans
    }
*/

    /**
     * @param bboxNode
     * @return
     */
    private fun getBoundingBoxCoordinates(bboxNode: Node): DoubleArray {
        val coords = DoubleArray(4)
        coords[0] = xPathUtils.getDouble(bboxNode, "@minx")
        coords[1] = xPathUtils.getDouble(bboxNode, "@miny")
        coords[2] = xPathUtils.getDouble(bboxNode, "@maxx")
        coords[3] = xPathUtils.getDouble(bboxNode, "@maxy")
        return coords
    }

    /*private fun getCoordType(bboxNode: Node, coordUtils: CoordTransformUtil): CoordType? {
        val crs = xPathUtils.getString(bboxNode, "@CRS")
        var coordType: CoordType? = null
        if (crs != null) {
            val code = crs.split(":".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()[1]
            coordType = coordUtils.getCoordTypeByEPSGCode(code)
        }
        return coordType
    }*/


/*
    private fun getBoundingBoxFromLayer(layerNode: Node): LocationBean? {
        var box: LocationBean? = null
        val coordUtils: CoordTransformUtil = CoordTransformUtil.getInstance()

        // iterate over bounding boxes until it could be transformed to WGS84
        val boundingBoxesNodes = xPathUtils.getNodeList(layerNode, "BoundingBox")
        for (j in 0 until boundingBoxesNodes.length) {
            val bboxNode = boundingBoxesNodes.item(j)
            val coordType: CoordType? = getCoordType(bboxNode, coordUtils)
            var coordinates: DoubleArray? = null
            coordinates = if (coordType == null) {
                // if coordinate type could not be determined, then try the next available
                // bounding box of the layer, which should use a different CRS
                continue
            } else if (coordType.equals(CoordTransformUtil.CoordType.COORDS_WGS84)) {
                getBoundingBoxCoordinates(bboxNode)
            } else { // TRANSFORM
                getBoundingBoxCoordinates(bboxNode, coordUtils, coordType)
            }
            if (coordinates != null) {
                box = LocationBean()
                box.latitude1 = coordinates[1]
                box.longitude1 = coordinates[0]
                box.latitude2 = coordinates[3]
                box.longitude2 = coordinates[2]
                box.name = xPathUtils.getString(layerNode, "Name")
                box.setTopicId(box.name)
                box.type = "F"

                // finished!
                break
            }
        }
        return box
    }
*/

    companion object {
        /**
         *
         */
        // Version 1.3.0 of the WMS uses 'WMS_Capabilities' as its root element (OGC 06-042, Chapter 7.2.4.1)
        // Version 1.1.1 uses 'WMT_MS_Capabilities'
        private const val XPATH_EXP_WMS_1_1_1_TITLE = "/WMT_MS_Capabilities/Service[1]/Title[1]"
        private const val XPATH_EXP_WMS_1_1_1_ABSTRACT = "/WMT_MS_Capabilities/Service[1]/Abstract[1]"
        private const val XPATH_EXP_WMS_1_1_1_VERSION = "/WMT_MS_Capabilities/@version"
        private const val XPATH_EXP_WMS_1_1_1_OP_GET_CAPABILITIES_HREF =
            "/WMT_MS_Capabilities/Capability[1]/Request[1]/GetCapabilities[1]/DCPType[1]/HTTP[1]/Get[1]/OnlineResource[1]/@xlink:href"
        private const val XPATH_EXP_WMS_1_1_1_OP_GET_MAP_HREF =
            "/WMT_MS_Capabilities/Capability[1]/Request[1]/GetMap[1]/DCPType[1]/HTTP[1]/Get[1]/OnlineResource[1]/@xlink:href"
        private const val XPATH_EXP_WMS_1_1_1_OP_GET_FEATURE_INFO_HREF =
            "/WMT_MS_Capabilities/Capability[1]/Request[1]/GetFeatureInfo[1]/DCPType[1]/HTTP[1]/Get[1]/OnlineResource[1]/@xlink:href"
        private const val XPATH_EXP_WMS_FEES = "WMT_MS_Capabilities/Service/Fees"
        private const val XPATH_EXP_WMS_ACCESS_CONSTRAINTS = "/WMT_MS_Capabilities/Service/AccessConstraints"
        private const val XPATH_EXP_WMS_ONLINE_RESOURCE = "/WMT_MS_Capabilities/Service/OnlineResource"
        private const val XPATH_EXP_WMS_KEYWORDS_LAYER =
            "/WMT_MS_Capabilities/Capability/Layer/Layer/Layer/KeywordList/Keyword"
        private const val XPATH_EXT_WMS_CONTACTINFORMATION = "/WMT_MS_Capabilities/Service/ContactInformation"
        private const val XPATH_EXP_WMS_LAYER_CRS = "/WMT_MS_Capabilities/Capability/Layer/Layer/SRS"
        private const val XPATH_EXP_WMS_KEYWORDS = "/WMT_MS_Capabilities/Service/KeywordList/Keyword"
    }
}