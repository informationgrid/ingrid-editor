package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.xml.Wfs110NamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

class WmtsCapabilitiesParser(codelistHandler: CodelistHandler) :
    GeneralCapabilitiesParser(XPathUtils(Wfs110NamespaceContext()), codelistHandler), ICapabilitiesParser {

    private val versionSyslistMap = mapOf("1.0.0" to "3")

    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        val result = CapabilitiesBean()

        // General settings
        result.serviceType = "WMTS"
        result.dataServiceType = "2" // Darstellungsdienst
        result.title = xPathUtils.getString(doc, XPATH_EXP_WMTS_TITLE)
        result.description = xPathUtils.getString(doc, XPATH_EXP_WMTS_ABSTRACT)
        val versionList = getNodesContentAsList(doc, XPATH_EXP_WMTS_VERSION)
        val mappedVersionList =
            mapVersionsFromCodelist("???", versionList, versionSyslistMap)
        result.versions = mappedVersionList

//        String version = versionList.get(0);

        // Fees
        result.fees = getKeyValueForPath(doc, XPATH_EXP_WMTS_FEES, "6500")

        // Access Constraints
        result.accessConstraints =
            mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WMTS_ACCESS_CONSTRAINTS))

        // TODO: Resource Locator / Type
        // ...

        result.keywords = getKeywords(doc, XPATH_EXP_WMTS_KEYWORDS).toMutableList()
        result.address = getAddress(doc)

        val operations: MutableList<OperationBean> = ArrayList()
        val boundingBoxesFromLayers = getBoundingBoxesFromLayers(doc)
        result.boundingBoxes = boundingBoxesFromLayers
        result.spatialReferenceSystems =
            getSpatialReferenceSystems(doc, "/wmts:Capabilities/wmts:Contents/wmts:TileMatrixSet/ows11:SupportedCRS")
        val getCapabilitiesOp = mapToOperationBean(
            doc, arrayOf(
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_GET_HREF1,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_GET_HREF2,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_GET_HREF3,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_POST_HREF1,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_POST_HREF2,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_POST_HREF3
            ), arrayOf(
                ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_GET, ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_POST, ID_OP_PLATFORM_HTTP_POST, ID_OP_PLATFORM_HTTP_POST
            )
        )
        if (!getCapabilitiesOp.addressList!!.isEmpty()) {
            getCapabilitiesOp.name = "GetCapabilities"
            // do not set method call so that it doesn't appear in ISO (#3651)
            // getCapabilitiesOp.setMethodCall("GetCapabilities");

            // also do not set any parameters (#3651)
            /*List<OperationParameterBean> paramList = new ArrayList<>();
            paramList.add(new OperationParameterBean("SERVICE=WMTS", "Service type", "", false, false));
            paramList.add(new OperationParameterBean("REQUEST=GetCapabilities", "Name of request", "", false, false));
            paramList.add(new OperationParameterBean("ACCEPTVERSIONS=1.0.0,0.8.3", "Comma-separated prioritized sequence of one or more specification versions accepted by client, with preferred versions listed first", "", true, false));
            paramList.add(new OperationParameterBean("SECTIONS=Contents", "Comma-separated unordered list of zero or more names of sections of service metadata document to be returned in service metadata document", "", true, false));
            paramList.add(new OperationParameterBean("UPDATESEQUENCE=XXX (where XXX is character string previously provided by server)", "Service metadata document version, value is \"increased\" whenever any change is made in complete service metadata document", "", true, false));
            paramList.add(new OperationParameterBean("ACCEPTFORMATS= text/xml", "Comma-separated prioritized sequence of zero or more response formats desired by client, with preferred formats listed first", "", true, false));
            getCapabilitiesOp.setParamList(paramList);*/operations.add(getCapabilitiesOp)
        }

        // Only import GetCapabilities - Operation (#3651)
        /*
        // Operation - GetTile
        OperationBean getTileOp = mapToOperationBean(doc,
                new String[]{
                        XPATH_EXP_WMTS_OP_GET_TILE_HREF1,
                        XPATH_EXP_WMTS_OP_GET_TILE_HREF2,
                        XPATH_EXP_WMTS_OP_GET_TILE_HREF3
                },
                new Integer[]{
                        ID_OP_PLATFORM_HTTP_GET,
                        ID_OP_PLATFORM_HTTP_GET,
                        ID_OP_PLATFORM_HTTP_GET
                });
        if (!getTileOp.getAddressList().isEmpty()) {
            getTileOp.setName("GetTile");
            getTileOp.setMethodCall("GetTile");

            List<OperationParameterBean> paramList = new ArrayList<>();
            paramList.add(new OperationParameterBean("SERVICE=WMTS", "Service type", "", false, false));
            paramList.add(new OperationParameterBean("REQUEST=GetTile", "Name of request", "", false, false));
            paramList.add(new OperationParameterBean("VERSION=1.0.0", "", "", true, false));
            paramList.add(new OperationParameterBean("Layer", "The layers available from the Online Catalogs; if more than one layer is requested they are in a comma-separated list. Available layers are advertised in the GetCapabilities response.", "", true, false));
            paramList.add(new OperationParameterBean("Style=default", "Some layers can be rendered in different ways; check the capabilities document for allowed values on a layer-by-layer basis.", "", true, false));
            paramList.add(new OperationParameterBean("Format=image/png", "The tile format to return.", "", true, false));
            paramList.add(new OperationParameterBean("TileMatrixSet=EPSG:3857", "The Tile Matrix Set to be used to generate the response", "", true, false));
            paramList.add(new OperationParameterBean("TileMatrix=EPSG:3857", "The Tile Matrix identifier of the tileMatrix in the tileMatrixSet requested that has the desired scale denominator that you want to request. 4326 is WGS84, that is, uses latitude/longitude, while 3857 provides tiles in the spherical mercator projection", "", true, false));
            paramList.add(new OperationParameterBean("TileRow=X", "The Row location of the tile in the defined tileMatrixSet. The value must be in the valid range provided in the capabilities response.", "", true, false));
            paramList.add(new OperationParameterBean("TileCol=Y", "The Column location of the tile in the defined tileMatrixSet. The value must be in the valid range provided in the capabilities response.", "", true, false));
            getTileOp.setParamList(paramList);
            operations.add(getTileOp);
        }

        // Operation - GetFeatureInfo - optional
        String getFeatureInfoAddress = xPathUtils.getString(doc,  XPATH_EXP_WMTS_OP_GET_FEATURE_INFO_HREF);
        if (getFeatureInfoAddress != null && getFeatureInfoAddress.length() != 0) {
            OperationBean getFeatureInfoOp = new OperationBean();
            getFeatureInfoOp.setName("GetFeatureInfo");
            getFeatureInfoOp.setMethodCall("GetFeatureInfo");
            List<Integer> getFeatureInfoOpPlatform = new ArrayList<>();
            getFeatureInfoOpPlatform.add(ID_OP_PLATFORM_HTTP_GET);
            getFeatureInfoOp.setPlatform(getFeatureInfoOpPlatform);
            List<String> getFeatureInfoOpAddressList = new ArrayList<>();
            getFeatureInfoOpAddressList.add(getFeatureInfoAddress);
            getFeatureInfoOp.setAddressList(getFeatureInfoOpAddressList);

            List<OperationParameterBean> paramList = new ArrayList<>();
            paramList.add(new OperationParameterBean("VERSION="+version, "Request version", "", false, false));
            paramList.add(new OperationParameterBean("REQUEST=GetFeatureInfo", "Request name", "", false, false));
            paramList.add(new OperationParameterBean("(map_request_copy)", "Partial copy of the Map request parameters that generated the map for which information is desired", "", false, false));
            paramList.add(new OperationParameterBean("QUERY_LAYERS=layer_list", "Comma-separated list of one or more layers to be queried", "", false, false));
            paramList.add(new OperationParameterBean("INFO_FORMAT=output_format", "Return format of feature information (MIME type)", "", true, false));
            paramList.add(new OperationParameterBean("FEATURE_COUNT=number", "Number of features about which to return information (default=1)", "", true, false));
            paramList.add(new OperationParameterBean("X=pixel_column", "X coordinate in pixels of feature (measured from upper left corner=0)", "", false, false));
            paramList.add(new OperationParameterBean("Y=pixel_row", "Y coordinate in pixels of feature (measured from upper left corner=0)", "", false, false));
            paramList.add(new OperationParameterBean("EXCEPTIONS=exception_format", "The format in which exceptions are to be reported by the WMS (default=application/vnd.ogc.se_xml)", "", true, false));
            paramList.add(new OperationParameterBean("Vendor-specific parameters", "Optional experimental parameters", "", true, false));

            getFeatureInfoOp.setParamList(paramList);
            operations.add(getFeatureInfoOp);
        }*/result.operations = operations
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
                XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:IndividualName"
            )
        )
        address.email = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:ElectronicMailAddress"
        )

        // try to find address in database and set the uuid if found
//        searchForAddress(address)
        address.street = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:DeliveryPoint"
        )
        address.city = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:City"
        )
        address.postcode = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:PostalCode"
        )
        address.country = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:Country"
        )
        address.state = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:AdministrativeArea"
        )
        address.phone = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Phone/ows11:Voice"
        )
        return address
    }

    private fun getBoundingBoxesFromLayers(doc: Document): List<LocationBean> {
        val bboxes: MutableList<LocationBean> = ArrayList()
        val layers = xPathUtils.getNodeList(doc, "/wmts:Capabilities/wmts:Contents/wmts:Layer")
        for (i in 0 until layers.length) {
            val layer = layers.item(i)
            val lower = xPathUtils.getString(layer, "ows11:WGS84BoundingBox/ows11:LowerCorner").split(" ".toRegex())
                .dropLastWhile { it.isEmpty() }
                .toTypedArray()
            val upper = xPathUtils.getString(layer, "ows11:WGS84BoundingBox/ows11:UpperCorner").split(" ".toRegex())
                .dropLastWhile { it.isEmpty() }
                .toTypedArray()
            val box = LocationBean()
            box.latitude1 = java.lang.Double.valueOf(lower[0])
            box.longitude1 = java.lang.Double.valueOf(lower[1])
            box.latitude2 = java.lang.Double.valueOf(upper[0])
            box.longitude2 = java.lang.Double.valueOf(upper[1])

            // add a fallback for the name, since it's mandatory
            val title = xPathUtils.getString(layer, "ows11:Title")
            box.name = title
            // shall be a free spatial reference, but needs an ID to check for duplications!
//            box.setTopicId(box.name)
            box.type = "frei"
            bboxes.add(box)
        }
        return bboxes
    }


    companion object {
        private const val XPATH_EXP_WMTS_FEES = "/wmts:Capabilities/ows11:ServiceIdentification/ows11:Fees"
        private const val XPATH_EXP_WMTS_ACCESS_CONSTRAINTS =
            "/wmts:Capabilities/ows11:ServiceIdentification/ows11:AccessConstraints"
        private const val XPATH_EXP_WMTS_KEYWORDS =
            "/wmts:Capabilities/ows11:ServiceIdentification/ows11:Keywords/ows11:Keyword"
        private const val XPATH_EXP_WMTS_TITLE = "/wmts:Capabilities/ows11:ServiceIdentification[1]/ows11:Title[1]"
        private const val XPATH_EXP_WMTS_ABSTRACT =
            "/wmts:Capabilities/ows11:ServiceIdentification[1]/ows11:Abstract[1]"
        private const val XPATH_EXP_WMTS_VERSION = "/wmts:Capabilities/@version"
        private const val XPATH_EXP_WMTS_OP_GET_CAPABILITIES_GET_HREF1 =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WMTS_OP_GET_CAPABILITIES_GET_HREF2 =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[2]/@xlink:href"
        private const val XPATH_EXP_WMTS_OP_GET_CAPABILITIES_GET_HREF3 =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[3]/@xlink:href"
        private const val XPATH_EXP_WMTS_OP_GET_CAPABILITIES_POST_HREF1 =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[1]/@xlink:href"
        private const val XPATH_EXP_WMTS_OP_GET_CAPABILITIES_POST_HREF2 =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[2]/@xlink:href"
        private const val XPATH_EXP_WMTS_OP_GET_CAPABILITIES_POST_HREF3 =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetCapabilities']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Post[3]/@xlink:href"
        private const val XPATH_EXP_WMTS_OP_GET_FEATURE_INFO_HREF =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetFeatureInfo']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WMTS_OP_GET_TILE_HREF1 =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetTile']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[1]/@xlink:href"
        private const val XPATH_EXP_WMTS_OP_GET_TILE_HREF2 =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetTile']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[2]/@xlink:href"
        private const val XPATH_EXP_WMTS_OP_GET_TILE_HREF3 =
            "/wmts:Capabilities/ows11:OperationsMetadata[1]/ows11:Operation[@name='GetTile']/ows11:DCP[1]/ows11:HTTP[1]/ows11:Get[3]/@xlink:href"
        private const val XPATH_EXT_WMTS_SERVICECONTACT =
            "/wmts:Capabilities/ows11:ServiceProvider/ows11:ServiceContact"
    }
}