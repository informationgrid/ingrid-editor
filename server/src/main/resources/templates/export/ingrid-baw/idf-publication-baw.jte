@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.PublicationModelTransformerBaw
@import java.util.Map
@param Map<String, Object> map

!{var page = ((PublicationModelTransformerBaw)map.get("model"));}


@template.export.ingrid.idf.idf-publication(map = map, additionalCitation = @`
    @for( String handle : page.getHandles())
        <gmd:identifier>
            <gmd:MD_Identifier>
                <gmd:code>
                    <gco:CharacterString>${handle}</gco:CharacterString>
                </gmd:code>
            </gmd:MD_Identifier>
        </gmd:identifier>
    @endfor
`,
)
