@import gg.jte.Content;

@param Content content
@param String abstract_text = null
@param String idfTag = "idfMdMetadata"
@param Content idfAdditionalAttributes = @``
<idf:html xmlns:idf="http://www.portalu.de/IDF/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" idf-version="3.6.1"
          xsi:schemaLocation="http://www.portalu.de/IDF/1.0 ingrid_detail_data_schema.xsd">
    <idf:head/>
    <idf:body>
        <idf:${idfTag} ${idfAdditionalAttributes} xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:gmx="http://www.isotc211.org/2005/gmx" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:igctx="https://www.ingrid-oss.eu/schemas/igctx" xsi:schemaLocation="http://www.isotc211.org/2005/gmd http://repository.gdi-de.org/schemas/geonetwork/2020-12-11/csw/2.0.2/profiles/apiso/1.0.1/apiso.xsd https://www.ingrid-oss.eu/schemas/igctx https://www.ingrid-oss.eu/schemas/igctx/igctx.xsd">
            ${content}
            @if(abstract_text != null)
                <idf:abstract>
                    <gco:CharacterString>${abstract_text}</gco:CharacterString>
                </idf:abstract>
            @endif
        </idf:${idfTag}>
    </idf:body>
</idf:html>
