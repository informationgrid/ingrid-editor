@import de.ingrid.igeserver.profiles.uvp.exporter.DocInfo
@import de.ingrid.igeserver.profiles.uvp.exporter.model.Document
@import java.util.List
@import java.util.stream.Collectors

@param String type
@param List<Document> docs
@param DocInfo docInfo

@if (docs != null)
    !{var notExpiredDocs = docs.stream().filter(Document::isNotExpired).collect(Collectors.toList());}
    @if (!notExpiredDocs.isEmpty())
        <docs type="${type}">
            @for(Document doc : notExpiredDocs)
                <doc>
                    !{
                        var link = doc.getDownloadURL().getAsLink() 
                            ? doc.getDownloadURL().getUri() 
                            : docInfo.getExternalUrl() + docInfo.getCatalogId() + "/" + docInfo.getUuid() + "/" + doc.getDownloadURL().getUriEncoded();  
                    }
                    <link>${link}</link>
                    <label>${doc.getTitle()}</label>
                </doc>
            @endfor
        </docs>
    @endif
@endif