package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.xml.Wms130NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.slf4j.LoggerFactory
import org.w3c.dom.Document
import org.w3c.dom.Node
import javax.xml.xpath.XPathExpressionException


/**
 * @author André Wallat
 */
class Wms130CapabilitiesParser(codelistHandler: CodelistHandler) :
    GeneralCapabilitiesParser(XPathUtils(Wms130NamespaceContext()), codelistHandler), ICapabilitiesParser {

    private val versionSyslistMap = mapOf("1.1.1" to "1", "1.3.0" to "2")

    @Throws(XPathExpressionException::class)
    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        val result = CapabilitiesBean()

        // General settings
        result.serviceType = "WMS"
        result.dataServiceType = "2" // view
        result.title = xPathUtils.getString(doc, XPATH_EXP_WMS_1_3_0_TITLE)
        result.description = xPathUtils.getString(doc, XPATH_EXP_WMS_1_3_0_ABSTRACT)
        result.versions = getVersions(doc)
        result.fees = getKeyValueForPath(doc, XPATH_EXP_WMS_FEES, "6500")
        result.accessConstraints = mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WMS_ACCESS_CONSTRAINTS))
        result.onlineResources = getOnlineResources(doc, XPATH_EXP_WMS_ONLINE_RESOURCE)
        addExtendedCapabilities(result, doc, XPATH_EXP_WMS_EXTENDED_CAPABILITIES)
        result.keywords.addAll(getMoreKeywords(doc))

        // get bounding boxes of each layer and create a union
        val boundingBoxesFromLayers = getBoundingBoxesFromLayers(doc)
        var unionOfBoundingBoxes: LocationBean? = null
        if (!boundingBoxesFromLayers.isEmpty()) {
            unionOfBoundingBoxes = getUnionOfBoundingBoxes(boundingBoxesFromLayers)
//            TODO: if (catalogService.getCatalogData().getLanguageShort().equals("de")) {
            unionOfBoundingBoxes.name = "Raumbezug von: " + result.title
//            } else {
//                unionOfBoundingBoxes.name = "spatial extent from: " + result.title
//            }
            result.boundingBoxes = listOf(unionOfBoundingBoxes)
        }

        
        result.spatialReferenceSystems = getSpatialReferenceSystems(doc, "/wms:WMS_Capabilities/wms:Capability/wms:Layer/wms:CRS")
        result.coupledResources = getCoupledResources(doc, result.spatialReferenceSystems)
        result.address = getAddress(doc)
        result.operations = getOperations(doc)
        return result
    }

    private fun getCoupledResources(doc: Document, spatialReferenceSystems: List<KeyValue>?): List<Any> {
        // Spatial Reference Systems (SRS / CRS)
        // Note: The root <Layer> element shall include a sequence of zero or more
        // CRS elements listing all CRSs that are common to all subsidiary layers.
        // see: 7.2.4.6.7 CRS (WMS Implementation Specification, page 26)

        // get all root Layer coordinate Reference Systems
        // there only can be one root layer!
        
//        val rootCRSs = convertToStringList(spatialReferenceSystems)

        // Coupled Resources
        val identifierNodes =
            xPathUtils.getNodeList(doc, "/wms:WMS_Capabilities/wms:Capability/wms:Layer//wms:Identifier")
        /* TODO: val coupledResources: MutableList<MdekDataBean?> = ArrayList<MdekDataBean?>()
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
                newDataset.setTitle(xPathUtils.getString(layerNode, "wms:Title"))
                newDataset.setGeneralDescription(xPathUtils.getString(layerNode, "wms:Abstract"))
                val keywordsFromLayer: MutableList<SNSTopic> =
                    transformKeywordListToSNSTopics(getKeywords(layerNode, "wms:KeywordList/wms:Keyword"))
                keywordsFromLayer.addAll(commonSNSTopics)
                newDataset.setThesaurusTermsTable(keywordsFromLayer)
                val boxes: MutableList<LocationBean> = ArrayList()
                val box = getBoundingBoxFromLayer(layerNode)
                if (box != null) boxes.add(box) else if (unionOfBoundingBoxes != null) boxes.add(unionOfBoundingBoxes)
                newDataset.setSpatialRefLocationTable(boxes)
                // get CRS from layer and merge them with the ones found in root node
                // using a set here to filter out duplicates!
                val layerCRSs: MutableSet<String?> =
                    HashSet<Any?>(convertToStringList(getSpatialReferenceSystems(layerNode)))
                layerCRSs.addAll(rootCRSs)
                val layerCRSsList: MutableList<String?> = ArrayList()
                layerCRSsList.addAll(layerCRSs)
                newDataset.setRef1SpatialSystemTable(layerCRSsList)
                coupledResources.add(newDataset)
            } else {
                coupledResources.add(coupledResource)
            }
        }*/
        return emptyList()
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
        val address = xPathUtils.getString(doc, XPATH_EXP_WMS_1_3_0_OP_GET_CAPABILITIES_HREF)
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
        getMapOpAddressList.add(xPathUtils.getString(doc, XPATH_EXP_WMS_1_3_0_OP_GET_MAP_HREF))
        getMapOp.addressList = getMapOpAddressList

        operations.add(getMapOp)

        // Operation - GetFeatureInfo - optional
        val getFeatureInfoAddress = xPathUtils.getString(doc, XPATH_EXP_WMS_1_3_0_OP_GET_FEATURE_INFO_HREF)
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

    private fun getMoreKeywords(doc: Document): Collection<String> {
        val commonKeywords: List<String> = getKeywords(doc, XPATH_EXP_WMS_KEYWORDS)
        val allKeywordsSet: MutableList<String> = getKeywords(doc, XPATH_EXP_WMS_KEYWORDS_LAYER)
        return commonKeywords + allKeywordsSet
    }

    private fun getVersions(doc: Document): List<KeyValue> {
        val versionList = getNodesContentAsList(doc, XPATH_EXP_WMS_1_3_0_VERSION)
        return mapVersionsFromCodelist("???", versionList, versionSyslistMap)
    }

    private fun convertToStringList(spatialReferenceSystems: List<SpatialReferenceSystemBean>?): List<String?> {
        return spatialReferenceSystems?.map { it.name } ?: emptyList()
    }

    private fun getAddress(doc: Document): AddressBean {
        val address = AddressBean()
        setNameInAddressBean(
            address,
            xPathUtils.getString(doc, XPATH_EXT_WMS_CONTACTINFORMATION + "/wms:ContactPersonPrimary/wms:ContactPerson")
        )
        address.organization =
            xPathUtils.getString(
                doc,
                XPATH_EXT_WMS_CONTACTINFORMATION + "/wms:ContactPersonPrimary/wms:ContactOrganization"
            )

        address.email =
            xPathUtils.getString(doc, XPATH_EXT_WMS_CONTACTINFORMATION + "/wms:ContactElectronicMailAddress")

        // try to find address in database and set the uuid if found
        // TODO: searchForAddress(address)
        address.street = xPathUtils.getString(doc, XPATH_EXT_WMS_CONTACTINFORMATION + "/wms:ContactAddress/wms:Address")
        address.city = xPathUtils.getString(doc, XPATH_EXT_WMS_CONTACTINFORMATION + "/wms:ContactAddress/wms:City")
        address.postcode =
            xPathUtils.getString(doc, XPATH_EXT_WMS_CONTACTINFORMATION + "/wms:ContactAddress/wms:PostCode")
        address.country =
            xPathUtils.getString(doc, XPATH_EXT_WMS_CONTACTINFORMATION + "/wms:ContactAddress/wms:Country")
        address.state =
            xPathUtils.getString(doc, XPATH_EXT_WMS_CONTACTINFORMATION + "/wms:ContactAddress/wms:StateOrProvince")
        address.phone = xPathUtils.getString(doc, XPATH_EXT_WMS_CONTACTINFORMATION + "/wms:ContactVoiceTelephone")
        return address
    }

    private fun getBoundingBoxFromLayer(layerNode: Node): LocationBean? {
        var box: LocationBean? = null

        // check for existing node, since it is not required
        // see: https://dev.informationgrid.eu/redmine/issues/867
        if (!xPathUtils.nodeExists(layerNode, "wms:EX_GeographicBoundingBox")) {
            return box
        }
        val west = xPathUtils.getDouble(layerNode, "wms:EX_GeographicBoundingBox/wms:westBoundLongitude")
        val east = xPathUtils.getDouble(layerNode, "wms:EX_GeographicBoundingBox/wms:eastBoundLongitude")
        val south = xPathUtils.getDouble(layerNode, "wms:EX_GeographicBoundingBox/wms:southBoundLatitude")
        val north = xPathUtils.getDouble(layerNode, "wms:EX_GeographicBoundingBox/wms:northBoundLatitude")
        box = LocationBean()
        box.latitude1 = west
        box.longitude1 = south
        box.latitude2 = east
        box.longitude2 = north

        // add a fallback for the name, since it's mandatory
        var name = xPathUtils.getString(layerNode, "wms:Name")
        if (name == null) name = xPathUtils.getString(layerNode, "wms:Title")
        if (name == null) name = "UNKNOWN"
        box.name = name
        // shall be a free spatial reference, but needs an ID to check for duplications!
//        box.topicId = (box.name)
        box.type = "frei"
        return box
    }

    /**
     * @param doc
     * @return
     */
    private fun getBoundingBoxesFromLayers(doc: Document): List<LocationBean> {
        val bboxes: MutableList<LocationBean> = ArrayList()
        val layers = xPathUtils.getNodeList(doc, "/wms:WMS_Capabilities/wms:Capability/wms:Layer/wms:Layer")
        for (i in 0 until layers.length) {
            val layer = layers.item(i)
            val box = getBoundingBoxFromLayer(layer)
            if (box != null) bboxes.add(box)
        }
        return bboxes
    }
    
    companion object {
        private val log = LoggerFactory.getLogger(Wms130CapabilitiesParser::class.java)

        // Version 1.3.0 of the WMS uses 'WMS_Capabilities' as its root element (OGC 06-042, Chapter 7.2.4.1)
        private const val XPATH_EXP_WMS_1_3_0_TITLE = "/wms:WMS_Capabilities/wms:Service[1]/wms:Title[1]"
        private const val XPATH_EXP_WMS_1_3_0_ABSTRACT = "/wms:WMS_Capabilities/wms:Service[1]/wms:Abstract[1]"
        private const val XPATH_EXP_WMS_1_3_0_VERSION = "/wms:WMS_Capabilities/@version"
        private const val XPATH_EXP_WMS_1_3_0_OP_GET_CAPABILITIES_HREF =
            "/wms:WMS_Capabilities/wms:Capability[1]/wms:Request[1]/wms:GetCapabilities[1]/wms:DCPType[1]/wms:HTTP[1]/wms:Get[1]/wms:OnlineResource[1]/@xlink:href"
        private const val XPATH_EXP_WMS_1_3_0_OP_GET_MAP_HREF =
            "/wms:WMS_Capabilities/wms:Capability[1]/wms:Request[1]/wms:GetMap[1]/wms:DCPType[1]/wms:HTTP[1]/wms:Get[1]/wms:OnlineResource[1]/@xlink:href"
        private const val XPATH_EXP_WMS_1_3_0_OP_GET_FEATURE_INFO_HREF =
            "/wms:WMS_Capabilities/wms:Capability[1]/wms:Request[1]/wms:GetFeatureInfo[1]/wms:DCPType[1]/wms:HTTP[1]/wms:Get[1]/wms:OnlineResource[1]/@xlink:href"
        private const val XPATH_EXP_WMS_FEES = "/wms:WMS_Capabilities/wms:Service/wms:Fees"
        private const val XPATH_EXP_WMS_ACCESS_CONSTRAINTS = "/wms:WMS_Capabilities/wms:Service/wms:AccessConstraints"
        private const val XPATH_EXP_WMS_ONLINE_RESOURCE = "/wms:WMS_Capabilities/wms:Service/wms:OnlineResource"
        private const val XPATH_EXP_WMS_KEYWORDS_LAYER =
            "/wms:WMS_Capabilities/wms:Capability/wms:Layer//wms:KeywordList/wms:Keyword"
        private const val XPATH_EXT_WMS_CONTACTINFORMATION = "/wms:WMS_Capabilities/wms:Service/wms:ContactInformation"
        private const val XPATH_EXP_WMS_KEYWORDS = "/wms:WMS_Capabilities/wms:Service/wms:KeywordList/wms:Keyword"
        private const val XPATH_EXP_WMS_EXTENDED_CAPABILITIES =
            "/wms:WMS_Capabilities/wms:Capability/inspire_vs:ExtendedCapabilities"
    }
}