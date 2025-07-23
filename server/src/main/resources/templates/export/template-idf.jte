@import gg.jte.Content;

@param Content content
@param String abstract_text = null
@param String idfTag = "idfMdMetadata"
@param Content idfAdditionalAttributes = @``
<idf:html xmlns:idf="http://www.portalu.de/IDF/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" idf-version="3.6.1"
          xsi:schemaLocation="http://www.portalu.de/IDF/1.0 ingrid_detail_data_schema.xsd">
    <idf:head/>
    <idf:body>
        <idf:${idfTag} ${idfAdditionalAttributes} xmlns:gco="http://www.isotc211.org/2005/gco"
        >
            ${content}
            @if(abstract_text != null)
                <idf:abstract>
                    <gco:CharacterString>${abstract_text}</gco:CharacterString>
                </idf:abstract>
            @endif
        </idf:${idfTag}>
    </idf:body>
</idf:html>
