@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.COORD_TYPE
@import gg.jte.support.ForSupport
@import java.util.List
@import java.util.Map
@import gg.jte.Content

@param Content extraFields = null
@param Map<String, Object> map

!{var page = ((IngridModelTransformer)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}
!{var partner = ((String)map.get("partner"));}
!{var provider = ((String)map.get("provider"));}
!{var tags = ((List<String>)map.get("tags"));}

{
    "iPlugId": "ige-ng_${catalog.getIdentifier()}",
    "iplug_id": "ige-ng_${catalog.getIdentifier()}",
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
    "tags": [
    @for(var entry : ForSupport.of(tags))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ],
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
    "capabilities_url_with_client": "${page.getMapLinkUrl()}",
    "organisation": "",
    "parent.object_node.obj_uuid": "${page.getHierarchyParent()}",
    "t011_obj_serv.coupling_type": "${page.getCouplingType()}",
    "t011_obj_serv.has_atom_download": "${page.isAtomDownload() ? 'Y' : 'N'}",
    "t011_obj_serv_url.line":  [
    @for(var entry : ForSupport.of(page.getServiceUrls()))
        "${entry.getIndex()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t011_obj_serv_url.name": [
    @for(var entry : ForSupport.of(page.getServiceUrls()))
        "${entry.get().getName()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t011_obj_serv_url.url": [
    @for(var entry : ForSupport.of(page.getServiceUrls()))
        "${entry.get().getUrl()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t011_obj_serv_url.description":  [
    @for(var entry : ForSupport.of(page.getServiceUrls()))
        "${entry.get().getDescription()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    @if(page.isAtomDownload())
    "download_service": "atom",
    @endif
    "t012_obj_adr.adr_id": "",
    "t012_obj_adr.mod_time": "",
    "t012_obj_adr.special_name": "",
    "t012_obj_adr.special_ref": "",
    "t012_obj_adr.typ": "",
    "t01_object.mod_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getModel().get_contentModified())}",
    "t01_object.obj_class": "${page.handleContent(page.getDocumentType())}",
    "t01_object.obj_id": "${page.handleContent(page.getModel().getUuid())}",
    "t01_object.id": "${page.handleContent(page.getModel().getUuid())}",
    @if(page.getContact() != null)
        "t021_communication.comm_type": [
        @for(var entry : ForSupport.of(page.getContact().getContactsComTypeValues()))
            "${entry.get().getValue()}"@if (!entry.isLast()),@endif
        @endfor
        ],
        "t021_communication.line": [
        @for(var entry : ForSupport.of(page.getContact().getContactsComTypeValues()))
            "${entry.getIndex() + 1}"@if (!entry.isLast()),@endif
        @endfor
        ],
        "t021_communication.comm_value": [
        @for(var entry : ForSupport.of(page.getContact().getContactsComConnections()))
            "${page.handleContent(entry.get())}"@if (!entry.isLast()),@endif
        @endfor
        ],
        "t021_communication.commtype_key": [
        @for(var entry : ForSupport.of(page.getContact().getContactsComTypeKeys()))
            "${entry.get()}"@if (!entry.isLast()),@endif
        @endfor
        ],
        "t021_communication.descr": "",
        "t02_address.adr_id": [
            "${page.handleContent(page.getContact().getUuid())}"
            @for(var entry : ForSupport.of(page.getPointOfContact()))
                ,"${entry.get().getUuid()}"
            @endfor
        ],
        "t02_address.address_key": "",
        "t02_address.address_value": "${page.getContact().getDisplayAddress().getTitle()}",
        "t02_address.city": "${page.getContact().getCity()}",
        "t02_address.country_code": "${page.getCodelists().getValue("6200", page.getContact().getCountry())}",
        "t02_address.country_key": "${page.getContact().getCountryKey()}",
        "t02_address.create_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getContact().getDisplayAddress().getCreated())}",
        "t02_address.descr": "",
        "t02_address.firstname": "${page.getContact().getFirstName()}",
        "t02_address.lastname": "${page.getContact().getLastName()}",
        "t02_address.institution": "${page.getContact().getDisplayOrganization()}",
        "t02_address.job": "",
        "t02_address.mod_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getContact().getDisplayAddress().getModified())}",
        "t02_address.mod_uuid": "",
        "t02_address.org_adr_id": "",
        "t02_address.postbox": "${page.getContact().getPoBox()}",
        "t02_address.postbox_pc": "${page.getContact().getZipPoBox()}",
        "t02_address.postcode": "${page.getContact().getZipCode()}",
        "t02_address.responsible_uuid": "",
        "t02_address.street": "${page.getContact().getStreet()}",
        "t02_address.title_key": "",
    @endif
    "t03_catalogue.cat_name": "${catalog.getName()}",
    "t03_catalogue.cat_namespace": "",
    "t03_catalogue.cat_uuid": "",
    "t03_catalogue.country_code": "Deutschland",
    "t03_catalogue.country_key": "276",
    "t03_catalogue.language_code": "Deutsch",
    "t03_catalogue.language_key": "150",
    "t03_catalogue.mod_time": "",
    "t03_catalogue.mod_uuid": "",


    "t01_object.org_obj_id": null,
    @if("3".equals(page.getDocumentType()))
    "t011_obj_serv.has_access_constraint": "${page.getModel().getData().getService().hasAccessConstraintsOrFalse()}",
    "t011_obj_serv.type": "${page.getServiceType(null)}",
    @if(page.getData().getService().getType() != null)
        "t011_obj_serv.type_key": "${page.getData().getService().getType().getKey()}",
    @endif
    "t011_obj_serv_version.version_value": [
        @for(var entry : ForSupport.of(page.getServiceTypeVersions()))
            "${entry.get()}"@if (!entry.isLast()),@endif
        @endfor
        ],
    @endif
    "t02_address.typ": [
    @for(var entry : ForSupport.of(page.getPointOfContact()))
        "${entry.get().getAddressDocType()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t02_address.title": [
    @for(var entry : ForSupport.of(page.getPointOfContact()))
        "${page.getCodelists().getValue("4300", entry.get().getSalutation())}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t022_adr_adr.adr_from_id": [
    @for(var entry : ForSupport.of(page.getPointOfContact()))
        "${entry.get().getNextParent()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t011_obj_serv_op_connpoint.connect_point": [
    @for(var entry : ForSupport.of(page.getServiceUrls()))
        "${entry.get().getUrl()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "additional_html_1": [
    @for(var entry : ForSupport.of(page.getBrowseGraphics()))
        "<img src='${entry.get().getUri()}' height='100' class='preview_image' alt='${entry.get().getDescription()}' title='${entry.get().getDescription()}' >"@if (!entry.isLast()),@endif
    @endfor
    ],
    @if("3".equals(page.getDocumentType()) && !page.getModel().getData().getService().hasAccessConstraintsOrFalse())
    "capabilities_url": "${page.getCapabilitiesUrl()}",
    @elseif("1".equals(page.getDocumentType()))
    "capabilities_url": [
        @for(var entry : ForSupport.of(page.getCapabilitiesUrlsFromService()))
            "${entry.get()}"@if (!entry.isLast()),@endif
        @endfor
        ],
    @endif
    "refering_service_uuid": [
    @for(var entry : ForSupport.of(page.getGetCoupledServicesForGeodataset()))
        "${page.getReferingServiceUuid(entry.get())}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t04_search.searchterm": [
    @for(var entry : ForSupport.of(page.getKeywordsAsList()))
        "${page.handleContent(entry.get())}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "refering.object_reference.obj_uuid": [
    @for(var entry : ForSupport.of(page.getGetCoupledServicesForGeodataset()))
        "${entry.get().getUuid()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "refering.object_reference.obj_class": [
    @for(var entry : ForSupport.of(page.getGetCoupledServicesForGeodataset()))
        "${entry.get().getObjectType()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "refering.object_reference.obj_name": [
    @for(var entry : ForSupport.of(page.getGetCoupledServicesForGeodataset()))
        "${entry.get().getObjectName()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "refering.object_reference.type": [
    @for(var entry : ForSupport.of(page.getGetCoupledServicesForGeodataset()))
        "${entry.get().getServiceType()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "refering.object_reference.version": [
    @for(var entry : ForSupport.of(page.getGetCoupledServicesForGeodataset()))
        "${entry.get().getServiceVersion()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t017_url_ref.url_link": [
    @for(var entry : ForSupport.of(page.getReferencesWithCoupledServices()))
        "${entry.get().getUrl()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t017_url_ref.content": [
    @for(var entry : ForSupport.of(page.getReferencesWithCoupledServices()))
        "${entry.get().getTitle()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t017_url_ref.special_ref": [
    @for(var entry : ForSupport.of(page.getReferencesWithCoupledServices()))
        "${entry.get().getType().getKey()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "object_reference.obj_uuid": [
    @for(var entry : ForSupport.of(page.getReferencesWithUuidRefs()))
        "${entry.get().getUuidRef()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "object_reference.obj_name": [
    @for(var entry : ForSupport.of(page.getReferencesWithUuidRefs()))
        "${entry.get().getTitle()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "object_reference.obj_class": [
    @for(var entry : ForSupport.of(page.getReferencesWithUuidRefs()))
        "${entry.get().getUuidRefClass()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "object_reference.type": [
    @for(var entry : ForSupport.of(page.getReferencesWithUuidRefs()))
        "${page.getCodelists().getValue("5100", entry.get().getUuidRefServiceType(), "iso")}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "object_reference.version": [
    @for(var entry : ForSupport.of(page.getReferencesWithUuidRefs()))
        "${entry.get().getUuidRefVersion()}"@if (!entry.isLast()),@endif
    @endfor
    ],

    @if("at".equals(page.getResourceDateType()) && (page.getData().getTemporal().getResourceDate() != null))
    "t0": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceDate())}",
    "t01_object.time_from": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceDate())}",
    "t01_object.time_type": "am",
    @endif
    @if("since".equals(page.getResourceDateType()))
        @if(page.isResourceRangeDefined() && (page.getData().getTemporal().getResourceDateTypeSince() != null) && "exactDate".equals(page.getData().getTemporal().getResourceDateTypeSince().getKey()))
            @if(page.getData().getTemporal().getResourceRange() != null)
                "t1": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceRange().getStart())}",
                "t2": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceRange().getEnd())}",
                "t01_object.time_from": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceRange().getStart())}",
                "t01_object.time_to": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceRange().getEnd())}",
            @endif
            "t01_object.time_type": "von",
        @elseif (page.getData().getTemporal().getResourceDate() != null)
            "t1": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceDate())}",
            "t01_object.time_from": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceDate())}",
            @if(page.getData().getTemporal().getResourceDateTypeSince() != null && "requestTime".equals(page.getData().getTemporal().getResourceDateTypeSince().getKey()))
                "t01_object.time_type": "seitX",
            @else
                "t01_object.time_type": "seit",
            @endif
        @endif
    @endif
    @if("till".equals(page.getResourceDateType()) && (page.getData().getTemporal().getResourceDate() != null))
    "t2": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceDate())}",
    "t01_object.time_to": "${page.formatDate(page.getFormatterNoSeparator(), page.getData().getTemporal().getResourceDate())}",
    "t01_object.time_type": "bis",
    @endif
    "object_use_constraint.license_key": [
    @for(var entry : ForSupport.of(page.getUseConstraints()))
        "${entry.get().getTitleKey()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "object_use_constraint.license_value":  [
    @for(var entry : ForSupport.of(page.getUseConstraints()))
        "${entry.get().getTitle().getText()}"@if (!entry.isLast()),@endif
    @endfor
    ],
!{var wktJson = page.wktAsGeoJson();}
    @if(wktJson != null)
    "wkt_geo": ${wktJson.getFirst()},
    "wkt_geo_text": "${wktJson.getSecond()}",
    @endif
    "spatial_ref_value.nativekey": [
    @for(var entry : ForSupport.of(page.getSpatialReferenceArs()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "areaid": [
    @for(var entry : ForSupport.of(page.getSpatialReferenceArs()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "spatial_ref_value.x1": ${page.getSpatialReferenceComponents(COORD_TYPE.Lon1)},
    "spatial_ref_value.y1": ${page.getSpatialReferenceComponents(COORD_TYPE.Lat1)},
    "spatial_ref_value.x2": ${page.getSpatialReferenceComponents(COORD_TYPE.Lon2)},
    "spatial_ref_value.y2": ${page.getSpatialReferenceComponents(COORD_TYPE.Lat2)},

    "t03_catalogue.create_time": "",
    "t01_object.is_adv_compatible": "",
    "object_data_quality.measure_description": [],
    "object_types_catalogue.type_date": "",
    "t0113_dataset_reference.reference_date": "",
    "t011_obj_geo_symc.symbol_date": "",
    "t0110_avail_format.line": [],
    "object_conformity.degree_key": "",
    "t017_url_ref.line": "",
    "t011_obj_geo_spatial_rep.type": [],
    "t01_object.time_alle": "",
    "t0112_media_option.medium_name": [],
    "publish_id": "",
    "t011_obj_geo.referencesystem_id": [],
    "object_types_catalogue.title_value": "",
    "t015_legist.name": [],
    "object_access.line": "",
    "spatial_ref_value.name_key": [],
    "t0110_avail_format.file_decompression_technique": [],
    "spatial_ref_value.name_value": [],
    "object_use_constraint.line": [],
    "t01_object.metadata_standard_version": "",
    "t01_object.dataset_usage": "",
    "t0114_env_topic.line": [],
    "spatial_system.line": [],
    "object_data_language.data_language_value": [],
    "doi.type": "",
    "t011_obj_geo_symc.symbol_cat": "",
    "t011_obj_geo.datasource_uuid": "${page.getData().getIdentifier()}",
    "t022_adr_adr.adr_to_id": [
    @for(var entry : ForSupport.of(page.getAddressesToUuids()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t011_obj_geo.vector_topology_level": "",
    "object_access.restriction_key": "",
    "t01_object.metadata_time": "",
    "t011_obj_geo_scale.scale": [],
    "t01_object.time_descr": "",
    "object_use.terms_of_use_value": "",
    "object_data_quality.dq_element_id": [],
    "t01_object.time_period": "",
    "object_types_catalogue.line": "",
    "t01_object.vertical_extent_vdatum_value": "",
    "spatial_ref_value.topic_type": [],
    "object_conformity.specification_key": "",
    "t0110_avail_format.name": [],
    "object_types_catalogue.title_key": "",
    "searchterm_value.alternate_term": [],
    "content": [
    @for(var entry : ForSupport.of(page.getContentField()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ]
    ${extraFields}
}
