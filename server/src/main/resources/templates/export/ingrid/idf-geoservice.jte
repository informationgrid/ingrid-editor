@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import java.util.Map

@param Map<String, Object> map

!{var page = ((IngridModelTransformer)map.get("model"));}

@template.template-idf(content = @`
    @template.ingrid.shared-general(page = page)
`, abstract_text = page.getDescription())
