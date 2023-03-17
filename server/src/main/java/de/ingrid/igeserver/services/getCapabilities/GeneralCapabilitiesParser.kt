package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.xpath.XPathUtils
import org.apache.logging.log4j.kotlin.logger
import org.w3c.dom.Document
import org.w3c.dom.Node
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.*
import java.util.stream.Collectors

data class OperationBean(
    var addressList: List<String>? = null,
    var platform: List<Int>? = null,
    var methodCall: String? = null,
    var name: String? = null
)

data class TimeReferenceBean(var type: Int = -1, var date: Date? = null, var from: Date? = null, var to: Date? = null)
data class ConformityBean(var level: Int? = null, var specification: String? = null)
data class AddressBean(
    var firstName: String? = null,
    var lastName: String? = null,
    var email: String? = null,
    var organization: String? = null,
    var street: String? = null,
    var city: String? = null,
    var postcode: String? = null,
    var country: String? = null,
    var state: String? = null,
    var phone: String? = null,
    var postCode: String? = null,
)

data class UrlBean(var url: String? = null, var relationType: Int? = null, var relationTypeName: String? = null, var datatype: String? = null)
data class SpatialReferenceSystemBean(
    var id: Int?,
    var name: String?
)

data class LocationBean(
    var latitude1: Double? = null,
    var longitude1: Double? = null,
    var latitude2: Double? = null,
    var longitude2: Double? = null,
    var name: String? = null,
    var type: String? = null
)

class CapabilitiesBean {
    var serviceType: String? = null
    var dataServiceType: String? = null
    var title: String? = null
    var description: String? = null
    var versions: List<String>? = emptyList()
    var fees: String? = null
    var accessConstraints: List<String>? = emptyList()
    var onlineResources: List<UrlBean>? = emptyList()
    var keywords = mutableListOf<String>()
    var boundingBoxes: List<LocationBean>? = emptyList()
    var spatialReferenceSystems: List<SpatialReferenceSystemBean>? = emptyList()
    var address: AddressBean? = null
    var operations: List<OperationBean>? = emptyList()
    var resourceLocators: List<UrlBean>? = emptyList()
    var timeReference = mutableListOf<TimeReferenceBean>()
    var timeSpans = mutableListOf<TimeReferenceBean>()
    var conformities = listOf<ConformityBean>()
    var coupledResources = listOf<Any>()
}

/**
 * @author André
 */
open class GeneralCapabilitiesParser(open val xPathUtils: XPathUtils, val codelistHandler: CodelistHandler) {

    val log = logger()

    protected fun getKeywords(doc: Node?, xpath: String?): MutableList<String> {
        return xPathUtils.getStringArray(doc, xpath).toMutableList()
    }

    protected fun transformKeywordListToStrings(keywords: List<String?>): List<String> {
        val snsTopics: MutableList<String> = ArrayList()
        for (keyword in keywords) {
            val snsTopic = "???"
            snsTopics.add(snsTopic)
        }
        return snsTopics
    }

    protected fun mapToOperationBean(
        doc: Document,
        xPathsOfMethods: Array<String>,
        platformsOfMethods: Array<Int>
    ): OperationBean {
        val opBean = OperationBean()
        val methodAddresses = mutableListOf<String>()
        val methodPlatforms = mutableListOf<Int>()
        for ( i in xPathsOfMethods.indices) {
            val methodAddress = xPathUtils.getString(doc, xPathsOfMethods[i])
            if (methodAddress != null && methodAddress.isNotEmpty()) {
                methodAddresses.add(methodAddress)
                methodPlatforms.add(platformsOfMethods[i])
            }
        }
        opBean.platform = methodPlatforms
        opBean.addressList = methodAddresses
        return opBean
    }

    protected fun mapToTimeReferenceBean(doc: Document, xPath: String): TimeReferenceBean? {
        val date = xPathUtils.getString(doc, xPath)
        // determine type of date 
        val dateType = getDateType(xPath)

        if (date != null && dateType != null) {
            return TimeReferenceBean(
                dateType,
                this.getSimpleDate(date)
            )
        }

        return null
    }

    protected fun getSimpleDate(date: String): Date? {
        // add date to time reference
        val formatter = SimpleDateFormat("yyyy-MM-dd")
        var d: Date? = null
        try {
            d = formatter.parse(date)
        } catch (e: ParseException) {
            log.debug("Error on getSimpleDate", e)
        }
        return d
    }

    private fun mapToConformityBeans(doc: Document, xPath: String): List<ConformityBean> {
        val beans = mutableListOf<ConformityBean>()
        val conformityNodes = xPathUtils.getNodeList(doc, xPath)
        if (conformityNodes != null) {

            for (index in 0 until conformityNodes.length) {
                val bean = ConformityBean()
                val degree =
                    getConformityDegree(xPathUtils.getString(conformityNodes.item(index), "inspire_common:Degree"))
                bean.level = degree
                // TODO: convert title to specific language!?
                bean.specification = xPathUtils.getString(
                    conformityNodes.item(index),
                    "inspire_common:Specification/inspire_common:Title"
                )
                beans.add(bean)
            }
        }
        return beans
    }

    private fun getConformityDegree(value: String?): Int? {
        if (value == null) return null

        // set result to "not evaluated" by default!
        var confKey = 3
        if ("conformant" == value) {
            confKey = 1
        } else if ("not conformant" == value) {
            confKey = 2
        }
        return confKey
    }

    private fun getDateType(xPath: String): Int? {
        if (xPath.indexOf("DateOfPublication") != -1) return 2 else if (xPath.indexOf("DateOfCreation") != -1) return 1 else if (xPath.indexOf(
                "DateOfLastRevision"
            ) != -1
        ) return 3
        return null
    }

    /**
     * This method extracts first- and lastname from a string. Depending on if there
     * is a "," the order is reversed!
     * @param name
     * @return
     */
    protected fun extractName(name: String?): Array<String?> {
        if (name != null) {
            val splitByComma = name.trim { it <= ' ' }.split(",".toRegex()).dropLastWhile { it.isEmpty() }
                .toTypedArray()
            return if (splitByComma.size > 1) {
                arrayOf(splitByComma[1].trim { it <= ' ' }, splitByComma[0].trim { it <= ' ' })
            } else {
                val splitBySpace = name.split(" ".toRegex()).dropLastWhile { it.isEmpty() }
                    .toTypedArray()
                if (splitBySpace.size == 2) {
                    arrayOf(splitBySpace[0].trim { it <= ' ' }, splitBySpace[1].trim { it <= ' ' })
                } else if (splitBySpace.size > 2) {
                    val sub = Arrays.copyOfRange(splitBySpace, 0, splitBySpace.size - 1)
                    arrayOf(sub.joinToString(" "), splitBySpace[splitBySpace.size - 1].trim { it <= ' ' })
                    arrayOf()
                } else {
                    arrayOf("", name.trim { it <= ' ' })
                }
            }
        }
        return arrayOfNulls(0)
    }

    /**
     * Extract first and last name from name string and deploy a given
     * AddressBean with it. If no first name can be detected, use the
     * complete name string as last name
     */
    protected fun setNameInAddressBean(ab: AddressBean, name: String?): AddressBean {
        val nameParts = this.extractName(name)
        if (nameParts.isEmpty()) {
            ab.lastName = "N/A"
        } else if (nameParts.size == 1) {
            ab.lastName = nameParts[0]
        } else if (nameParts.size == 2) {
            ab.firstName = nameParts[0]?.trim()
            ab.lastName = nameParts[1]?.trim()
        }
        return ab
    }

    protected fun getNodesContentAsList(doc: Document, xPath: String): List<String> {
        val versionNodes = xPathUtils.getNodeList(doc, xPath)
        val list: MutableList<String> = ArrayList()
        if (versionNodes == null) return list
        for (i in 0 until versionNodes.length) {
            val content = versionNodes.item(i).textContent
            if (content.trim { it <= ' ' }.isNotEmpty()) {
                list.add(content)
            }
        }
        return list
    }

    protected fun mapVersionsFromCodelist(
        listId: String,
        versionList: List<String>,
        versionSyslistMap: Map<String, Int>
    ): List<String> {
        return versionList.mapNotNull {
            var value: String? = null
            val entryId = versionSyslistMap[it]
            if (entryId != null) {
                value = codelistHandler.getCodelistValue(listId, entryId.toString())
                if (value == null) {
                    log.warn("Version could not be mapped!")
                }
            }
            value
        }
    }

    // TODO: should be mapped from a special codelist which only allows certain versions (this is for IGE-NG)
    protected fun addOGCtoVersions(versions: List<String>): List<String> {
        return versions.stream()
            .map { version: String -> "OGC:WCS $version" }
            .collect(Collectors.toList())
    }

    protected fun getOnlineResources(doc: Document?, xPath: String?): List<UrlBean> {
        val urls = mutableListOf<UrlBean>()
        val orNodes = xPathUtils.getNodeList(doc, xPath)
        if (orNodes != null) {
            for (i in 0 until orNodes.length) {
                val url = UrlBean()
                val link = xPathUtils.getString(orNodes.item(i), "@xlink:href")

                // do not add link if there's none (#781)
                if (link == null || link.trim() == "") continue

                url.url = link
                val type = xPathUtils.getString(orNodes.item(i), "@xlink:type")
                if (type != null) url.datatype = type

                urls.add(url)
            }
        }
        return urls
    }

    /**
     * @param doc
     * @param xPathExtCap, the path to the extended capabilities element
     * @return
     */
    protected fun getResourceLocators(doc: Document, xPathExtCap: String): List<UrlBean> {
        val locators = mutableListOf<UrlBean>()
        val url = xPathUtils.getNodeList(doc, "$xPathExtCap/inspire_common:ResourceLocator/inspire_common:URL")
        if (url != null) {
            for (i in 0 until url.length) {
                val urlBean = UrlBean()
                val type = xPathUtils.getString(doc, xPathExtCap + "/inspire_common:ResourceType[" + (i + 1) + "]")
                urlBean.url = url.item(i).textContent
                if (type != null) {
                    urlBean.relationType = getRelationType(type)
                    urlBean.relationTypeName = codelistHandler.getCodelistValue("2000", urlBean.relationType.toString())
                } else {
                    // use previously used type!
                    if (i > 0) {
                        urlBean.relationType = locators[i - 1].relationType
                        urlBean.relationTypeName = locators[i - 1].relationTypeName
                    }
                }
                locators.add(urlBean)
            }
        }
        return locators
    }

    /**
     * @param type
     * @return
     */
    private fun getRelationType(type: String): Int {
        return if ("service" == type) 5066 else 9999 // Link to Service

        // else unspecified link
    }

    /**
     * @param bean
     * @param doc
     * @param xpathExtCap
     */
    protected fun addExtendedCapabilities(bean: CapabilitiesBean, doc: Document, xpathExtCap: String) {
        if (xPathUtils.nodeExists(doc, xpathExtCap)) {
            // Resource Locator / Type
            bean.resourceLocators = getResourceLocators(doc, xpathExtCap)
            // Spatial Data Type
            // overwrite service type if defined here
            val type = xPathUtils.getString(doc, "$xpathExtCap/inspire_common:SpatialDataServiceType")
            if (type != null) {
                val mappedType = mapServiceTypeToKey(type)
                if (mappedType != null) {
                    bean.dataServiceType = mappedType
                } else {
                    log.warn("ServiceType could not be identified from ISO-value: $type")
                }
            }

            // add Temporal References if available
            mapToTimeReferenceBean(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:DateOfCreation"
            )?.let { bean.timeReference.add(it) }
            mapToTimeReferenceBean(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:DateOfPublication"
            )?.let { bean.timeReference.add(it) }
            mapToTimeReferenceBean(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:DateOfLastRevision"
            )?.let { bean.timeReference.add(it) }

            // add Timespan if available
            val startDate = xPathUtils.getString(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:TemporalExtent/inspire_common:IntervalOfDates/inspire_common:StartingDate"
            )
            val endDate = xPathUtils.getString(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:TemporalExtent/inspire_common:IntervalOfDates/inspire_common:EndDate"
            )
            if (startDate != null || endDate != null) {
                bean.timeSpans = mutableListOf(TimeReferenceBean().apply {
                    getSimpleDate(startDate)?.let { from = it }
                    getSimpleDate(endDate)?.let { to = it }
                })
            }

            // Extended - Keywords
            val extKeywords =
                xPathUtils.getStringArray(doc, "$xpathExtCap/inspire_common:Keyword/inspire_common:KeywordValue")
            bean.keywords.addAll(extKeywords.toList())

            // Conformity
            bean.conformities = mapToConformityBeans(doc, "$xpathExtCap/inspire_common:Conformity")
        }
    }

    /**
     * @param type
     * @return
     */
    private fun mapServiceTypeToKey(type: String): String? {
        return codelistHandler.getCodelists(listOf("5100"))[0].entries
            .find { it.getField("iso") == type }
            ?.id
    }
    /**
     * Search for an existing address by equal firstname, lastname and email OR institution and email.
     * @param address
     */
    /*protected void searchForAddress( AddressBean address ) {
        String qString = "select aNode.addrUuid, addr.adrType " +
                "from AddressNode aNode " +
                "inner join aNode.t02AddressWork addr " +
                "inner join addr.t021Communications comm " +
                "where " +
                AddressType.getHQLExcludeIGEUsersViaNode("aNode", "addr") + // exclude hidden user addresses !
                " AND ((addr.lastname = '" + address.getLastname() + "'" +
                " AND addr.firstname = '" + address.getFirstname() + "' ) " +
                " OR addr.institution = '" + address.getOrganisation() + "' ) " +
                " AND comm.commtypeKey = 3 " +  // type: email
                " AND comm.commValue = '" + address.getEmail() + "'";

        IngridDocument response = connectionFacade.getMdekCallerQuery().queryHQLToMap(connectionFacade.getCurrentPlugId(), qString, null, "");
        IngridDocument result = MdekUtils.getResultFromResponse(response);
        if (result != null) {
            @SuppressWarnings("unchecked")
            List<IngridDocument> addresses = (List<IngridDocument>) result.get(MdekKeys.ADR_ENTITIES);

            // add the found uuid to the address object which marks it as found
            // if there are more than one results, then use the first one!
            if (addresses != null && !addresses.isEmpty()) {
                address.setUuid( addresses.get( 0 ).getString( "aNode.addrUuid" ) );
                address.setType( addresses.get( 0 ).getInt( "addr.adrType" ) );
            }
        }
    }*/
    /**
     * @param id
     * @return
     */
    /*protected MdekDataBean checkForCoupledResource(String id) {
        MdekDataBean resultBean = new MdekDataBean();

        String qString = "select oNode.objUuid, obj.objName, obj.objClass " +
                "from ObjectNode oNode " +
                "inner join oNode.t01ObjectWork obj " +
                "inner join obj.t011ObjGeos oGeo " +
                "where " +
                "oGeo.datasourceUuid = '" + id + "'";

        IngridDocument response = connectionFacade.getMdekCallerQuery().queryHQLToMap(connectionFacade.getCurrentPlugId(), qString, null, "");
        IngridDocument result = MdekUtils.getResultFromResponse(response);
        if (result != null) {
            @SuppressWarnings("unchecked")
            List<IngridDocument> objects = (List<IngridDocument>) result.get(MdekKeys.OBJ_ENTITIES);
            if (objects != null && !objects.isEmpty()) {
                resultBean.setRef1ObjectIdentifier( id );
                resultBean.setObjectClass( objects.get( 0 ).getInt( "obj.objClass" ) );
                resultBean.setUuid( objects.get( 0 ).getString( "oNode.objUuid" ) );
                resultBean.setTitle( objects.get( 0 ).getString( "obj.objName" ) );
                return resultBean;
            } else {
                // if no dataset was found then try another search if a namespace exists in the id
                // In this case remove the namespace search again (INGRID34-6)
                int seperatorPos = id.indexOf( '#' );
                if (seperatorPos != -1) {
                    return checkForCoupledResource( id.substring( seperatorPos + 1 ) );
                }
            }
        }

        return null;
    }*/
    companion object {

        /** ID of syslist entry "HTTPGet" in Syslist 5180  */
        @JvmStatic
        val ID_OP_PLATFORM_HTTP_GET = 7

        /** ID of syslist entry "HTTPPost" in Syslist 5180  */
        @JvmStatic
        val ID_OP_PLATFORM_HTTP_POST = 8
    }
}