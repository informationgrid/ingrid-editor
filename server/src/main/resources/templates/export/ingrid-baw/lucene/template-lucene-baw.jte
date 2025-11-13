@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import gg.jte.Content
@import gg.jte.support.ForSupport
@import java.util.Map
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.SharedExportKt
@param Map<String, Object> map

@param Content extraFields = null

!{var page = ((IngridModelTransformer)map.get("model"));}
!{var bwastrInfos = SharedExportKt.getBwastrInfos(page);}


@template.export.ingrid.lucene.template-lucene(map = map, extraFields = @`
    "bwstr-bwastr-id": [
    @for(var entry : ForSupport.of(bwastrInfos))
        "${page.handleContent(entry.get().getBwastrId())}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "bwstr-bwastr_name": [
    @for(var entry : ForSupport.of(bwastrInfos))
        "${page.handleContent(entry.get().getName())}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "bwstr-strecken_name": [
    @for(var entry : ForSupport.of(bwastrInfos))
        "${entry.get().getStreckenName()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "bwstr-strecken_km_von": [
    @for(var entry : ForSupport.of(bwastrInfos))
        "${entry.get().getStart()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "bwstr-strecken_km_bis": [
    @for(var entry : ForSupport.of(bwastrInfos))
        "${entry.get().getEnd()}"@if (!entry.isLast()),@endif
    @endfor
    ],

    "baw_abteilung_short": "${SharedExportKt.getAbteilung(page).getShort()}",
    "baw_abteilung_long": "${SharedExportKt.getAbteilung(page).getLong()}",

    "bawKeywordCatalogueEntry": [
    @for(var entry : ForSupport.of(SharedExportKt.getPlainBawKeywords(page)))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ]

    ${extraFields}
`)
