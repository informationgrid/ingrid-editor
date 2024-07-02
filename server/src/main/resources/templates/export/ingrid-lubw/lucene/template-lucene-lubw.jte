@import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.tranformer.IngridModelTransformerLubw
@import gg.jte.support.ForSupport
@import java.util.Map
@param Map<String, Object> map

!{var page = ((IngridModelTransformerLubw)map.get("model"));}


@template.export.ingrid.lucene.template-lucene(map = map, extraFields = @`
,
    "distributor": "${page.getDistributor()}",
    "object_node.tree_path.name": [
    @for(var entry : ForSupport.of(page.getTreePathNames()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "object_node.tree_path.uuid": [
    @for(var entry : ForSupport.of(page.getTreePathUuids()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ]
`)
