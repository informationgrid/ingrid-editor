@import de.ingrid.igeserver.profiles.opendata.exporter.OpenDataModelTransformer
@import gg.jte.support.ForSupport
@import java.util.Map

@param Map<String, Object> map

!{var model = ((OpenDataModelTransformer)map.get("model"));}

{
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
            "title": "${entry.get().getTitle()}",
            "communications": [
            @for(var contact : ForSupport.of(entry.get().getAllCommunications()))
                {
                "type": "${model.mapCommunicationTyp(contact.get().getKey())}",
                    "value": "${contact.get().getValue()}"
                }@if (!contact.isLast()),@endif
            @endfor
            ],
            "street": "${entry.get().getStreet()}",
            "zipcode": "${entry.get().getZipCode()}",
            "city": "${entry.get().getCity()}",
            "country": "${entry.get().getCountryKey()}"
        }@if (!entry.isLast()),@endif
    @endfor
    ],

    "keywords": [
        @for(var entry : ForSupport.of(model.getKeywords()))
        {
            "term": "${entry.get()}",
            "id": "${entry.get()}",
            "source": "${entry.get()}"
        }@if (!entry.isLast()),@endif
        @endfor
    ],

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
    "parent.object_node.obj_uuid": "${model.getHierarchyParent()}",

    "accrual_periodicity": "${model.getPeriodicity() }",

    "legal_basis": "${model.getLegalBasis() }",
    "distribution": [
    @for(var download : ForSupport.of(model.getDistributions()))
        {
            "format": ["${download.get().getFormat()}"],
            "access_url": "${download.get().getAccessURL()}",
            "modified": "${download.get().getModified() }",
            "title": "${download.get().getTitle() }",
            "description": "${download.get().getDescription() }",
            "license": "@if(download.get().getLicense() != null)${download.get().getLicense().getUrl()}@endif",
            "license_name": "@if(download.get().getLicense() != null)${download.get().getLicense().getName()}@endif",
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
