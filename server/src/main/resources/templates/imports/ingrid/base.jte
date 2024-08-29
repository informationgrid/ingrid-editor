@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeneralMapper
@import gg.jte.Content
@import gg.jte.support.ForSupport
@param GeneralMapper model
@param Content additionalKeywords = null
@param Content additionalResource = null

"title": "${model.getTitle()}",
"_uuid": "${model.getUuid()}",
"_parent": @if(model.getParentUuid() == null) null @else "${model.getParentUuid()}"@endif,
"_type": "${model.getType()}",
"isInspireIdentified": ${model.isInspireIdentified()},
"isAdVCompatible": ${model.isAdVCompatible()},
"isOpenData": ${model.isOpenData()},
"description": "${model.getDescription()}",
"alternateTitle": "${model.getAlternateTitle()}",
"parentIdentifier": "${model.getParentUuid()}",
"pointOfContact": [
@for(var contact : ForSupport.of(model.getPointOfContactReferences()))
    {
    "ref": "${contact.get().getRefUuid()}",
    "type": @template.imports.ingrid.partial.key-value(item = contact.get().getType())
    }@if (!contact.isLast()),@endif
@endfor
],
"graphicOverviews": [
@for(var image : ForSupport.of(model.getGraphicOverviews()))
    {
    "fileName": {
    "asLink": true,
    "value": "${image.get().getFileName()}",
    "uri": "${image.get().getFileName()}"
    },
    "fileDescription": "${image.get().getDescription()}"
    }@if (!image.isLast()),@endif
@endfor
],
"advProductGroups": @template.imports.ingrid.partial.key-values(list = model.getAdvProductGroups()),
"themes": @template.imports.ingrid.partial.key-values(list = model.getThemes()),
@if(!model.getPriorityDatasets().isEmpty())
    "priorityDatasets": @template.imports.ingrid.partial.key-values(list = model.getPriorityDatasets()),
@endif
"openDataCategories": @template.imports.ingrid.partial.key-values(list = model.getOpenDataCategories()),
@if(model.getSpatialScope() != null)
    "spatialScope": @template.imports.ingrid.partial.key-value(item = model.getSpatialScope()),
@endif
"keywords": {
    "free": [
    @for(var keyword : ForSupport.of(model.getKeywords()))
        { "label": "${keyword.get()}" }@if (!keyword.isLast()),@endif
    @endfor
    ] ${additionalKeywords}
},
"spatial": {
"references": [
@for(var ref : ForSupport.of(model.getSpatialReferences()))
    {
        "type": "${ref.get().getType()}",
        "title": "${ref.get().getTitle()}"
        @if(ref.get().getType().equals("free") && ref.get().getCoordinates() != null)
        , "value": {
            "lat1": ${ref.get().getCoordinates().getLat1()},
            "lon1": ${ref.get().getCoordinates().getLon1()},
            "lat2": ${ref.get().getCoordinates().getLat2()},
            "lon2": ${ref.get().getCoordinates().getLon2()}
        }
        @elseif(ref.get().getType().equals("free") && ref.get().getArs() != null)
        , "ars": "${ref.get().getArs()}"
        @elseif(ref.get().getType().equals("wkt"))
        , "wkt": "${ref.get().getWkt()}"
        @endif

    }@if (!ref.isLast()),@endif
@endfor
],
"spatialSystems": @template.imports.ingrid.partial.key-values(list = model.getSpatialSystems()),
@if(model.getVerticalExtent() != null)
    "verticalExtent": {
    "minimumValue": ${model.getVerticalExtent().getMin()},
    "maximumValue": ${model.getVerticalExtent().getMax()},
    "unitOfMeasure": {
        "key": "${model.getVerticalExtent().getUom()}"
    },
    "Datum": {
        "key": "${model.getVerticalExtent().getDatum()}"
    }
    },
@endif
"description": "${model.getSpatialDescription()}"
},
"temporal": {
"events": [
@for(var event : ForSupport.of(model.getTemporalEvents()))
    {
        "referenceDate": "${event.get().getDate()}",
        "referenceDateType": @template.imports.ingrid.partial.key-value(item = event.get().getType())
    }@if (!event.isLast()),@endif
@endfor
]
!{var time = model.getTimeRelatedInfo();}
@if(time != null)
    ,
    "resourceDateType": @template.imports.ingrid.partial.key-value(item = time.getType()),
    "status": @template.imports.ingrid.partial.key-value(item = time.getStatus()),
    @if(time.getUntilDate() == null)
        "resourceDate": @if(time.getDate() == null) null @else "${time.getDate()}"@endif,
    @else
        "resourceRange": {
        "start": "${time.getDate()}",
        "end": "${time.getUntilDate()}"
        },
    @endif
    "resourceDateTypeSince": @template.imports.ingrid.partial.key-value(item = time.getDateTypeSince())
@endif
},
"maintenanceInformation": {
!{var interval = model.getMaintenanceInterval();}
"maintenanceAndUpdateFrequency": @template.imports.ingrid.partial.key-value(item = interval.getInterval()),
"userDefinedMaintenanceFrequency": {
    @if(interval.getValue() != null)"number": ${interval.getValue()},@endif
    "unit": @template.imports.ingrid.partial.key-value(item = interval.getUnit())
},
"description": "${interval.getDescription()}"
},
@if(!model.getConformanceResult().isEmpty())
    "conformanceResult": [
    @for(var item : ForSupport.of(model.getConformanceResult()))
        {
        "pass": @template.imports.ingrid.partial.key-value(item = item.get().getPass()),
        "isInspire": ${item.get().isInspire()},
        "explanation": "${item.get().getExplanation()}",
        "specification": @template.imports.ingrid.partial.key-value(item = item.get().getSpecification()),
        "publicationDate": "${item.get().getPublicationDate()}"
        }@if (!item.isLast()),@endif
    @endfor
    ],
@endif
"extraInfo": {
"legalBasicsDescriptions": @template.imports.ingrid.partial.key-values(list = model.getLegalDescriptions())
},
"resource": {
"purpose": "${model.getPurpose()}",
"specificUsage": "${model.getSpecificUsage()}",
"accessConstraints": @template.imports.ingrid.partial.key-values(list = model.getAccessConstraints()),
"useConstraints": [
@for(var item : ForSupport.of(model.getUseConstraints()))
    {
    "title": @template.imports.ingrid.partial.key-value(item = item.get().getTitle()),
    "source": "${item.get().getSource()}"
    @if(TransformationTools.hasValue(item.get().getNote())), "note": "${item.get().getNote()}"@endif
    }@if (!item.isLast()),@endif
@endfor
],
"useLimitation": "${model.getUseLimitation()}" ${additionalResource}
},
"distribution": {
"format": [
@for(var format : ForSupport.of(model.getDistributionFormat()))
    {
    "name": @template.imports.ingrid.partial.key-value(item = format.get().getName()),
    "version": "${format.get().getVersion()}",
    "compression": "${format.get().getCompression()}",
    "specification": "${format.get().getSpecification()}"
    }@if (!format.isLast()),@endif
@endfor
]
},
"digitalTransferOptions": [
@for(var option : ForSupport.of(model.getDigitalTransferOptions()))
    {
    "name": @template.imports.ingrid.partial.key-value(item = option.get().getName()),
    "transferSize": @if(option.get().getTransferSize() != null){ "value": ${option.get().getTransferSize().getValue()}, "unit": { "key": "${option.get().getTransferSize().getUnit().getKey()}" } } @else null@endif,
    "mediumNote": "${option.get().getMediumNote()}"
    }@if (!option.isLast()),@endif
@endfor
],
"orderInfo": "${model.getOrderInfo()}",
"references": [
@for(var reference : ForSupport.of(model.getReferences()))
    {
    "type": @template.imports.ingrid.partial.key-value(item = reference.get().getType()),
    "title": "${reference.get().getTitle()}",
    "url": "${reference.get().getUrl()}",
    @if(reference.get().getUrlDataType() != null) "urlDataType": @template.imports.ingrid.partial.key-value(item = reference.get().getUrlDataType()),@endif
    "explanation": "${reference.get().getExplanation()}"
    }@if (!reference.isLast()),@endif
@endfor
],
