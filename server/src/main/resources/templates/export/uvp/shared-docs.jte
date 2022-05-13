@import de.ingrid.igeserver.profiles.uvp.exporter.model.Document
@import java.util.List
@import java.util.stream.Collectors

@param String type
@param List<Document> docs

@if (docs != null)
    !{var notExpiredDocs = docs.stream().filter(Document::isNotExpired).collect(Collectors.toList());}

    @if (!notExpiredDocs.isEmpty())
        <docs type="${type}">
            @for(Document doc : notExpiredDocs)
                <doc>
                    <link>${doc.link}</link>
                    <label>${doc.getTitle()}</label>
                </doc>
            @endfor
        </docs>
    @endif
@endif