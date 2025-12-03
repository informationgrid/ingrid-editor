@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import de.ingrid.igeserver.profiles.opendata.exporter.OpenDataModelTransformer
@import gg.jte.support.ForSupport
@import java.util.Map

@param Map<String, Object> map

!{var model = ((OpenDataModelTransformer)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}

{
"collection.name": "${catalog.getName()}",
"collection.id": "${catalog.getIdentifier()}",
"id": "${model.getUuid() }",
    "created": "${model.getCreated() }",
    "issued": "${model.getCreated() }",
    "modified": "${model.getModified() }",
    "title": "${model.getTitle() }",
    "description": "${model.getDescription() }",
    "dcat": {
        "landingPage": "${model.getLandingPage() }"
    },
    "contacts": [
        @for(var entry : ForSupport.of(model.getAddresses()))
        {
            "role": "${model.mapAddressType(entry.get().getRelationType().getKey())}",
            "name": "${entry.get().getTitle()}",
            "communications": [
            @for(var contact : ForSupport.of(entry.get().getAllCommunications()))
                {
                "type": "${model.mapCommunicationTyp(contact.get().getKey())}",
                    "value": "${contact.get().getValue()}"
                }@if (!contact.isLast()),@endif
            @endfor
            ],
            "street": "${entry.get().getStreet()}",
            "code": "${entry.get().getZipCode()}",
            "pocode": "",
            "pobox": "",
            "locality": "${entry.get().getCity()}",
            "country": "${entry.get().getCountryKey()}",
            "administrative_area": ""
        }@if (!entry.isLast()),@endif
    @endfor
    ],
    "keywords": [
        @for(var entry : ForSupport.of(model.getKeywords()))
        {
            "term": "${entry.get().getTerm()}",
            "id": "${entry.get().getId()}",
            "source": "${entry.get().getSource()}"
        }@if (!entry.isLast()),@endif
        @endfor
    ],
    "spatial": {
"title": [
@for(var entry : ForSupport.of(model.getSpatialTitles()))
    "${entry.get()}"@if (!entry.isLast()),@endif
@endfor
],
        "geometries": [
            @for(var entry : ForSupport.of(model.getSpatials()))
                $unsafe{entry.get()}@if (!entry.isLast()),@endif
            @endfor
],
"administrative": {
"regional_key": [
@for(var entry : ForSupport.of(model.getArs()))
    "${entry.get()}"@if (!entry.isLast()),@endif
@endfor
]
}
    },
    "legal_basis": "${model.getLegalBasis() }",
"distributions": [
    @for(var download : ForSupport.of(model.getDistributions()))
        {
            "format": ["${download.get().getFormat()}"],
            "access_url": "${download.get().getAccessURL()}",
        @if(download.get().getModified() != null)"modified": "${download.get().getModified()}",@endif
            "title": "${download.get().getTitle() }",
            "description": "${download.get().getDescription() }",
        "license": {
        "url": "@if(download.get().getLicense() != null)${download.get().getLicense().getUrl()}@endif",
        "name": "@if(download.get().getLicense() != null)${download.get().getLicense().getName()}@endif",
        "attribution_by_text": "${download.get().getByClause() }"
        },
            "languages": [
                @for(var entry : ForSupport.of(download.get().getLanguages()))
                    "${entry.get()}"@if (!entry.isLast()),@endif
                @endfor
            ],
            "availability": "${download.get().getAvailability() }"
        }@if (!download.isLast()),@endif
    @endfor
    ],
"quality_process_uri": "${model.getQualityProcessURI() }",
    "metadata": {
        "issued": "${model.getCreated() }",
        "modified": "${model.getModified() }"
    },
"political_geocoding_level_uri": "${model.getPoliticalGeocodingLevel() }",
"temporal": {
"accrual_periodicity": "${model.getPeriodicity() }"
        @if (model.getTemporalStart() != null || model.getTemporalEnd() != null)
            ,
        {
            @if (model.getTemporalStart() != null)
                "gte": "${model.getTemporalStart()}"@if (model.getTemporalEnd() != null),@endif
            @endif
            @if (model.getTemporalEnd() != null)
                "lte": "${model.getTemporalEnd()}"
            @endif
        }
        @endif
}
}
