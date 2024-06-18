@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
@import gg.jte.support.ForSupport
@import java.time.format.DateTimeFormatter
@import java.util.Map

@param Map<String, Object> map

!{var page = ((UVPModel)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}
!{var partner = ((String)map.get("partner"));}
!{var provider = ((String)map.get("provider"));}
!{page.getData().convertEiaNumbers(catalog.getIdentifier());}

{
    "iplug_id": "ige-ng_${catalog.getIdentifier()}",
    "dataSourceName": "iPlug IGE-NG (${catalog.getIdentifier()})",
    "title": "${page.getTitle()}",
    "summary": "${page.getData().getDescription()}",
    "x1": [${page.getSpatial("lon1")}],
    "x2": [${page.getSpatial("lon2")}],
    "y1": [${page.getSpatial("lat1")}],
    "y2": [${page.getSpatial("lat2")}],
    "lon_min": "${page.getSpatial("lon1")}",
    "lon_max": "${page.getSpatial("lon2")}",
    "lat_min": "${page.getSpatial("lat1")}",
    "lat_max": "${page.getSpatial("lat2")}",
    "lon_center": "${page.getSpatialLonCenter()}",
    "lat_center": "${page.getSpatialLatCenter()}",
    "uvp_address": [
    @for(var address : ForSupport.of(page.getUvpAddressParentsIncludingCurrent()))
        "${page.handleContent(address.get().getTitle())}"@if (!address.isLast()),@endif
    @endfor
    ],
    "uvp_number": [
    @for(var uvp : ForSupport.of(page.getUvpNumbers()))
        "${page.handleContent(uvp.get().getUvpg())}"@if (!uvp.isLast()),@endif
    @endfor
    ],
    "uvp_category": [
    @for(var uvp : ForSupport.of(page.getUvpCategories()))
        "${page.handleContent(uvp.get())}"@if (!uvp.isLast()),@endif
    @endfor
    ],
    "uvp_category_type": [
    @for(var uvp : ForSupport.of(page.getUvpCategoryTypes()))
        "${page.handleContent(uvp.get())}"@if (!uvp.isLast()),@endif
    @endfor
    ],
    "uvp_steps": [
    @for(var phase : ForSupport.of(page.getStepsAsPhases()))
        "${page.handleContent(phase.get())}"@if (!phase.isLast()),@endif
    @endfor
    ],
    @if(page.getData().getPrelimAssessment())
    "needs_examination": true,
    @endif
    "approval_date": [
    @for(var date : ForSupport.of(page.getDecisionDate()))
        "${date.get()}"@if (!date.isLast()),@endif
    @endfor
    ],
    "location": ["${page.handleContent(page.getSpatialTitle())}"],
    "created": "${page.formatDate(page.getFormatterISO(), page.get_created())}",
    "modified": "${page.formatDate(page.getFormatterISO(), page.get_contentModified())}",
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
    "t01_object.mod_time": "${page.formatDate(page.getFormatterNoSeparator(), page.get_contentModified())}",
    "t01_object.obj_class": "${page.handleContent(page.getDocumentType())}",
    "t01_object.obj_id": "${page.handleContent(page.getUuid())}",
    @if(page.getPointOfContact() != null)
        @for(var entry : ForSupport.of(page.getPointOfContact().getContactsComTypeValues()))
            "t021_communication.comm_type": "${entry.get().getValue()}",
            "t021_communication.line": "${entry.getIndex() + 1}",
        @endfor
        @for(var entry : ForSupport.of(page.getPointOfContact().getContactsComConnections()))
            "t021_communication.comm_value": "${page.handleContent(entry.get())}",
        @endfor
        @for(var entry : ForSupport.of(page.getPointOfContact().getContactsComTypeKeys()))
            "t021_communication.commtype_key": "${entry.get()}",
        @endfor
        "t021_communication.descr": "",
        "t02_address.address_key": "",
        "t02_address.address_value": "${page.getPointOfContact().getDoc().getTitle()}",
        "t02_address.adr_id": "${page.handleContent(page.getPointOfContact().getUuid())}",
        "t02_address.city": "${page.getPointOfContact().getCity()}",
        "t02_address.country_code": "${page.getCodelistValue("6200", page.getPointOfContact().getCountry())}",
        "t02_address.country_key": "${page.getPointOfContact().getCountryKey()}",
        "t02_address.create_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getPointOfContact().getDoc().getCreated())}",
        "t02_address.descr": "",
        "t02_address.firstname": "${page.getPointOfContact().getFirstName()}",
        "t02_address.lastname": "${page.getPointOfContact().getLastName()}",
        "t02_address.institution": "${page.getPointOfContact().getOrganization()}",
        "t02_address.job": "",
        "t02_address.mod_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getPointOfContact().getDoc().getModified())}",
        "t02_address.mod_uuid": "",
        "t02_address.org_adr_id": "",
        "t02_address.postbox": "${page.getPointOfContact().getPoBox()}",
        "t02_address.postbox_pc": "${page.getPointOfContact().getZipPoBox()}",
        "t02_address.postcode": "${page.getPointOfContact().getZipCode()}",
        "t02_address.responsible_uuid": "",
        "t02_address.street": "${page.getPointOfContact().getStreet()}",
        "t02_address.title": "",
        "t02_address.title_key": "",
        "t02_address.typ": "2",
    @endif
    "t03_catalogue.cat_name": "${catalog.getName()}",
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
