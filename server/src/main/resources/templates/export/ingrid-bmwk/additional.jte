@import de.ingrid.igeserver.profiles.ingrid_bmwk.exporter.BMWKModelTransformer
@import de.ingrid.igeserver.profiles.ingrid_bmwk.exporter.Distribution
@import java.util.Map

@param Map<String, Object> map

!{var page = ((BMWKModelTransformer)map.get("model"));}

@for(Distribution item : page.getDistributions())
    <idf:distribution>
        <idf:format>${item.getFormat()}</idf:format>
        <idf:accessURL>${item.getAccessURL()}</idf:accessURL>
        <idf:modified>${item.getModified()}</idf:modified>
        <idf:title>${item.getTitle()}</idf:title>
        <idf:description>${item.getDescription()}</idf:description>
        @if(item.getLicense() != null)
            <idf:license key="${item.getLicense().getUrl()}">${item.getLicense().getName()}</idf:license>
        @endif
        <idf:byClause>${item.getByClause()}</idf:byClause>
        <idf:languages>
            @for(String language : item.getLanguages())
                <idf:language>${language}</idf:language>
            @endfor
        </idf:languages>
        <idf:availability>${item.getAvailability()}</idf:availability>
    </idf:distribution>
@endfor