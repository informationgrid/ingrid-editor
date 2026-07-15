@import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.tranformer.Attribute
@import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.tranformer.GeodatasetTransformerLubw
@import java.util.Map
@param Map<String, Object> map

!{var page = ((GeodatasetTransformerLubw)map.get("model"));}


@template.export.ingrid.idf.idf-geodataset(map = map, extraContent = @`
    @for (Attribute attr : page.getObjectAttributes())
        <idf:objectAttribute>
            <idf:group>${attr.getGroup()}</idf:group>
            <idf:designation>${attr.getDesignation()}</idf:designation>
            <idf:description>${attr.getDescription()}</idf:description>
            <idf:category>${attr.getCategory()}</idf:category>
            <idf:transmissionLevel>${attr.getTransmissionLevel()}</idf:transmissionLevel>
        </idf:objectAttribute>
    @endfor
`)
