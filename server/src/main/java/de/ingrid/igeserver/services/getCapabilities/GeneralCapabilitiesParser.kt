package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.utils.xpath.XPathUtils
import org.apache.logging.log4j.kotlin.logger
import org.w3c.dom.Document
import org.w3c.dom.Node
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.*
import java.util.stream.Collectors

class OperationBean {
    val addressList: String? = null
    var methodCall: String? = null
    var name: String? = null
}
data class TimeReferenceBean(val start: Date)
data class ConformityBean(val conform: Boolean)
class AddressBean {
    var email: String? = null
    var street: String? = null
    var city: String? = null
    var postcode: String? = null
    var country: String? = null
    var state: String? = null
    var phone: String? = null
    var postCode: String? = null
}
data class UrlBean(val uri: String)
class SpatialReferenceSystemBean {
    var id: Int? = null
    var name: String? = null
}
data class LocationBean(val latitude1: Double, val longitude1: Double, val latitude2: Double, val longitude2: Double, var name: String, var type: String )
class CapabilitiesBean {
    var serviceType: String? = null
    var dataServiceType: Int? = null
    var title: String? = null
    var description: String? = null
    var versions: String? = null
    var fees: String? = null
    var accessConstraints: List<String>? = null
    var onlineResources: List<UrlBean>? = null
    var keywords: MutableList<String>? = null
    var boundingBoxes: List<LocationBean>? = null
    var spatialReferenceSystems: List<SpatialReferenceSystemBean>? = null
    var address: AddressBean? = null
    var operations: List<OperationBean>? = null
}

/**
 * @author André
 */
open class GeneralCapabilitiesParser(open val xPathUtils: XPathUtils) {
    
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
        doc: Document?,
        xPathsOfMethods: Array<String?>?,
        platformsOfMethods: Array<Int?>?
    ): OperationBean {
        /*List<String> methodAddresses = new ArrayList<>();
        List<Integer> methodPlatforms = new ArrayList<>();
        for (int i=0; i < xPathsOfMethods.length; i++) {
            String methodAddress = xPathUtils.getString(doc, xPathsOfMethods[i]);
            if (methodAddress != null && methodAddress.length() != 0) {
                methodAddresses.add(methodAddress);
                methodPlatforms.add(platformsOfMethods[i]);
            }
        }
        opBean.setPlatform(methodPlatforms);
        opBean.setAddressList(methodAddresses);*/return OperationBean()
    }

    protected fun mapToTimeReferenceBean(doc: Document?, xPath: String?): TimeReferenceBean? {

        /*String date = xPathUtils.getString(doc, xPath);
        // determine type of date 
        Integer dateType = getDateType(xPath);

        if (date != null && dateType != null) {
            timeRef = new TimeReferenceBean();
            timeRef.setType(dateType);

            Date dateObj = getSimpleDate(date);
            if (dateObj != null)
                timeRef.setDate(dateObj);
        }*/return null as TimeReferenceBean?
    }

    protected fun getSimpleDate(date: String?): Date? {
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
        /*NodeList conformityNodes = xPathUtils.getNodeList(doc, xPath);
        if ( conformityNodes != null ) {
            for (int index = 0; index < conformityNodes.getLength(); ++index) {
                ConformityBean bean = new ConformityBean();
                Integer degree = getConformityDegree(xPathUtils.getString(conformityNodes.item(index), "inspire_common:Degree"));
                bean.setLevel(degree);
                // TODO: convert title to specific language!?
                bean.setSpecification(xPathUtils.getString(conformityNodes.item(index), "inspire_common:Specification/inspire_common:Title"));
                beans.add(bean);
            }
        }*/return ArrayList()
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
                    val sub =
                        Arrays.copyOfRange(splitBySpace, 0, splitBySpace.size - 1)
                    // TODO: arrayOf(String.join(" ", *sub), splitBySpace[splitBySpace.size - 1].trim { it <= ' ' })
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
        /*String[] nameParts = this.extractName(name);
        if (nameParts == null || nameParts.length == 0) {
            ab.setLastname("N/A");
        } else if (nameParts.length == 1) {
            ab.setLastname(nameParts[0]);
        } else if (nameParts.length == 2) {
            ab.setFirstname(nameParts[0].trim());
            ab.setLastname(nameParts[1].trim());
        }*/
        return ab
    }

    protected fun getNodesContentAsList(doc: Document, xPath: String): List<String> {
        val versionNodes = xPathUtils.getNodeList(doc, xPath)
        val list: MutableList<String> = ArrayList()
        if (versionNodes == null) return list
        for (i in 0 until versionNodes.length) {
            val content = versionNodes.item(i).textContent
            if (content.trim { it <= ' ' }.length > 0) {
                list.add(content)
            }
        }
        return list
    }

    protected fun mapVersionsFromCodelist(
        listId: Int?,
        versionList: List<String?>,
        versionSyslistMap: Map<String?, Int?>
    ): List<String> {
        val mappedVersionList: MutableList<String> = ArrayList()
        for (version in versionList) {
            val entryId = versionSyslistMap[version]
            if (entryId != null) {
//                value = syslistCache.getValueFromListId( listId, entryId, true );
                if (version == null) {
                    log.warn("Version could not be mapped!")
                }
            }
            if (version != null) {
                mappedVersionList.add(version)
            }
        }
        return mappedVersionList
    }

    // TODO: should be mapped from a special codelist which only allows certain versions (this is for IGE-NG)
    protected fun addOGCtoVersions(versions: List<String>): List<String> {
        return versions.stream()
            .map { version: String -> "OGC:WCS $version" }
            .collect(Collectors.toList())
    }

    protected fun getOnlineResources(doc: Document?, xPath: String?): List<UrlBean> {
        val orNodes = xPathUtils.getNodeList(doc, xPath)
        /*if (orNodes != null) {
            for (int i = 0; i < orNodes.getLength(); i++) {
                UrlBean url = new UrlBean();
                String link = xPathUtils.getString(orNodes.item(i), "@xlink:href");

                // do not add link if there's none (#781)
                if (link == null || link.trim().equals( "" )) continue;

                url.setUrl(link);
                String type = xPathUtils.getString(orNodes.item(i), "@xlink:type");
                if (type != null) url.setDatatype(type);

                urls.add(url);
            }
        }*/return ArrayList()
    }

    /**
     * @param doc
     * @param xPathExtCap, the path to the extended capabilities element
     * @return
     */
    protected fun getResourceLocators(doc: Document?, xPathExtCap: String): List<UrlBean> {
        val locators: List<UrlBean> = ArrayList()
        val url = xPathUtils.getNodeList(doc, "$xPathExtCap/inspire_common:ResourceLocator/inspire_common:URL")
        if (url != null) {
            /*for (int i = 0; i < url.getLength(); i++) {
                UrlBean urlBean = new UrlBean();
                String type = xPathUtils.getString(doc, xPathExtCap + "/inspire_common:ResourceType["+(i+1)+"]");
                urlBean.setUrl(url.item(i).getTextContent());
                if (type != null) {
                    urlBean.setRelationType(getRelationType(type));
                    urlBean.setRelationTypeName(syslistCache.getValueFromListId(2000, urlBean.getRelationType(), false));
                } else {
                    // use previously used type!
                    if (i > 0) {
                        urlBean.setRelationType(locators.get(i-1).getRelationType());
                        urlBean.setRelationTypeName(locators.get(i-1).getRelationTypeName());
                    }
                }
                locators.add(urlBean);
            }*/
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
    protected fun addExtendedCapabilities(bean: CapabilitiesBean?, doc: Document?, xpathExtCap: String?) {
        if (xPathUtils.nodeExists(doc, xpathExtCap)) {
            // Resource Locator / Type
            /*bean.setResourceLocators(getResourceLocators(doc, xpathExtCap));
            // Spatial Data Type
            // overwrite service type if defined here
            String type = xPathUtils.getString(doc, xpathExtCap + "/inspire_common:SpatialDataServiceType");
            if (type != null) {
                Integer mappedType = mapServiceTypeToKey(type);
                if (mappedType != null) {
                    bean.setDataServiceType(mappedType);
                } else {
                    log.warn("ServiceType could not be identified from ISO-value: " + type);
                }
            }

            // add Temporal References if available
            bean.addTimeReference(mapToTimeReferenceBean(doc, xpathExtCap + "/inspire_common:TemporalReference/inspire_common:DateOfCreation"));
            bean.addTimeReference(mapToTimeReferenceBean(doc, xpathExtCap + "/inspire_common:TemporalReference/inspire_common:DateOfPublication"));
            bean.addTimeReference(mapToTimeReferenceBean(doc, xpathExtCap + "/inspire_common:TemporalReference/inspire_common:DateOfLastRevision"));

            // add Timespan if available
            String startDate = xPathUtils.getString(doc, xpathExtCap + "/inspire_common:TemporalReference/inspire_common:TemporalExtent/inspire_common:IntervalOfDates/inspire_common:StartingDate");
            String endDate = xPathUtils.getString(doc, xpathExtCap + "/inspire_common:TemporalReference/inspire_common:TemporalExtent/inspire_common:IntervalOfDates/inspire_common:EndDate");
            if ( startDate != null|| endDate != null ) {
                List<TimeReferenceBean> timeSpans = new ArrayList<>();
                TimeReferenceBean tr = new TimeReferenceBean();
                Date dateObj = getSimpleDate(startDate);
                if (dateObj != null) tr.setFrom(dateObj);
                dateObj = getSimpleDate(endDate);
                if (dateObj != null) tr.setTo(dateObj);
                timeSpans.add(tr);
                bean.setTimeSpans(timeSpans);
            }

            // Extended - Keywords
            String[] extKeywords = xPathUtils.getStringArray(doc, xpathExtCap + "/inspire_common:Keyword/inspire_common:KeywordValue");
            bean.getKeywords().addAll(Arrays.asList(extKeywords));

            // Conformity
            bean.setConformities(mapToConformityBeans(doc, xpathExtCap + "/inspire_common:Conformity"));*/
        }
    }

    /**
     * @param type
     * @return
     */
    private fun mapServiceTypeToKey(type: String): Int? {
        /*List<String[]> syslists = syslistCache.getSyslistByLanguage(5100, "iso");
        if (!syslists.isEmpty()) {
            for (String[] entry : syslists) {
                if (entry[0].trim().equalsIgnoreCase(type.trim())) {
                    return Integer.valueOf(entry[1]);
                }
            }
        }*/
        return null
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