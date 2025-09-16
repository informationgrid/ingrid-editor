@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeodatasetTransformerBaw
@import gg.jte.support.ForSupport
@import java.util.Map
@param Map<String, Object> map

!{var page = ((GeodatasetTransformerBaw)map.get("model"));}


@template.export.ingrid-baw.lucene.template-lucene-baw(map = map, extraFields = @`
    ,
    "bawauftragsnummer": "${page.getOrderNumber()}",
    "bawauftragstitel": "${page.getOrderTitle()}",
    "bawhierarchylevelname": "${page.getHierarchyLevelName()}",
    "data_category":  "${page.getHierarchyLevelName()}",
    "simulation_data_type":  "${page.getHierarchyLevelName()}",
    "simspatialdimension": "${page.getDimensionality()}",
    "simProcess": "${page.getProcess()}",
    "method": [
    @for(var entry : ForSupport.of(page.getMethod()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "measuringMethod": [
    @for(var entry : ForSupport.of(page.getMeasuringMethod()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "simModelType": [
    @for(var entry : ForSupport.of(page.getModelType()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "physicalparameter.name": [
    @for(var entry : ForSupport.of(page.getSimulationParameters()))
        "${entry.get().getName()}"@if (!entry.isLast()),@endif
    @endfor
    ]
`)
