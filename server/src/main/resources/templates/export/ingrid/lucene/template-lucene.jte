@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import gg.jte.support.ForSupport
@import java.util.Map
@import gg.jte.Content

@param Content extraFields = null
@param Map<String, Object> map

!{var page = ((IngridModelTransformer)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}
!{var partner = ((String)map.get("partner"));}
!{var provider = ((String)map.get("provider"));}

{
"id": "${page.getModel().getUuid()}",
"schema_version": "0.0.1",
"metadata": {
"data_type": "INGRID",
"created": "${page.formatDate(page.getFormatterISO(), page.getModel().get_created())}",
"modified": "${page.formatDate(page.getFormatterISO(), page.getModel().get_contentModified())}",
"issued": null,
"partner": "${partner}",
"provider": "${provider}",
"language": "${page.getMetadataLanguage()}",
"datasource": {
"id": "${catalog.getIdentifier()}",
"name": "${catalog.getName()}"
}
},
"title": "${page.getModel().getTitle()}",
"description": "${page.getData().getDescription()}",
"spatials": [
@for(var entry : ForSupport.of(page.getSpatials()))
    {
    @if(entry.get().getTitle() != null)
        "name": "${entry.get().getTitle()}"
    @endif
    @if(entry.get().getBbox() != null)
        !{var bbox = entry.get().getBbox();}
        ,"bbox": [
        ${bbox.getLon1()},
        ${bbox.getLat1()},
        ${bbox.getLon2()},
        ${bbox.getLat2()}
        ]
    @endif
    @if(entry.get().getWkt() != null)
        ,"wkt": "${entry.get().getWkt()}"
    @endif
    @if(entry.get().getToponym() != null)
        ,"toponym": "${entry.get().getToponym()}"
    @endif
    @if(entry.get().getAdministrativeArea() != null)
        ,"administrative": {
        "regional_key": "${entry.get().getAdministrativeArea()}"
        }
    @endif
    @if(entry.get().getGeoJson() != null)
        ,"geometry": $unsafe{entry.get().getGeoJson()}
    @endif
    }
    @if (!entry.isLast()),@endif
@endfor
],
"temporal": {
"data_temporal": [
@for(var entry : ForSupport.of(page.getTemporal()))
    {
    "date_type": "${entry.get().getType().getType()}"
    @if(entry.get().getDate() != null)
        , "date": "${page.formatDate(page.getFormatterUTC(), entry.get().getDate())}"
    @endif
    @if(entry.get().getDateText() != null)
        , "date_text": "${entry.get().getDateText()}"
    @endif
    @if(entry.get().getDateRange() != null)
        ", date_range": {
        "start": "${page.formatDate(page.getFormatterUTC(), entry.get().getDateRange().getStart())}",
        "end": "${page.formatDate(page.getFormatterUTC(), entry.get().getDateRange().getEnd())}"
        }
    @endif
    }@if (!entry.isLast()),@endif
@endfor
],
"status": $unsafe{page.renderKeyValue(page.getData().getTemporal().getStatus())},
"maintenance_frequency": $unsafe{page.renderKeyValue(page.getData().getMaintenanceInformation().getMaintenanceAndUpdateFrequency())},
"user_defined_maintenance_frequency_in_sec": "${page.getData().getMaintenanceInformation().getUserDefinedMaintenanceFrequency().getNumber()}"
},
"keywords": [
@for(var entry : ForSupport.of(page.getAllKeywords()))
    @for(var keyword : ForSupport.of(entry.get().getKeywords()))
        {
        "term": "${keyword.get().getLabel()}",
        "id": "${keyword.get().getId()}",
        "source": "${entry.get().getType()}"
        }@if (!keyword.isLast()),@endif
    @endfor
    @if (!entry.isLast()),@endif
@endfor],
"sort_uuid": "",
"contacts": [
@for(var entry : ForSupport.of(page.getContacts()))
    {
    "role": "${entry.get().getRelationType().getValue()}",
    "name": "${entry.get().getTitle()}",
    "communications": [
    @for(var communication : ForSupport.of(entry.get().getAllCommunications()))
        { "type": "${communication.get().getKey()}", "value": "${communication.get().getValue()}" }@if (!communication.isLast()),@endif
    @endfor
    ],
    "street": "${entry.get().getStreet()}",
    "code": "${entry.get().getZipCode()}",
    "pocode": "${entry.get().getZipPoBox()}",
    "locality": "${entry.get().getCity()}",
    "country": "${entry.get().getCountryIso3166()}",
    "administrative_area": "${entry.get().getAdministrativeArea()}"
    }@if (!entry.isLast()),@endif
@endfor],
"exports": {},
"ingrid": {
"alternate_title": "${page.getAlternateTitle()}",
"metadata": "",
"references": [
@for(var entry : ForSupport.of(page.getAllReferences()))
    {
    "internal": @if("url".equals(entry.get().getReferenceType()))false@else true@endif,
    "url": "${entry.get().getUrl()}",
    "uuid_ref": "${entry.get().getUuidRef()}",
    "type": $unsafe{page.renderKeyValue(entry.get().getType())},
    "title": "${entry.get().getTitle()}",
    "explanation": "${entry.get().getExplanation()}"
    }@if (!entry.isLast()),@endif
@endfor
],
"licenses": [],
"parent_identifier": "${page.getParentIdentifier()}",
"datasource_identifier": "${page.getResourceIdentifier()}",
"spatial_representation": [],
"specific_usage": "${page.getSpecificUsage()}",
"purpose": "${page.getPurpose()}",
"conformance_result": [
@for(var entry : ForSupport.of(page.getData().getConformanceResult()))
    {
    "pass": "${entry.get().getPass().getValue()}",
    "specification": $unsafe{page.renderKeyValue(entry.get().getSpecification())},
    "publicationDate": "${entry.get().getPublicationDate()}",
    "explanation": "${entry.get().getExplanation()}"
    }@if (!entry.isLast()),@endif
@endfor
],
"order_info": "${page.getData().getOrderInfo()}",
"data_quality": {}
}
}
