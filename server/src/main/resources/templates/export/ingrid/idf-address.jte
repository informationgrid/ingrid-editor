@import de.ingrid.igeserver.exporter.AddressModelTransformer

@import java.util.List
@import java.util.Map

@param Map<String, Object> map

!{var page = ((AddressModelTransformer)map.get("model"));}
@template.template-idf(
idfTag = "idfResponsibleParty",
idfAdditionalAttributes = @`type="${page.getAddressDocType()}" uuid="${page.getUuid()}"`,
content = @`
    @template.ingrid.pointOfContact(
    addresses = List.of(page),
    isAddressExport = true,
    )
`)
