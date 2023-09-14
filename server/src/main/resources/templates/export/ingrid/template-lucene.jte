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
    "iPlugId": "ige-ng:${catalog.getIdentifier()}",
    "dataSourceName": "iPlug IGE-NG (${catalog.getIdentifier()})",
    "title": "${page.getModel().getTitle()}",
    "summary": "${page.getData().getDescription()}",
    "x1": ${page.getSpatialReferenceComponents(COORD_TYPE.Lon1)},
    "x2": ${page.getSpatialReferenceComponents(COORD_TYPE.Lon2)},
    "y1": ${page.getSpatialReferenceComponents(COORD_TYPE.Lat1)},
    "y2": ${page.getSpatialReferenceComponents(COORD_TYPE.Lat2)},
    "location":  $unsafe{page.getSpatialReferenceLocationNames()},
    "created": "${page.formatDate(page.getFormatterISO(), page.getModel().get_created())}",
    "modified": "${page.formatDate(page.getFormatterISO(), page.getModel().get_contentModified())}",
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
    "t01_object.mod_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getModel().get_contentModified())}",
    "t01_object.obj_class": "${page.handleContent(page.getDocumentType())}",
    "t01_object.obj_id": "${page.handleContent(page.getModel().getUuid())}",
    @if(page.getContact() != null)
        @for(var entry : ForSupport.of((page.getContact().getModel().getContact())))
            "t021_communication.comm_type": "${entry.get().getType().getValue()}",
            "t021_communication.comm_value": "${page.handleContent(entry.get().getConnection())}",
            "t021_communication.commtype_key": "${entry.get().getType().getKey()}",
            "t021_communication.descr": "",
            "t021_communication.line": "${entry.getIndex() + 1}",
        @endfor
        "t02_address.address_key": "",
        "t02_address.address_value": "${page.getContact().getModel().getTitle()}",
        "t02_address.adr_id": "${page.handleContent(page.getContact().getModel().getUuid())}",
        "t02_address.city": "${page.getContact().getModel().getAddress().getCity()}",
        "t02_address.country_code": "${page.getCodelists().getValue("6200", page.getContact().getModel().getAddress().getCountry())}",
        "t02_address.country_key": "${page.getContact().getModel().getAddress().getCountryKey()}",
        "t02_address.create_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getContact().getModel().getCreated())}",
        "t02_address.descr": "",
        "t02_address.firstname": "${page.getContact().getModel().getFirstName()}",
        "t02_address.lastname": "${page.getContact().getModel().getLastName()}",
        "t02_address.institution": "${page.getContact().getModel().getOrganization()}",
        "t02_address.job": "",
        "t02_address.mod_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getContact().getModel().getModified())}",
        "t02_address.mod_uuid": "",
        "t02_address.org_adr_id": "",
        "t02_address.postbox": "${page.getContact().getPoBox()}",
        "t02_address.postbox_pc": "${page.getContact().getZipPoBox()}",
        "t02_address.postcode": "${page.getContact().getZipCode()}",
        "t02_address.responsible_uuid": "",
        "t02_address.street": "${page.getContact().getStreet()}",
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

"t03_catalogue.create_time": "19980616155917000",
"t01_object.is_adv_compatible": "Y",
"object_data_quality.measure_description": [
"66",
"h",
"3",
"mm",
"%",
"rat",
"tol",
"param1",
"hl",
"ter",
"param2",
"kk"
],
"object_types_catalogue.type_date": "20230221000000000",
"t0113_dataset_reference.reference_date": "20230221000000000",
"t011_obj_geo_symc.symbol_date": "20230221000000000",
"t0110_avail_format.line": [
"2",
"1"
],
"spatial_ref_value.nativekey": [
"",
""
],
"object_conformity.degree_key": "1",
"t017_url_ref.line": "1",
"t011_obj_geo_spatial_rep.type": [
"4",
"2"
],
"t01_object.time_alle": "3",
"t017_url_ref.datatype": "PDF",
"t0112_media_option.medium_name": [
"4",
"14"
],
"publish_id": "1",
"t017_url_ref.content": "Testverweis",
"t011_obj_geo.referencesystem_id": [
"DE_DHDN / GK_3_RP180",
"EPSG 5676: DHDN / Gauss-Krüger Zone 2 (E-N)"
],
"object_types_catalogue.title_value": "von Drachenfels 94",
"t015_legist.name": [
"Weitere Rechtliche Grundlagen 1",
"Weitere Rechtliche Grundlagen 2"
],
"object_access.line": "1",
"spatial_ref_value.name_key": [
"19",
""
],
"t0110_avail_format.file_decompression_technique": [
"5",
"2"
],
"t012_obj_adr.typ": "7",
"t1": "20230202000000000",
"t01_object.org_obj_id": "",
"t2": "99999999",
"spatial_ref_value.name_value": [
"Auenland",
"Hannover"
],
"object_use_constraint.line": [
"1",
"2"
],
"spatial_ref_value.x1": ${page.getSpatialReferenceComponents(COORD_TYPE.Lon1)},
"t01_object.metadata_standard_version": "",
"spatial_ref_value.x2": ${page.getSpatialReferenceComponents(COORD_TYPE.Lon2)},
"t01_object.dataset_usage": "Eignung/Nutzung\n test",
"t0114_env_topic.line": [
"1",
"2"
],
"spatial_system.line": [
"2",
"1"
],
"object_data_language.data_language_value": [
"Deutsch",
"Dänisch"
],
"doi.type": "Dataset",
"t011_obj_geo_symc.symbol_cat": "Ganzflächige Biotopkartierung 94",
"t011_obj_geo.datasource_uuid": "test-identifikator",
"t022_adr_adr.adr_to_id": [
"372FF7BD-3959-4DCA-B8BB-33B9B5A8A843",
"88A7D4E4-44E3-4C3E-9A4C-182EF47C9C7D",
"FA2EAE76-71C5-45F7-BF62-28D975EE9817",
"9618D3A9-9755-414B-9004-9F16E56843EA",
"F06E904D-C9B9-4C13-B3DB-B9BB720C6876",
"2939D350-9347-4B35-A603-9CF04877B435",
"050514EF-CD29-4769-91A5-DDE0495B347F"
],
"t011_obj_geo.vector_topology_level": "",
"spatial_ref_value.y2": ${page.getSpatialReferenceComponents(COORD_TYPE.Lat2)},
"object_access.restriction_key": "1",
"spatial_ref_value.y1": ${page.getSpatialReferenceComponents(COORD_TYPE.Lat1)},
"t01_object.metadata_time": "",
"t01_object.time_to": "",
"t017_url_ref.special_ref": "9990",
"t011_obj_geo_scale.scale": [
"15",
"4"
],
"t01_object.time_descr": "Test-Erläuterungen 2",
"object_use.terms_of_use_value": "Anwendungseinschränkungen test",
"object_data_quality.dq_element_id": [
"112",
"120",
"112",
"113",
"125",
"126",
"128",
"109",
"115",
"127",
"109",
"114"
],
"t01_object.time_period": "1",
"object_types_catalogue.line": "1",
"t01_object.vertical_extent_vdatum_value": "DE_DHHN85_NOH",
"spatial_ref_value.topic_type": [],
"object_conformity.specification_key": "12",
"t0110_avail_format.name": [
"AI",
"3D-Shape"
],
"object_types_catalogue.title_key": "1",
"t03_catalogue.mod_time": "20230221024908046",
"searchterm_value.alternate_term": [],
    "content": [
    @for(var entry : ForSupport.of(page.getContentField()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ]
}
