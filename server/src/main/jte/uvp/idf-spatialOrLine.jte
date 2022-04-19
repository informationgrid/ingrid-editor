@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPNumber

@param UVPModel page

<idf:html xmlns:idf="http://www.portalu.de/IDF/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.portalu.de/IDF/1.0 ingrid_detail_data_schema.xsd">
    <idf:head/>
    <idf:body>
        <idf:idfMdMetadata>
            @template.uvp.shared-general(page = page)
            <uvpgs>
                @for(UVPNumber uvpNumber : page.getUvpNumbers())
                    <uvpg category="${uvpNumber.getCategory()}"
                          type="${uvpNumber.getType()}">${uvpNumber.getUvpg()}</uvpg>
                @endfor
            </uvpgs>
            @template.uvp.shared-steps(page = page)
        </idf:idfMdMetadata>
    </idf:body>
</idf:html>