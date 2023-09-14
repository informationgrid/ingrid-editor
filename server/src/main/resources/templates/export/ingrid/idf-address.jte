@import de.ingrid.igeserver.exporter.AddressModelTransformer

@import java.util.List
@import java.util.Map

@param Map<String, Object> map

!{var page = ((AddressModelTransformer)map.get("model"));}

@template.template-idf(content = @`
    @template.ingrid.pointOfContact(addresses = List.of(page))
`)
