@import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel

@param IngridModel page
<gmd:fileIdentifier>
    <gco:CharacterString>${page.getUuid()}</gco:CharacterString>
</gmd:fileIdentifier>
<gmd:language>
    <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/" codeListValue="ger"/>
</gmd:language>
