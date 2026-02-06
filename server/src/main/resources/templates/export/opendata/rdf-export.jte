@import de.ingrid.igeserver.profiles.opendata.exporter.OpenDataRDFTransformer
@import gg.jte.support.ForSupport
@import java.util.Map

@param Map<String, Object> map

!{var model = ((OpenDataRDFTransformer)map.get("model"));}
<?xml version='1.0' encoding='UTF-8'?>
<rdf:RDF
        xmlns:adms="http://www.w3.org/ns/adms#"
        xmlns:dcat="http://www.w3.org/ns/dcat#"
        xmlns:dcatde="http://dcat-ap.de/def/dcatde/"
        xmlns:dcatap="http://data.europa.eu/r5r/"
        xmlns:dcterms="http://purl.org/dc/terms/"
        xmlns:foaf="http://xmlns.com/foaf/0.1/"
        xmlns:gml="http://www.opengis.net/gml/3.2"
        xmlns:locn="http://www.w3.org/ns/locn#"
        xmlns:odrs="http://schema.theodi.org/odrs#"
        xmlns:owl="http://www.w3.org/2002/07/owl#"
        xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
        xmlns:schema="http://schema.org/"
        xmlns:skos="http://www.w3.org/2004/02/skos/core#"
        xmlns:vcard="http://www.w3.org/2006/vcard/ns#"
        xmlns:hydra="http://www.w3.org/ns/hydra/core#">
    <dcat:Catalog rdf:about="${model.getAppUrl()}">
        <dcat:dataset rdf:resource="${model.getAppUrl()}/exporter/datasets/2b9db5fc-024f-48ac-984b-fe3c53c2d26e" />
        <dcterms:description xml:lang="de">${model.getCatalogDescription()}</dcterms:description>
        <dcterms:publisher>
            <foaf:Agent rdf:about="${model.getAppUrl()}/#publisher">
                <foaf:name>OpenData</foaf:name>
            </foaf:Agent>
        </dcterms:publisher>
        <dcterms:title xml:lang="de">${model.getCatalogTitle()}</dcterms:title>
        <foaf:homepage rdf:resource="${model.getAppUrl()}" />
    </dcat:Catalog>
    <dcat:Dataset rdf:about="${model.getAppUrl()}/exporter/datasets/2b9db5fc-024f-48ac-984b-fe3c53c2d26e">
        <dcterms:description>${model.getDescription()}</dcterms:description>
        <dcterms:title>${model.getTitle()}</dcterms:title>
        <dcatde:contributorID rdf:resource="http://dcat-ap.de/def/contributors/openDataBund" />
        @for(var distribution : model.getDistributions())
            <dcat:distribution rdf:resource="${model.getUploadUrl()}/${distribution.getAccessURL()}#distribution" />
        @endfor
        <dcterms:publisher>
            <foaf:Agent>
                <foaf:name>${model.getPublisher()}</foaf:name>
            </foaf:Agent>
        </dcterms:publisher>
        @if (model.getCreator() != null)
            <dcterms:creator>
                <foaf:Organization>
                    <foaf:name>${model.getCreator()}</foaf:name>
                </foaf:Organization>
            </dcterms:creator>
        @endif
        <dcterms:identifier>${model.getUuid()}</dcterms:identifier>
        <dcterms:issued rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${model.getIssued()}</dcterms:issued>
        <dcterms:modified
                rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${model.getModified()}</dcterms:modified>
        @for (var theme : model.getThemes())
            <dcat:theme rdf:resource="${theme}" />
        @endfor
    </dcat:Dataset>
    @for(var distribution : model.getDistributions())
        <dcat:Distribution rdf:about="${model.getUploadUrl()}/${distribution.getAccessURL()}#distribution">
            <dcat:accessURL rdf:resource="${model.getUploadUrl()}/${distribution.getAccessURL()}" />
            @if(distribution.getLicense() != null)
                <dcterms:license rdf:resource="${distribution.getLicense().getUrl()}" />
            @endif
            <dcterms:format
                    rdf:resource="http://publications.europa.eu/resource/authority/file-type/${distribution.getFormat()}" />
            <dcterms:description>${distribution.getDescription()}</dcterms:description>
            <dcat:downloadURL rdf:resource="${model.getUploadUrl()}/${distribution.getAccessURL()}" />
            <dcterms:title>${distribution.getTitle()}</dcterms:title>
            <dcterms:modified
                    rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${distribution.getModified()}</dcterms:modified>
            @for(var lang : distribution.getLanguages())
                <dcterms:language rdf:resource="http://publications.europa.eu/resource/authority/language/${lang}" />
            @endfor
        </dcat:Distribution>
    @endfor
</rdf:RDF>
