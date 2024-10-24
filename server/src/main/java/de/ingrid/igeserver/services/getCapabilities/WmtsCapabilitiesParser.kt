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
import de.ingrid.utils.xml.WmtsNamespaceContext
import de.ingrid.utils.xpath.XPathUtils
import org.w3c.dom.Document

class WmtsCapabilitiesParser(
    codelistHandler: CodelistHandler,
    private val researchService: ResearchService,
    catalogId: String,
) :
    GeneralCapabilitiesParser(XPathUtils(WmtsNamespaceContext()), codelistHandler, catalogId), ICapabilitiesParser {

    private val versionSyslistMap = mapOf("1.0.0" to "3")

    override fun getCapabilitiesData(doc: Document): CapabilitiesBean {
        return CapabilitiesBean().apply {
            serviceType = "WMTS"
            dataServiceType = "2" // Darstellungsdienst
            title = xPathUtils.getString(doc, XPATH_EXP_WMTS_TITLE)
            description = xPathUtils.getString(doc, XPATH_EXP_WMTS_ABSTRACT)
            val versionList = getNodesContentAsList(doc, XPATH_EXP_WMTS_VERSION)
            versions = mapVersionsFromCodelist("5152", versionList, versionSyslistMap)
            fees = getKeyValueForPath(doc, XPATH_EXP_WMTS_FEES, "6500")
            accessConstraints =
                mapValuesFromCodelist("6010", getNodesContentAsList(doc, XPATH_EXP_WMTS_ACCESS_CONSTRAINTS))

            // TODO: Resource Locator / Type
            // ...

            keywords = getKeywords(doc, XPATH_EXP_WMTS_KEYWORDS).toMutableList()
            address = getAddress(doc)
            boundingBoxes = getBoundingBoxesFromLayers(doc)
            spatialReferenceSystems =
                getSpatialReferenceSystems(
                    doc,
                    "/wmts:Capabilities/wmts:Contents/wmts:TileMatrixSet/ows11:SupportedCRS",
                )
            operations = getOperations(doc)
        }
    }

    private fun getOperations(doc: Document): List<OperationBean> {
        val operations: MutableList<OperationBean> = ArrayList()
        val getCapabilitiesOp = mapToOperationBean(
            doc,
            arrayOf(
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_GET_HREF1,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_GET_HREF2,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_GET_HREF3,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_POST_HREF1,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_POST_HREF2,
                XPATH_EXP_WMTS_OP_GET_CAPABILITIES_POST_HREF3,
            ),
            arrayOf(
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_GET,
                ID_OP_PLATFORM_HTTP_POST,
                ID_OP_PLATFORM_HTTP_POST,
                ID_OP_PLATFORM_HTTP_POST,
            ),
        )
        if (!getCapabilitiesOp.addressList!!.isEmpty()) {
            getCapabilitiesOp.name = KeyValue(
                codelistHandler.getCodeListEntryId("5110", "GetCapabilities", "de"),
                "GetCapabilities",
            )
            // do not set method call so that it doesn't appear in ISO (#3651)
            // getCapabilitiesOp.setMethodCall("GetCapabilities");
            operations.add(getCapabilitiesOp)
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


        operations.add(getFeatureInfoOp);
    }*/
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
                XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:IndividualName",
            ),
        )
        address.email = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:ElectronicMailAddress",
        )

        // try to find address in database and set the uuid if found
        searchForAddress(researchService, catalogId, address)

        address.street = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:DeliveryPoint",
        )
        address.city = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:City",
        )
        address.postcode = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:PostalCode",
        )
        address.country = getKeyValue(
            "6200",
            xPathUtils.getString(
                doc,
                XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:Country",
            ),
        )
        address.state = getKeyValue(
            "6250",
            xPathUtils.getString(
                doc,
                XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Address/ows11:AdministrativeArea",
            ),
            "name",
        )
        address.phone = xPathUtils.getString(
            doc,
            XPATH_EXT_WMTS_SERVICECONTACT + "/ows11:ContactInfo/ows11:Phone/ows11:Voice",
        )
        return address
    }

    private fun getBoundingBoxesFromLayers(doc: Document): List<LocationBean> {
        val bboxes: MutableList<LocationBean> = ArrayList()
        val layers = xPathUtils.getNodeList(doc, "/wmts:Capabilities/wmts:Contents/wmts:Layer") ?: return emptyList()
        for (i in 0 until layers.length) {
            val layer = layers.item(i)
            val boundingBoxNode = xPathUtils.getNode(layer, "ows11:WGS84BoundingBox")
            val title = xPathUtils.getString(layer, "ows11:Title")
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
