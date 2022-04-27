@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
@import gg.jte.support.ForSupport
@import java.time.format.DateTimeFormatter

@param UVPModel page

{
    "iPlugId": "/ingrid-group:ige-ng",
    "dataSourceName": "IPlug IGE-NG wemove",
    "title": "${page.getTitle()}",
    "summary": "${page.getData().getDescription()}",
    "x1": [${page.getSpatial("lat1")}],
    "x2": [${page.getSpatial("lon1")}],
    "y1": [${page.getSpatial("lat2")}],
    "y2": [${page.getSpatial("lon2")}],
    "uvp_address": [
        "${page.getUvpAddressAsString()}"
    ],
    "location": ["${page.getSpatialTitle()}"],
    "created": "${page.get_created().format(DateTimeFormatter.ISO_ZONED_DATE_TIME)}",
    "modified": "${page.get_modified().format(DateTimeFormatter.ISO_ZONED_DATE_TIME)}",
    "content": [],
    "areaid": [],
    "partner": [
        "bund"
    ],
    "provider": [
        "bu_kug"
    ],
    "datatype": [
        "default",
        "dsc_ecs",
        "metadata",
        "IDF_1.0"
    ],
    "isfolder": "false",
    "lang": "de",
    "boost": 1,
    "children.object_node.obj_uuid": [],
    "organisation": "",
    "parent.object_node.obj_uuid": "",
    "t012_obj_adr.adr_id": "2B83F58E-60C2-11D6-884A-0000F4ABB4D8",
    "t012_obj_adr.line": "1",
    "t012_obj_adr.mod_time": "",
    "t012_obj_adr.special_name": "Ansprechpartner",
    "t012_obj_adr.special_ref": "505",
    "t012_obj_adr.typ": "7",
    <%--"t01_object.create_time": "${page.get_created()}",--%>
    <%--"t01_object.loc_descr": "Hallo",--%>
    "t01_object.mod_time": "${page.modifiedAsString()}",
    <%--"t01_object.mod_uuid": "FE8EDBF8-AC98-48AD-849F-8DC35D177481",--%>
    "t01_object.obj_class": "${page.getDocumentType()}",
    "t01_object.obj_id": "${page.getUuid()}",
    <%--"t01_object.responsible_uuid": "FE8EDBF8-AC98-48AD-849F-8DC35D177481",--%>
    @for(var entry : ForSupport.of(page.getPointOfContact().getContact()))
        "t021_communication.comm_type": "${entry.get().getType().getValue()}",
        "t021_communication.comm_value": "${entry.get().getConnection()}",
        "t021_communication.commtype_key": "${entry.get().getType().getKey()}",
        "t021_communication.descr": "",
        "t021_communication.line": "${entry.getIndex() + 1}",
    @endfor
    "t02_address.address_key": "2",
    "t02_address.address_value": "${page.getPointOfContact().getTitle()}",
    "t02_address.adr_id": "${page.getPointOfContact().getUuid()}",
    "t02_address.city": "${page.getPointOfContact().getAddress().getCity()}",
    "t02_address.country_code": "Deutschland",
    "t02_address.country_key": "276",
    "t02_address.create_time": "20130704155455348",
    "t02_address.descr": "",
    "t02_address.firstname": "${page.getPointOfContact().getFirstName()}",
    "t02_address.lastname": "${page.getPointOfContact().getLastName()}",
    "t02_address.institution": "",
    "t02_address.job": "",
    "t02_address.mod_time": "",
    "t02_address.mod_uuid": "",
    "t02_address.org_adr_id": "",
    "t02_address.postbox": "14 25",
    "t02_address.postbox_pc": "D-31564",
    "t02_address.postcode": "D-31582",
    "t02_address.responsible_uuid": "FE8EDBF8-AC98-48AD-849F-8DC35D177481",
    "t02_address.street": "${page.getPointOfContact().getAddress().getStreet()}",
    "t02_address.title": "",
    "t02_address.title_key": "",
    "t02_address.typ": "2",
    "t03_catalogue.cat_name": "IGE-NG uvp",
    "t03_catalogue.cat_namespace": "http://portalu.de/igc_testNS#",
    "t03_catalogue.cat_uuid": "",
    "t03_catalogue.country_code": "Deutschland",
    "t03_catalogue.country_key": "276",
    "t03_catalogue.expiry_duration": "100",
    "t03_catalogue.language_code": "Deutsch",
    "t03_catalogue.language_key": "150",
    "t03_catalogue.mod_time": "",
    "t03_catalogue.mod_uuid": ""
}