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
        <dcat:landingPage>${model.getLandingPage()}</dcat:landingPage>
        <dcatde:contributorID rdf:resource="http://dcat-ap.de/def/contributors/openDataBund" />
        @for(var distribution : model.getDistributions())
            <dcat:distribution rdf:resource="${model.getUploadUrl()}/${distribution.getAccessURL()}#distribution" />
        @endfor
        <dcterms:publisher>
            @template.export.opendata.rdf-address(address = model.getPublisher())
        </dcterms:publisher>
        @if (model.getCreator() != null)
            <dcterms:creator>
                @template.export.opendata.rdf-address(address = model.getCreator())
            </dcterms:creator>
        @endif
        @if (model.getPointOfContact() != null)
            <dcat:contactPoint>
                @template.export.opendata.rdf-address(address = model.getPointOfContact())
            </dcat:contactPoint>
        @endif
        @if (model.getOriginator() != null)
            <dcterms:originator>
                @template.export.opendata.rdf-address(address = model.getOriginator())
            </dcterms:originator>
        @endif
        @if (model.getMaintainer() != null)
            <dcterms:maintainer>
                @template.export.opendata.rdf-address(address = model.getMaintainer())
            </dcterms:maintainer>
        @endif
        <dcterms:identifier>${model.getUuid()}</dcterms:identifier>
        @if (!model.getQualityProcessURI().isEmpty())
            <dcatde:qualityProcessURI rdf:resource="${model.getQualityProcessURI()}" />
        @endif
        @if (model.getAccrualPeriodicity() != null)
            <dcterms:accrualPeriodicity rdf:resource="${model.getAccrualPeriodicity()}" />
        @endif
        @if (model.getTemporalResolution() != null)
            <dcat:temporalResolution
                    rdf:datatype="http://www.w3.org/2001/XMLSchema#duration">${model.getTemporalResolution()}</dcat:temporalResolution>
        @endif
        @if (!model.getLegalBasis().isEmpty())
            <dcatde:legalBasis xml:lang="de">${model.getLegalBasis()}</dcatde:legalBasis>
        @endif
        <dcterms:issued rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${model.getIssued()}</dcterms:issued>
        <dcterms:modified
                rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${model.getModified()}</dcterms:modified>
        @for (var theme : model.getThemes())
            <dcat:theme rdf:resource="${theme}" />
        @endfor
        @for (var keyword : model.getKeywords())
            <dcat:keyword>${keyword}</dcat:keyword>
        @endfor
        @for (var spatial : model.getSpatials())
            <dcterms:spatial>
                <dcterms:Location>
                    @if ("free".equals(spatial.getType()) && spatial.getValue() != null)
                        <locn:geometry rdf:datatype="http://www.opengis.net/ont/geosparql#wktLiteral">
                            POLYGON((${spatial.getValue().getLon1()} ${spatial.getValue().getLat1()}
                            , ${spatial.getValue().getLon2()} ${spatial.getValue().getLat1()}
                            , ${spatial.getValue().getLon2()} ${spatial.getValue().getLat2()}
                            , ${spatial.getValue().getLon1()} ${spatial.getValue().getLat2()}
                            , ${spatial.getValue().getLon1()} ${spatial.getValue().getLat1()}))
                        </locn:geometry>
                        <dcat:bbox rdf:datatype="http://www.opengis.net/ont/geosparql#wktLiteral">
                            POLYGON((${spatial.getValue().getLon1()} ${spatial.getValue().getLat1()}
                            , ${spatial.getValue().getLon2()} ${spatial.getValue().getLat1()}
                            , ${spatial.getValue().getLon2()} ${spatial.getValue().getLat2()}
                            , ${spatial.getValue().getLon1()} ${spatial.getValue().getLat2()}
                            , ${spatial.getValue().getLon1()} ${spatial.getValue().getLat1()}))
                        </dcat:bbox>
                    @elseif ("wkt".equals(spatial.getType()) && spatial.getWkt() != null)
                        <locn:geometry
                                rdf:datatype="http://www.opengis.net/ont/geosparql#wktLiteral">${spatial.getWkt()}</locn:geometry>
                        @if (spatial.getWktCoordinatesISO() != null)
                            <locn:geometry
                                    rdf:datatype="http://www.opengis.net/ont/geosparql#gmlLiteral">$unsafe{spatial.getWktCoordinatesISO()}</locn:geometry>
                        @endif
                    @endif
                    @if (spatial.getTitle() != null)
                        <skos:prefLabel>${spatial.getTitle()}</skos:prefLabel>
                    @endif
                </dcterms:Location>
            </dcterms:spatial>
        @endfor
        @if (model.getPoliticalGeocodingLevelKey() != null)
            <dcatde:politicalGeocodingLevelURI
                    rdf:resource="http://dcat-ap.de/def/politicalGeocoding/Level/${model.getPoliticalGeocodingLevelKey()}" />
        @endif
    </dcat:Dataset>
    @for(var distribution : model.getDistributions())
        <dcat:Distribution rdf:about="${model.getUploadUrl()}/${distribution.getAccessURL()}#distribution">
            <dcat:accessURL rdf:resource="${distribution.getAccessURL()}" />
            @if(distribution.getLicense() != null)
                <dcterms:license rdf:resource="${distribution.getLicense().getUrl()}" />
            @endif
            @if(!distribution.getByClause().isEmpty())
                <dcatde:licenseAttributionByText>${distribution.getByClause()}</dcatde:licenseAttributionByText>
            @endif
            <dcterms:format
                    rdf:resource="http://publications.europa.eu/resource/authority/file-type/${distribution.getFormat()}" />
            <dcterms:description>${distribution.getDescription()}</dcterms:description>
            <dcat:downloadURL rdf:resource="${distribution.getAccessURL()}" />
            <dcterms:title>${distribution.getTitle()}</dcterms:title>
            <dcterms:modified
                    rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${distribution.getModified()}</dcterms:modified>
            @for(var lang : distribution.getLanguages())
                <dcterms:language rdf:resource="http://publications.europa.eu/resource/authority/language/${lang}" />
            @endfor
            @if (!distribution.getAvailability().isEmpty())
                <dcatap:availability>${distribution.getAvailability()}</dcatap:availability>
            @endif
        </dcat:Distribution>
    @endfor
</rdf:RDF>
