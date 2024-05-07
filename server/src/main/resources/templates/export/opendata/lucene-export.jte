@import de.ingrid.igeserver.profiles.opendata.exporter.OpenDataModelTransformerAdditional
@import gg.jte.support.ForSupport
@import java.util.Map

@param Map<String, Object> map

!{var model = ((OpenDataModelTransformerAdditional)map.get("model"));}

{
    "uuid": "${model.getUuid() }",
    "title": "${model.getTitle() }",
    "description": "${model.getDescription() }",
    "landingPage": "${model.getLandingPage() }",
    "theme": [
        @for(var entry : ForSupport.of(model.getThemes()))
            "${entry.get()}"@if (!entry.isLast()),@endif
        @endfor
    ],
    "issued": "${model.getCreated() }",
    "modified": "${model.getModified() }",
    "accrual_periodicity": "${model.getPeriodicity() }",
    "keywords": [
        @for(var entry : ForSupport.of(model.getKeywords()))
            "${entry.get()}"@if (!entry.isLast()),@endif
        @endfor
    ],
    "contact": [
    @for(var entry : ForSupport.of(model.getAddresses()))
        {
            "type": "",
            "organization": "",
            "communication": [
            @for(var contact : ForSupport.of(entry.get().getContacts()))
                {
                    "type": "",
                    "connection": ""
                }@if (!entry.isLast()),@endif
            @endfor
            ],
            "street": "",
            "zip-code": "",
            "city": "",
            "country": ""
        }@if (!entry.isLast()),@endif
    @endfor
    ],
    "legal_basis": "${model.getLegalBasis() }",
    "distribution": [
    @for(var download : ForSupport.of(model.getDistributions()))
        {
            "format": ["${download.get().getFormat()}"],
            "access_url": "${download.get().getAccessURL()}",
            "modified": "${download.get().getModified() }",
            "title": "${download.get().getTitle() }",
            "description": "${download.get().getDescription() }",
            "license": "${download.get().getLicense().getUrl() }",
            "license_name": "${download.get().getLicense().getName() }",
            "byClause": "${download.get().getByClause() }",
            "languages": [
                @for(var entry : ForSupport.of(download.get().getLanguages()))
                    "${entry.get()}"@if (!entry.isLast()),@endif
                @endfor
            ],
            "availability": "${download.get().getAvailability() }"
        }@if (!download.isLast()),@endif
    @endfor
    ],
    "qualityProcessURI": "${model.getQualityProcessURI() }",
    "metadata": {
        "issued": "${model.getCreated() }",
        "modified": "${model.getModified() }"
    },
    "spatial": {
        "type": "geometrycollection",
        "geometries": [
            @for(var entry : ForSupport.of(model.getSpatials()))
                {
                    "type": "",
                    "coordinates": ""
                }@if (!entry.isLast()),@endif
            @endfor
        ]
    },
    "spatial_text": [
        @for(var entry : ForSupport.of(model.getSpatialTitles()))
            "${entry.get()}"@if (!entry.isLast()),@endif
        @endfor
    ],
    "ars": [
       @for(var entry : ForSupport.of(model.getArs()))
           "${entry.get()}"@if (!entry.isLast()),@endif
       @endfor
    ],
    "politicalGeocodingLevel": "${model.getPoliticalGeocodingLevel() }",
    "temporal": [
        @if (model.getTemporalStart() != null || model.getTemporalEnd() != null)
        {
            @if (model.getTemporalStart() != null)
                "gte": "${model.getTemporalStart()}"@if (model.getTemporalEnd() != null),@endif
            @endif
            @if (model.getTemporalEnd() != null)
                "lte": "${model.getTemporalEnd()}"
            @endif
        }
        @endif
    ]
}
