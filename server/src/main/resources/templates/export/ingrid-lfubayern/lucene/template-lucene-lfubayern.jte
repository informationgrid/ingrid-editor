@import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.internal.IngridModelTransformerLfub
@import gg.jte.support.ForSupport
@import java.util.Map
@param Map<String, Object> map

!{var page = ((IngridModelTransformerLfub)map.get("model"));}


@template.export.ingrid.lucene.template-lucene(map = map, extraFields = @`
,
    "object_node.tree_path.name": [
    @for(var entry : ForSupport.of(page.getTreePathNames()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ]
`)
