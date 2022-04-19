@import de.ingrid.igeserver.profiles.uvp.exporter.model.Document
@import java.util.List

@param String type
@param List<Document> docs

@if (!docs.isEmpty())
    <docs type="${type}">
        @for(Document doc : docs)
            <doc>
                <link>${doc.link}</link>
                <label>${doc.getTitle()}</label>
            </doc>
        @endfor
    </docs>
@endif