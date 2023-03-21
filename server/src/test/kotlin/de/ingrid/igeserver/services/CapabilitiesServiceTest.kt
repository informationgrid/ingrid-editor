package de.ingrid.igeserver.services

import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.services.getCapabilities.*
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import java.text.SimpleDateFormat
import javax.xml.XMLConstants
import javax.xml.parsers.DocumentBuilderFactory

class CapabilitiesServiceTest : ShouldSpec({

    val codelistHandler = mockk<CodelistHandler>()
    lateinit var factory: GetCapabilitiesParserFactory

    val formatter = SimpleDateFormat("yyyy-MM-dd")

    beforeAny {
        val codelists = CodeListService().initialCodelists
        factory = GetCapabilitiesParserFactory(codelistHandler)
//        every { codelistHandler.getCodelistValue("5153", "de") } returns "3068"
        every { codelistHandler.getCodelistValue(any(), any()) } answers {
            codelists
                .find { it.id == firstArg() }
                ?.entries
                ?.find { it.id == secondArg() }
                ?.getField("de")
        }

        every { codelistHandler.getCodelists(any()) } answers {
            codelists.filter { it.id in firstArg() as List<String> }
        }

        every { codelistHandler.getCodeListEntryId(any(), any(), any()) } answers {
            codelists.find { it.id == firstArg() }
                ?.entries
                ?.find { it.getField(thirdArg()) == secondArg() }
                ?.id
        }
    }

    should("WFS 2.0.0") {
        getDocument("wfs200.xml").let {
            val result = factory.get(it).getCapabilitiesData(it)
            result.run {
                title shouldBe "Download Service Stolpersteine Stadt Moers"
                description shouldBe "Die Stolpersteine sind im Boden verlegte kleine Gedenktafeln, die an Menschen erinnern, welche in der Zeit des Nationalsozialismus verfolgt, ermordet, deportiert, vertrieben oder in den Suizid getrieben wurden. Der Dienst zeigt die Stolpersteine, die bis jetzt in der Stadt Viersen verlegt wurden. Die Daten werden bei Bedarf aktualisiert."
                keywords shouldContainExactly listOf("Nordrhein-Westfalen", "Moers", "Gedenken", "Kultur")
                serviceType shouldBe "WFS"
                dataServiceType shouldBe "3"
                versions shouldContainExactly listOf(KeyValue("2", "OGC:WFS 2.0"), KeyValue("1", "OGC:WFS 1.1.0"))
                fees shouldBe KeyValue(
                    "25",
                    "Datenlizenz Deutschland – Zero – Version 2.0 (https://www.govdata.de/dl-de/zero-2-0)"
                )
                accessConstraints shouldContainExactly listOf(KeyValue(null, "Es gelten keine Beschränkungen."))
                boundingBoxes shouldContainExactly listOf(
                    LocationBean(
                        5.837082,
                        51.102686,
                        7.045330,
                        51.946050,
                        "gis:moer_stolpersteine",
                        "frei"
                    )
                )
                spatialReferenceSystems shouldContainExactly listOf(
                    KeyValue("25832", "EPSG 25832: ETRS89 / UTM Zone 32N"),
                    KeyValue("3035", "EPSG 3035: ETRS89 / LAEA Europa"),
                    KeyValue("3857", "EPSG 3857: WGS 84 / Pseudo-Mercator"),
                    KeyValue(null, "urn:ogc:def:crs:EPSG::5554"),
                )
                address shouldBe AddressBean(
                    firstName = "",
                    lastName = "KRZN",
                    email = "ksc@krzn.de",
                    street = "Friedrich-Heinrich-Allee 130",
                    city = "Kamp-Lintfort",
                    postcode = "47475",
                    country = "Germany",
                    state = "NRW",
                    phone = "+49(0)2842/9070-110"
                )
                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf("https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?"),
                        listOf(7),
                        "GetCapabilities",
                        "GetCapabilities"
                    ),
                    OperationBean(
                        listOf(
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?",
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine"
                        ), listOf(7, 8), "DescribeFeatureType", "DescribeFeatureType"
                    ),
                    OperationBean(
                        listOf(
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?",
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine"
                        ), listOf(7, 8), "GetFeature", "GetFeature"
                    )
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "https://geoservices.krzn.de",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                timeSpans shouldBe emptyList()
                conformities shouldBe emptyList()
                resourceLocators shouldBe emptyList()
                timeReference shouldBe emptyList()
            }
        }
    }

    should("WMS 1.1.1") {
        getDocument("wms111.xml").let {
            val result = factory.get(it).getCapabilitiesData(it)
            result.run {
                title shouldBe "Acme Corp. Map Server"
                description shouldBe "WMT Map Server maintained by Acme Corporation.  Contact: webmaster@wmt.acme.com.  High-quality maps showing roadrunner nests and possible ambush locations."
                keywords shouldContainExactly listOf(
                    "bird", "roadrunner", "ambush", "road", "transportation", "atlas", "river", "canal", "waterway"
                )
                serviceType shouldBe "WMS"
                dataServiceType shouldBe "2"
                versions shouldContainExactly listOf(KeyValue("1", "OGC:WMS 1.1.1"))
                fees shouldBe KeyValue(null, "none")
                accessConstraints shouldContainExactly listOf(KeyValue(null, "none"))

                /* TODO: coupledResources shouldContainExactly listOf(
                    GeoDataset(null, "123456"),
                    GeoDataset(null, "78910")
                )*/

                /*assertThat(result.getCoupledResources().get(0).getRef1ObjectIdentifier(), is("123456"));
                assertThat(result.getCoupledResources().get(0).getThesaurusTermsTable().size(), is(3));
                assertThat(result.getCoupledResources().get(0).getThesaurusTermsTable().get(0).getTitle(), is("bird"));
                assertThat(result.getCoupledResources().get(0).getThesaurusTermsTable().get(1).getTitle(), is("roadrunner"));
                assertThat(result.getCoupledResources().get(0).getThesaurusTermsTable().get(2).getTitle(), is("ambush"));
                assertThat(result.getCoupledResources().get(1).getRef1ObjectIdentifier(), is("78910"));
                assertThat(result.getCoupledResources().get(1).getThesaurusTermsTable().size(), is(6));
                assertThat(result.getCoupledResources().get(1).getThesaurusTermsTable().get(0).getTitle(), is("road"));
                assertThat(result.getCoupledResources().get(1).getThesaurusTermsTable().get(1).getTitle(), is("transportation"));
                assertThat(result.getCoupledResources().get(1).getThesaurusTermsTable().get(2).getTitle(), is("atlas"));
                assertThat(result.getCoupledResources().get(1).getThesaurusTermsTable().get(3).getTitle(), is("bird"));
                assertThat(result.getCoupledResources().get(1).getThesaurusTermsTable().get(4).getTitle(), is("roadrunner"));
                assertThat(result.getCoupledResources().get(1).getThesaurusTermsTable().get(5).getTitle(), is("ambush"));*/

                /*boundingBoxes shouldContainExactly listOf(
                    LocationBean(
                        -180.0,
                        -90.0,
                        180.0,
                        90.0,
                        "Raumbezug von: Acme Corp. Map Server",
                        "frei"
                    )
                )*/
                spatialReferenceSystems shouldContainExactly listOf(
                    KeyValue(null, "EPSG:26986"),
                    KeyValue("4326", "EPSG 4326: WGS 84 / geographisch")
                )
                address shouldBe AddressBean(
                    firstName = "Jeff",
                    lastName = "deLaBeaujardiere",
                    email = "delabeau@iniki.gsfc.nasa.gov",
                    organization = "NASA",
                    street = "NASA Goddard Space Flight Center, Code 933",
                    city = "Greenbelt",
                    postcode = "20771",
                    country = "USA",
                    state = "MD",
                    phone = "+1 301 286-1569"
                )
                operations?.shouldHaveSize(3)
                operations shouldContainExactly listOf(
                    OperationBean(listOf("http://hostname:port/path"), listOf(7), "GetCapabilities", "GetCapabilities"),
                    OperationBean(listOf("http://hostname:port/path"), listOf(7), "GetMap", "GetMap"),
                    OperationBean(listOf("http://hostname:port/path"), listOf(7), "GetFeatureInfo", "GetFeatureInfo"),
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "http://hostname/",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                timeSpans shouldBe emptyList()
                /*conformities shouldBe listOf(
                    ConformityBean(
                        level = 3,
                        specification = "Verordening (EG) nr. 976/2009 van de Commissie van 19 oktober 2009 tot uitvoering van Richtlijn 2007/2/EG van het Europees Parlement en de Raad wat betreft de netwerkdiensten"
                    )
                )*/
                /*resourceLocators shouldBe listOf(
                    UrlBean(
                        url = "http://ogc.beta.agiv.be/ogc/wms/vrbgINSP?",
                        type = KeyValue("5066", "Verweis zu Dienst")
                    )
                )*/
                /*timeReference shouldBe listOf(
                    TimeReferenceBean(1, formatter.parse("2003-01-01")),
                    TimeReferenceBean(2, formatter.parse("2003-05-10"))
                )*/
            }
        }
    }

    should("WMS 1.3.0") {
        getDocument("wms130.xml").let {
            val result = factory.get(it).getCapabilitiesData(it)
            result.run {
                title shouldBe "Acme Corp. Map Server"
                description shouldBe "Map Server maintained by Acme Corporation. Contact: webmaster@wmt.acme.com. High-quality\n            maps showing\n            roadrunner nests and possible ambush locations.\n        "
                keywords shouldContainExactly listOf(
                    "Administratieveeenheden",
                    "boundaries",
                    "bird",
                    "roadrunner",
                    "ambush",
                    "road",
                    "transportation",
                    "atlas",
                    "river",
                    "canal",
                    "waterway"
                )
                serviceType shouldBe "WMS"
                dataServiceType shouldBe "2"
                versions shouldContainExactly listOf(KeyValue("2", "OGC:WMS 1.3.0"))
                fees shouldBe KeyValue(null, "none")
                accessConstraints shouldContainExactly listOf(KeyValue(null, "none"))
                boundingBoxes shouldContainExactly listOf(
                    LocationBean(
                        -180.0,
                        -90.0,
                        180.0,
                        90.0,
                        "Raumbezug von: Acme Corp. Map Server",
                        "frei"
                    )
                )
                spatialReferenceSystems shouldContainExactly listOf(
                    KeyValue("84", "CRS 84: CRS 84 / mathematisch"),
                    KeyValue("4230", "EPSG 4230: ED50 / geographisch")
                )
                coupledResources shouldContainExactly listOf(
                    GeoDataset(null, "123456", "Roads and Rivers", listOf(LocationBean(-71.63, 41.75, -70.78, 42.9, "ROADS_RIVERS", "frei")), spatialSystems=listOf(KeyValue(null, "EPSG:26986"), KeyValue("84", "CRS 84: CRS 84 / mathematisch"), KeyValue("4230", "EPSG 4230: ED50 / geographisch"))),
                    GeoDataset(null, "78910", "Roads at 1:1M scale", listOf(LocationBean(-180.0, -90.0, 180.0, 90.0, "Raumbezug von: Acme Corp. Map Server", "frei")), description="Roads at a scale of 1 to 1 million.", spatialSystems=listOf(KeyValue("84", "CRS 84: CRS 84 / mathematisch"), KeyValue("4230", "EPSG 4230: ED50 / geographisch")))
                )
                address shouldBe AddressBean(
                    firstName = "Jeff",
                    lastName = "Smith",
                    email = "user@host.com",
                    organization = "NASA",
                    street = "NASA Goddard Space Flight Center",
                    city = "Greenbelt",
                    postcode = "20771",
                    country = "USA",
                    state = "MD",
                    phone = "+1 301 555-1212"
                )
                operations shouldContainExactly listOf(
                    OperationBean(listOf("http://hostname/path?"), listOf(7), "GetCapabilities", "GetCapabilities"),
                    OperationBean(listOf("http://hostname/path?"), listOf(7), "GetMap", "GetMap"),
                    OperationBean(listOf("http://hostname/path?"), listOf(7), "GetFeatureInfo", "GetFeatureInfo"),
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "http://hostname/my-online-resource",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                timeSpans shouldBe emptyList()
                conformities shouldBe listOf(
                    ConformityBean(
                        level = 3,
                        specification = "Verordening (EG) nr. 976/2009 van de Commissie van 19 oktober 2009 tot uitvoering van Richtlijn 2007/2/EG van het Europees Parlement en de Raad wat betreft de netwerkdiensten"
                    )
                )
                resourceLocators shouldBe listOf(
                    UrlBean(
                        url = "http://ogc.beta.agiv.be/ogc/wms/vrbgINSP?",
                        type = KeyValue("5066", "Verweis zu Dienst")
                    )
                )
                timeReference shouldBe listOf(
                    TimeReferenceBean(1, formatter.parse("2003-01-01")),
                    TimeReferenceBean(2, formatter.parse("2003-05-10"))
                )
            }
        }
    }

    should("WCS 1.0.0") {
        getDocument("wcs100.xml").let {
            val result = factory.get(it).getCapabilitiesData(it)
            result.run {
                title shouldBe "deegree WCS"
                description shouldBe "deegree WCS being OGC WCS 1.0.0 reference implementation"
                keywords shouldContainExactly listOf(
                    "deegree", "DGM", "DGM25"
                )
                serviceType shouldBe "WCS"
                dataServiceType shouldBe "3"
                versions shouldContainExactly listOf(KeyValue(null, "OGC:WCS 1.0.0"))
                fees shouldBe KeyValue(null, "NONE")
                accessConstraints shouldContainExactly listOf(KeyValue(null, "NONE"), KeyValue(null, "SOME"))
                /*
                                boundingBoxes shouldContainExactly listOf(
                                    LocationBean(
                                        -180.0,
                                        -90.0,
                                        180.0,
                                        90.0,
                                        "Raumbezug von: Acme Corp. Map Server",
                                        "frei"
                                    )
                                )
                */
                /*spatialReferenceSystems shouldContainExactly listOf(
                    KeyValue("84", "CRS 84: CRS 84 / mathematisch"),
                    KeyValue("4230", "EPSG 4230: ED50 / geographisch")
                )*/
                address shouldBe AddressBean(
                    firstName = "Dr. Manfred",
                    lastName = "Endrullis",
                    organization = "BKG",
                    city = "Potsdam",
                    postcode = "14777",
                    country = "DE",
                    state = "Brandenburg",
                    phone = "+49 341 5634369"
                )

                operations?.shouldHaveSize(3)
                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf(
                            "http://localhost:8080/wpvs/services?",
                            "http://localhost:8080/wpvs/services?"
                        ), listOf(7, 8), "GetCapabilities", "GetCapabilities"
                    ),
                    OperationBean(
                        listOf(
                            "http://localhost:8080/wpvs/services?",
                            "http://localhost:8080/wpvs/services?"
                        ), listOf(7, 8), "DescribeCoverage", "DescribeCoverage"
                    ),
                    OperationBean(
                        listOf(
                            "http://localhost:8080/wpvs/services?",
                            "http://localhost:8080/wpvs/services?"
                        ), listOf(7, 8), "GetCoverage", "GetCoverage"
                    ),
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "http://www.geodatenzentrum.de",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                /*timeSpans shouldBe emptyList()
                conformities shouldBe listOf(
                    ConformityBean(
                        level = 3,
                        specification = "Verordening (EG) nr. 976/2009 van de Commissie van 19 oktober 2009 tot uitvoering van Richtlijn 2007/2/EG van het Europees Parlement en de Raad wat betreft de netwerkdiensten"
                    )
                )
                resourceLocators shouldBe listOf(
                    UrlBean(
                        url = "http://ogc.beta.agiv.be/ogc/wms/vrbgINSP?",
                        type = KeyValue("5066", "Verweis zu Dienst")
                    )
                )
                timeReference shouldBe listOf(
                    TimeReferenceBean(1, formatter.parse("2003-01-01")),
                    TimeReferenceBean(2, formatter.parse("2003-05-10"))
                )*/
            }
        }
    }
})

fun getDocument(name: String): Document {
    val reader = InputStreamReader(
        CapabilitiesServiceTest::class.java.getResourceAsStream("/getCapabilitites/$name")!!,
        StandardCharsets.UTF_8
    )

    return DocumentBuilderFactory.newInstance().apply {
        isNamespaceAware = true
        setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)
        setFeature("http://xml.org/sax/features/external-general-entities", false)
        setFeature("http://xml.org/sax/features/external-parameter-entities", false)
        setFeature("http://apache.org/xml/features/nonvalidating/load-dtd-grammar", false)
        setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false)
    }.newDocumentBuilder().parse(InputSource(reader))
}
