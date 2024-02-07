@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import java.util.Map

@param Map<String, Object> map

!{var page = ((IngridModelTransformer)map.get("model"));}
@template.export.template-idf(content = @`
    @template.export.ingrid.shared-general(page = page)
`, abstract_text = page.getDescription())
