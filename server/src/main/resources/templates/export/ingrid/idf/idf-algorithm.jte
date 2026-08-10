@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid.exporter.AlgorithmModelTransformer
@import gg.jte.Content
@import java.util.Map

@param Map<String, Object> map
@param Content additionalIdentification

!{var page = ((AlgorithmModelTransformer)map.get("model"));}
@template.export.template-idf(content = @`
    @template.export.ingrid.idf.shared-general(page = page, additionalIdentification = additionalIdentification)
`, abstract_text = page.getDescription())
