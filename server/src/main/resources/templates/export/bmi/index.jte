@import de.ingrid.igeserver.profiles.bmi.exporter.BmiModelTransformer

@import gg.jte.support.ForSupport
@import java.util.Map

@param Map<String, Object> map

!{var page = ((BmiModelTransformer)map.get("model"));}
!{var model = page.getModel();}
!{var data = model.getData();}

{
    "uuid": "${ model.getUuid() }",
    "title": "${ model.getTitle().trim() }",
    "description": "${ model.getDescription() }",
    "landingPage": "${ data.getLandingPage() }",
    "theme": [
        @for(var entry : ForSupport.of(model.getThemes()))
            "${entry.get()}"@if (!entry.isLast()),@endif
        @endfor
    ],
    "issued": "${ model.getCreated() }",
    "modified": "${ model.getModified() }",
    @if(model.getPeriodicity() != null)
        "accrual_periodicity": "${ model.getPeriodicity() }",
    @endif
    "keywords": [
        @for(var entry : ForSupport.of(data.getKeywords()))
            "${entry.get()}"@if (!entry.isLast()),@endif
        @endfor
    ],
    "contact": [
        @for(var address : ForSupport.of(page.getAddresses()))
            {
                "type": "${ address.get().getType() }",
                "organization": "${ address.get().getOrganization().trim() }",
                "communication": [
                    @for(var contact : ForSupport.of(address.get().getContact()))
                        {
                            "type": "${ contact.get().getTypeLabel() }",
                            "connection": "${ contact.get().getConnection() }"
                        }@if(!contact.isLast()),@endif
                    @endfor
                ],
                "street": "${ address.get().getAddress().getStreet() }",
                "zip-code": "${ address.get().getAddress().getZipCode() }",
                "city": "${ address.get().getAddress().getCity() }",
                "country": "${ address.get().getAddress().getCountryName() }"
            }@if (!address.isLast()),@endif
        @endfor
    ],
    @if(data.getLegalBasis() != null)
        "legal_basis": "${data.getLegalBasis()}",
    @endif
    "distribution": [
        @for(var download : ForSupport.of(data.getDistributions()))
            {
                @if(download.get().getFormat() != null)
                "format": ["${ download.get().getFormat().getKey() }"],
                @endif
                @if(download.get().getLink().getAsLink())
                    "accessURL": "${ download.get().getLink().getValue() }",
               @else
                    "accessURL": "/downloads/${ model.getUuid() }/${ download.get().getLink().getValue() }",
                @endif
                @if(download.get().getModified() != null)
                    "modified": "${ download.get().getModified() }",
                @endif
                "title": "${ download.get().getTitle() }",
                "description": "${ download.get().getDescription() }",
                "license": "${ download.get().getLicense().getKey() }",
                "byClause": "${ download.get().getByClause() }",
                @if(download.get().getAvailability() != null)
                    "availability": "${ download.get().getAvailability().getKey() }",
                @endif
                "languages": [
                    @for(var entry : ForSupport.of(download.get().getLanguageKeys()))
                        "${entry.get()}"@if (!entry.isLast()),@endif
                    @endfor
                ]
            }@if (!download.isLast()),@endif
        @endfor
    ],
    "qualityProcessURI": "${ data.getQualityProcessURI() }",
    "metadata": {
        "issued": "${ model.getCreated() }",
        "modified": "${ model.getModified() }"
    },
    "spatial":
        @if(model.getRealSpatials() == null || model.getRealSpatials().isEmpty())
            null
        @else
            @if(!model.getHasSingleSpatial())
                {
                    "type": "geometrycollection",
                    "geometries": [
            @endif
            @for(var spatial : ForSupport.of(model.getRealSpatials()))
                {
                    "type": "${ spatial.get().getGeoType() }",
                    "coordinates": ${ spatial.get().getPolygon() }
                }@if(!spatial.isLast()),@endif
            @endfor
            @if(!model.getHasSingleSpatial())
                    ]
                }
            @endif
        @endif
    ,
    @if(model.getSpatialTitels() != null)
        "spatial_text": [
            @for(var entry : ForSupport.of(model.getSpatialTitels()))
                "${entry.get()}"@if (!entry.isLast()),@endif
            @endfor
        ],
    @endif
    @if(model.getArs() != null)
    "ars": [
        @for(var entry : ForSupport.of(model.getArs()))
            "${entry.get()}"@if (!entry.isLast()),@endif
        @endfor
    ],
    @endif
    @if(data.getPoliticalGeocodingLevel() != null)
        "politicalGeocodingLevel": "${ data.getPoliticalGeocodingLevel().getKey() }",
    @endif
    "temporal": [
        @if(data.getTemporal().getStart() != null || data.getTemporal().getEnd() != null)
            {
                @if(data.getTemporal().getStart() != null)
                    "gte": "${data.getTemporal().getStart()}"@if(data.getTemporal().getEnd() != null),@endif
                @endif
                @if(data.getTemporal().getEnd() != null)
                    "lte": "${data.getTemporal().getEnd()}"
                @endif
            }
        @endif
    ]
}
