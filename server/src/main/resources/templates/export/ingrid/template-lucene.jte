@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.COORD_TYPE
@import gg.jte.support.ForSupport
@import java.util.Map

@param Map<String, Object> map

!{var page = ((IngridModelTransformer)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}
!{var partner = ((String)map.get("partner"));}
!{var provider = ((String)map.get("provider"));}

{
    "iPlugId": "ige-ng_${catalog.identifier}",
    "dataSourceName": "iPlug IGE-NG (${catalog.identifier})",
    "title": "${page.getModel().getTitle()}",
    "summary": "${page.getData().getDescription()}",
    "x1": ${page.getSpatialReferenceComponents(COORD_TYPE.Lon1)},
    "x2": ${page.getSpatialReferenceComponents(COORD_TYPE.Lon2)},
    "y1": ${page.getSpatialReferenceComponents(COORD_TYPE.Lat1)},
    "y2": ${page.getSpatialReferenceComponents(COORD_TYPE.Lat2)},
    "location":  ${page.getSpatialReferenceLocationNames()},
    "created": "${page.formatDate(page.getFormatterISO(), page.getModel().get_created())}",
    "modified": "${page.formatDate(page.getFormatterISO(), page.getModel().get_modified())}",
    "areaid": [],
    "partner": [
        "${partner}"
    ],
    "provider": [
        "${provider}"
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
    "t012_obj_adr.adr_id": "",
    "t012_obj_adr.line": "1",
    "t012_obj_adr.mod_time": "",
    "t012_obj_adr.special_name": "Ansprechpartner",
    "t012_obj_adr.special_ref": "505",
    "t012_obj_adr.typ": "7",
    "t01_object.mod_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getModel().get_modified())}",
    "t01_object.obj_class": "${page.handleContent(page.getDocumentType())}",
    "t01_object.obj_id": "${page.handleContent(page.getModel().getUuid())}",
    @if(page.getPointOfContact() != null)
        @for(var entry : ForSupport.of(page.getPointOfContact().getContact()))
            "t021_communication.comm_type": "${entry.get().getType().getValue()}",
            "t021_communication.comm_value": "${page.handleContent(entry.get().getConnection())}",
            "t021_communication.commtype_key": "${entry.get().getType().getKey()}",
            "t021_communication.descr": "",
            "t021_communication.line": "${entry.getIndex() + 1}",
        @endfor
        "t02_address.address_key": "",
        "t02_address.address_value": "${page.getPointOfContact().getTitle()}",
        "t02_address.adr_id": "${page.handleContent(page.getPointOfContact().getUuid())}",
        "t02_address.city": "${page.getPointOfContact().getAddress().getCity()}",
        "t02_address.country_code": "${page.getCodelistValue("6200", page.getPointOfContact().getAddress().getCountry())}",
        "t02_address.country_key": "${page.getPointOfContact().getAddress().getCountryKey()}",
        "t02_address.create_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getPointOfContact().getCreated())}",
        "t02_address.descr": "",
        "t02_address.firstname": "${page.getPointOfContact().getFirstName()}",
        "t02_address.lastname": "${page.getPointOfContact().getLastName()}",
        "t02_address.institution": "${page.getPointOfContact().getOrganization()}",
        "t02_address.job": "",
        "t02_address.mod_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getPointOfContact().getModified())}",
        "t02_address.mod_uuid": "",
        "t02_address.org_adr_id": "",
        "t02_address.postbox": "${page.getPointOfContact().getAddress().getPoBox()}",
        "t02_address.postbox_pc": "${page.getPointOfContact().getAddress().getZipPoBox()}",
        "t02_address.postcode": "${page.getPointOfContact().getAddress().getZipCode()}",
        "t02_address.responsible_uuid": "",
        "t02_address.street": "${page.getPointOfContact().getAddress().getStreet()}",
        "t02_address.title": "",
        "t02_address.title_key": "",
        "t02_address.typ": "2",
    @endif
    "t03_catalogue.cat_name": "${catalog.name}",
    "t03_catalogue.cat_namespace": "http://portalu.de/igc_testNS#",
    "t03_catalogue.cat_uuid": "",
    "t03_catalogue.country_code": "Deutschland",
    "t03_catalogue.country_key": "276",
    "t03_catalogue.language_code": "Deutsch",
    "t03_catalogue.language_key": "150",
    "t03_catalogue.mod_time": "",
    "t03_catalogue.mod_uuid": "",
    "content": [
    @for(var entry : ForSupport.of(page.getContentField()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ]
}
