@import gg.jte.Content

@param Content content

<idf:html xmlns:idf="http://www.portalu.de/IDF/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.portalu.de/IDF/1.0 ingrid_detail_data_schema.xsd">
    <idf:head/>
    <idf:body>
        <idf:idfMdMetadata>
            ${content}
        </idf:idfMdMetadata>
    </idf:body>
</idf:html>