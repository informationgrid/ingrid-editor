package de.ingrid.igeserver.services

import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.services.getCapabilities.*
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import java.text.SimpleDateFormat
import javax.xml.XMLConstants
import javax.xml.parsers.DocumentBuilderFactory

class CapabilitiesServiceTest : ShouldSpec({

    val codelistHandler = mockk<CodelistHandler>()
    val researchService = mockk<ResearchService>()
    val mockContext = mockk<SecurityContext>()
    lateinit var factory: GetCapabilitiesParserFactory

    val formatter = SimpleDateFormat("yyyy-MM-dd")

    beforeAny {
        val codelists = CodeListService().initialCodelists
        SecurityContextHolder.setContext(mockContext)
        every { mockContext.authentication } returns UsernamePasswordAuthenticationToken("test-user", "xxx")
        every { researchService.query(any(), any(), any(), any()) } returns ResearchResponse(0, emptyList())

        factory = GetCapabilitiesParserFactory(codelistHandler, researchService)
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

    should("WFS 1.1.0") {
        getDocument("wfs110.xml").let {
            val result = factory.get(it, "test").getCapabilitiesData(it)
            result.run {
                title shouldBe "WFS_Geotourismus"
                description shouldBe "Test WFS 1.1.0"
                keywords shouldContainExactly listOf()
                serviceType shouldBe "WFS"
                dataServiceType shouldBe "3"
                versions shouldContainExactly listOf(KeyValue("1", "OGC:WFS 1.1.0"))
                fees shouldBe null
                accessConstraints shouldContainExactly listOf()
                boundingBoxes shouldContainExactly listOf(
                    LocationBean(
                        latitude1 = 9.699866504129663,
                        longitude1 = 53.439818489782624,
                        latitude2 = 10.336552045994994,
                        longitude2 = 53.74180783201885,
                        name = "Landschaftsform",
                        type = "Frei"
                    ),
                    LocationBean(
                        latitude1 = 9.67106756436431,
                        longitude1 = 53.398214876212485,
                        latitude2 = 10.299690875096376,
                        longitude2 = 53.722265833076975,
                        name = "Bauwerke",
                        type = "Frei"
                    ),
                    LocationBean(
                        latitude1 = 10.113665839720433,
                        longitude1 = 53.39853422093119,
                        latitude2 = 10.19057884115737,
                        longitude2 = 53.65732655156777,
                        name = "Unsichtbares_Objekt",
                        type = "Frei"
                    ),
                    LocationBean(
                        latitude1 = 9.785231755556373,
                        longitude1 = 53.49550985433483,
                        latitude2 = 10.25634551900814,
                        longitude2 = 53.598858415633444,
                        name = "Sehenswerte_Objekte",
                        type = "Frei"
                    ),
                    LocationBean(
                        latitude1 = 9.67477416867641,
                        longitude1 = 53.420062317916845,
                        latitude2 = 10.344173832806435,
                        longitude2 = 53.7278730217161,
                        name = "Bergbau",
                        type = "Frei"
                    ),
                    LocationBean(
                        latitude1 = 9.787805791266315,
                        longitude1 = 53.39162268129673,
                        latitude2 = 10.407430505549277,
                        longitude2 = 53.7408895104767,
                        name = "Wasser_und_Wasserbau",
                        type = "Frei"
                    ),
                    LocationBean(
                        latitude1 = 9.734985189819458,
                        longitude1 = 53.39562626625244,
                        latitude2 = 10.27983875300683,
                        longitude2 = 53.70619674206265,
                        name = "GeologischeObjekte",
                        type = "Frei"
                    ),
                    LocationBean(
                        latitude1 = 9.798392734190172,
                        longitude1 = 53.420911680339664,
                        latitude2 = 10.002871458386743,
                        longitude2 = 53.59727214182555,
                        name = "Stein_und_Fels",
                        type = "Frei"
                    ),
                    LocationBean(
                        latitude1 = 9.76557384658799,
                        longitude1 = 53.402593848198485,
                        latitude2 = 10.302925462393098,
                        longitude2 = 53.72715089146115,
                        name = "Geotope",
                        type = "Frei"
                    )
                )
                spatialReferenceSystems shouldContainExactly listOf(
                    KeyValue("25832", "EPSG 25832: ETRS89 / UTM Zone 32N"),
                    KeyValue("4326", "EPSG 4326: WGS 84 / geographisch")
                )
                address shouldBe AddressBean(
                    _state = "W",
                    firstName = "Thomas",
                    lastName = "Eichhorn",
                    email = "gvgeoportal@gv.hamburg.de",
                    street = "Neuenfelder Straße 19",
                    city = "Hamburg",
                    postcode = "21109",
                    country = KeyValue("276", "Germany"),
                    state = KeyValue("7", "Hamburg"),
                    phone = "+49 40 42826 5450"
                )
                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf(
                            "http://gateway.hamburg.de/OGCFassade/HH_WFS_Geotourismus.aspx?",
                            "http://gateway.hamburg.de/OGCFassade/HH_WFS_Geotourismus.aspx"
                        ),
                        listOf(7, 8),
                        "GetCapabilities",
                        KeyValue("1", "GetCapabilities")
                    ),
                    OperationBean(
                        listOf(
                            "http://gateway.hamburg.de/OGCFassade/HH_WFS_Geotourismus.aspx?",
                            "http://gateway.hamburg.de/OGCFassade/HH_WFS_Geotourismus.aspx"
                        ), listOf(7, 8), "DescribeFeatureType", KeyValue("2", "DescribeFeatureType")
                    ),
                    OperationBean(
                        listOf(
                            "http://gateway.hamburg.de/OGCFassade/HH_WFS_Geotourismus.aspx?",
                            "http://gateway.hamburg.de/OGCFassade/HH_WFS_Geotourismus.aspx"
                        ), listOf(7, 8), "GetFeature", KeyValue("3", "GetFeature")
                    )
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "www.geoinfo.hamburg.de",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                timeSpan shouldBe null
                conformities shouldBe emptyList()
                resourceLocators shouldBe emptyList()
                timeReference shouldBe emptyList()
            }
        }
    }

    should("WFS 2.0.0") {
        getDocument("wfs200.xml").let {
            val result = factory.get(it, "test").getCapabilitiesData(it)
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
                    _state = "W",
                    firstName = "",
                    lastName = "KRZN",
                    email = "ksc@krzn.de",
                    street = "Friedrich-Heinrich-Allee 130",
                    city = "Kamp-Lintfort",
                    postcode = "47475",
                    country = KeyValue("276", "Germany"),
                    state = KeyValue(null, "NRW"),
                    phone = "+49(0)2842/9070-110"
                )
                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf(
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?",
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine"
                        ),
                        listOf(7, 8),
                        "GetCapabilities",
                        KeyValue("1", "GetCapabilities")
                    ),
                    OperationBean(
                        listOf(
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?",
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine"
                        ), listOf(7, 8), "DescribeFeatureType", KeyValue("2", "DescribeFeatureType")
                    ),
                    OperationBean(
                        listOf(
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?",
                            "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine"
                        ), listOf(7, 8), "GetFeature", KeyValue("3", "GetFeature")
                    )
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "https://geoservices.krzn.de",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                timeSpan shouldBe null
                conformities shouldBe emptyList()
                resourceLocators shouldBe emptyList()
                timeReference shouldBe emptyList()
            }
        }
    }

    should("WFS 2.0.0 full") {
        getDocument("wfs200full.xml").let {
            val result = factory.get(it, "test").getCapabilitiesData(it)
            result.run {
                title shouldBe "OGC Member WFS"
                description shouldBe "Web Feature Service maintained by NSDI data provider, serving FGDC framework layer XXX; contact Paul.Bunyon@BlueOx.org"
                keywords shouldContainExactly listOf(
                    "downloadMe",
                    "FGDC",
                    "NSDI",
                    "Framework Data Layer",
                    "BlueOx",
                    "forest",
                    "north",
                    "woods",
                    "arborial",
                    "diversity",
                    "lakes",
                    "boundaries",
                    "water",
                    "hydro"
                )
                serviceType shouldBe "WFS"
                dataServiceType shouldBe "2" // since SpatialDataServiceType is set
                versions shouldContainExactly listOf(KeyValue("2", "OGC:WFS 2.0"), KeyValue("1", "OGC:WFS 1.1.0"))
                fees shouldBe KeyValue(null, "NONE")
                accessConstraints shouldContainExactly listOf(KeyValue(null, "NONE"))
                boundingBoxes shouldContainExactly listOf(
                    LocationBean(
                        latitude1 = -180.0,
                        longitude1 = -90.0,
                        latitude2 = 180.0,
                        longitude2 = 90.0,
                        name = "The Great Northern Forest",
                        type = "frei"
                    ),
                    LocationBean(
                        latitude1 = -180.0,
                        longitude1 = -90.0,
                        latitude2 = 180.0,
                        longitude2 = 90.0,
                        name = "The Great Northern Lakes",
                        type = "frei"
                    )
                )
                spatialReferenceSystems shouldContainExactly listOf(
                    KeyValue(null, "urn:ogc:def:crs:EPSG::6269"),
                    KeyValue(null, "urn:ogc:def:crs:EPSG::32615"),
                    KeyValue(null, "urn:ogc:def:crs:EPSG::32616"),
                    KeyValue(null, "urn:ogc:def:crs:EPSG::32617"),
                    KeyValue(null, "urn:ogc:def:crs:EPSG::32618")
                )
                address shouldBe AddressBean(
                    _state = "W",
                    firstName = "Paul",
                    lastName = "Bunyon",
                    email = "Paul.Bunyon@BlueOx.org",
                    street = "North Country",
                    city = "Small Town",
                    postcode = "12345",
                    country = KeyValue(null, "USA"),
                    state = KeyValue(null, "Rural County"),
                    phone = "1.800.BIG.WOOD"
                )
                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf(
                            "http://www.BlueOx.org/wfs/wfs.cgi?",
                            "http://www.BlueOx.org/wfs/wfs.cgi"
                        ),
                        listOf(7, 8),
                        "GetCapabilities",
                        KeyValue("1", "GetCapabilities")
                    ),
                    OperationBean(
                        listOf(
                            "http://www.BlueOx.org/wfs/wfs.cgi?",
                            "http://www.BlueOx.org/wfs/wfs.cgi"
                        ), listOf(7, 8), "DescribeFeatureType", KeyValue("2", "DescribeFeatureType")
                    ),
                    OperationBean(
                        listOf(
                            "http://www.BlueOx.org/wfs/wfs.cgi?",
                            "http://www.BlueOx.org/wfs/wfs.cgi"
                        ), listOf(7, 8), "GetFeature", KeyValue("3", "GetFeature")
                    ),
                    OperationBean(
                        listOf(
                            "http://www.BlueOx.org/wfs/wfs.cgi?",
                            "http://www.BlueOx.org/wfs/wfs.cgi"
                        ), listOf(7, 8), "LockFeature", KeyValue("4", "LockFeature")
                    ),
                    OperationBean(
                        listOf(
                            "http://www.BlueOx.org/wfs/wfs.cgi"
                        ), listOf(8), "Transaction", KeyValue("5", "Transaction")
                    )
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "http://www.BlueOx.org/contactUs",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                timeSpan shouldBe null
                conformities shouldBe listOf(ConformityBean(3, "Please enter a title"))
                resourceLocators shouldBe listOf(
                    UrlBean(
                        "http://my-download-resource-locator",
                        KeyValue("5066", "Verweis zu Dienst")
                    )
                )
                timeReference shouldBe listOf(TimeReferenceBean(1, formatter.parse("2007-11-13")))
            }
        }
    }

    should("WMS 1.1.1") {
        getDocument("wms111.xml").let {
            val result = factory.get(it, "test").getCapabilitiesData(it)
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
                    _state = "W",
                    firstName = "Jeff",
                    lastName = "deLaBeaujardiere",
                    email = "delabeau@iniki.gsfc.nasa.gov",
                    organization = "NASA",
                    street = "NASA Goddard Space Flight Center, Code 933",
                    city = "Greenbelt",
                    postcode = "20771",
                    country = KeyValue(null, "USA"),
                    state = KeyValue(null, "MD"),
                    phone = "+1 301 286-1569"
                )
                operations?.shouldHaveSize(3)
                operations shouldContainExactly listOf(
                    OperationBean(listOf("http://hostname:port/path"), listOf(7), "GetCapabilities", KeyValue("1", "GetCapabilities")),
                    OperationBean(listOf("http://hostname:port/path"), listOf(7), "GetMap", KeyValue("2", "GetMap")),
                    OperationBean(listOf("http://hostname:port/path"), listOf(7), "GetFeatureInfo", KeyValue("3", "GetFeatureInfo")),
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "http://hostname/",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                timeSpan shouldBe null
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
            val result = factory.get(it, "test").getCapabilitiesData(it)
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
                    GeoDataset(
                        null,
                        "123456",
                        "Roads and Rivers",
                        listOf(LocationBean(-71.63, 41.75, -70.78, 42.9, "ROADS_RIVERS", "frei")),
                        spatialSystems = listOf(
                            KeyValue(null, "EPSG:26986"),
                            KeyValue("84", "CRS 84: CRS 84 / mathematisch"),
                            KeyValue("4230", "EPSG 4230: ED50 / geographisch")
                        ),
                        keywords = listOf("bird", "roadrunner", "ambush")
                    ),
                    GeoDataset(
                        null,
                        "78910",
                        "Roads at 1:1M scale",
                        listOf(
                            LocationBean(
                                -180.0,
                                -90.0,
                                180.0,
                                90.0,
                                "Raumbezug von: Acme Corp. Map Server",
                                "frei"
                            )
                        ),
                        description = "Roads at a scale of 1 to 1 million.",
                        spatialSystems = listOf(
                            KeyValue("84", "CRS 84: CRS 84 / mathematisch"),
                            KeyValue("4230", "EPSG 4230: ED50 / geographisch")
                        ),
                        keywords = listOf("road", "transportation", "atlas", "bird", "roadrunner", "ambush")
                    )
                )
                address shouldBe AddressBean(
                    _state = "W",
                    firstName = "Jeff",
                    lastName = "Smith",
                    email = "user@host.com",
                    organization = "NASA",
                    street = "NASA Goddard Space Flight Center",
                    city = "Greenbelt",
                    postcode = "20771",
                    country = KeyValue(null, "USA"),
                    state = KeyValue(null, "MD"),
                    phone = "+1 301 555-1212"
                )
                operations shouldContainExactly listOf(
                    OperationBean(listOf("http://hostname/path?"), listOf(7), "GetCapabilities", KeyValue("1", "GetCapabilities")),
                    OperationBean(listOf("http://hostname/path?"), listOf(7), "GetMap", KeyValue("2", "GetMap")),
                    OperationBean(listOf("http://hostname/path?"), listOf(7), "GetFeatureInfo", KeyValue("3", "GetFeatureInfo")),
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "http://hostname/my-online-resource",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                timeSpan shouldBe null
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
            val result = factory.get(it, "test").getCapabilitiesData(it)
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
                    _state = "W",
                    firstName = "Dr. Manfred",
                    lastName = "Endrullis",
                    organization = "BKG",
                    city = "Potsdam",
                    postcode = "14777",
                    country = KeyValue("276", "Deutschland"),
                    state = KeyValue("5", "Brandenburg"),
                    phone = "+49 341 5634369"
                )

                operations?.shouldHaveSize(3)
                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf(
                            "http://localhost:8080/wpvs/services?",
                            "http://localhost:8080/wpvs/services?"
                        ), listOf(7, 8), "GetCapabilities", KeyValue(null, "GetCapabilities")
                    ),
                    OperationBean(
                        listOf(
                            "http://localhost:8080/wpvs/services?",
                            "http://localhost:8080/wpvs/services?"
                        ), listOf(7, 8), "DescribeCoverage", KeyValue(null, "DescribeCoverage")
                    ),
                    OperationBean(
                        listOf(
                            "http://localhost:8080/wpvs/services?",
                            "http://localhost:8080/wpvs/services?"
                        ), listOf(7, 8), "GetCoverage", KeyValue(null, "GetCoverage")
                    ),
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "http://www.geodatenzentrum.de",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                /*timeSpan null
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

    should("WCS 1.1.2") {
        getDocument("wcs112.xml").let {
            val result = factory.get(it, "test").getCapabilitiesData(it)
            result.run {
                title shouldBe "CubeWerx Demonstation WCS"
                description shouldBe "A demonstration server used to illustrate CubeWerx's compilance with the Web Coverage Service 1.1.0 implementation specification"
                keywords shouldContainExactly listOf(
                    "Web Coverage Service", "06-083", "CubeWerx", "GeoTIFF", "Imagery"
                )
                serviceType shouldBe "WCS"
                dataServiceType shouldBe "3"
                versions shouldContainExactly listOf(KeyValue(null, "OGC:WCS 1.0.0"), KeyValue(null, "OGC:WCS 1.1.2"))
                fees shouldBe KeyValue(null, "NONE")
                accessConstraints shouldContainExactly listOf(KeyValue(null, "NONE"))
                boundingBoxes shouldContainExactly listOf()
                spatialReferenceSystems shouldContainExactly listOf()
                address shouldBe AddressBean(
                    _state = "W",
                    firstName = "Panagiotis (Peter) A.",
                    lastName = "Vretanos",
                    street = "15 rue Gamelin",
                    city = "Gatineau",
                    postcode = "J8Y 6N5",
                    country = KeyValue(null, "Canada"),
                    state = KeyValue(null, "Quebec"),
                    phone = "123-456-7890",
                    email = "pvretano[at]cubewerx[dot]com"
                )

                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf("http://demo.cubewerx.com/demo/cubeserv/cubeserv.cgi?service=WMS&"),
                        listOf(7), "GetCapabilities", KeyValue(null, "GetCapabilities")
                    ),
                    OperationBean(
                        listOf("http://demo.cubewerx.com/demo/cubeserv/cubeserv.cgi?service=WMS&"),
                        listOf(7), "DescribeCoverage", KeyValue(null, "DescribeCoverage")
                    ),
                    OperationBean(
                        listOf("http://demo.cubewerx.com/demo/cubeserv/cubeserv.cgi?service=WMS&"),
                        listOf(7), "GetCoverage", KeyValue(null, "GetCoverage")
                    ),
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "http://www.cubewerx.com/~pvretano",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                timeSpan shouldBe null
                conformities shouldBe emptyList()
                resourceLocators shouldBe emptyList()
                timeReference shouldBe emptyList()
            }
        }
    }

    should("WCS 2.0.1") {
        getDocument("wcs201.xml").let {
            val result = factory.get(it, "test").getCapabilitiesData(it)
            result.run {
                title shouldBe "INSPIRE-WCS Digitales Geländemodell Gitterweite 200 m"
                description shouldBe "INSPIRE Downloaddienst des Digitalen Geländemodell Gitterweite 200 m für dasGebiet der Bundesrepublik Deutschland.Zur einheitlichen Beschreibung des Reliefs des Gebietes der BundesrepublikDeutschland werden im Rahmen des ATKIS®-Projektes durch die deutscheLandesvermessung Digitale Geländemodelle (DGM) unterschiedlicher Qualitätsstufenaufgebaut.Das Digitale Geländemodell DGM200 beschreibt die Geländeformen der Erdoberflächedurch eine in einem regelmäßigen Gitter angeordnete, in Lage und Höhegeoreferenzierte Punktmenge. Die Gitterweite beträgt 200 m.Die Visualisierung des Reliefs erfolgt nach den Stilvorgaben von INSPIRE für dasThema Elevetaion."
                keywords shouldContainExactly listOf(
                    "WCS",
                    "INSPIRE:DownloadService",
                    "INSPIRE",
                    "infoCoverageAccessService",
                    "BKG",
                    "Bundesamt für Kartographie und Geodäsie",
                    "Deutschland",
                    "Germany",
                    "Geobasisdaten",
                    "AdV",
                    "DGM",
                    "DGM200",
                    "Digitales Gelände Modell 200 m",
                    "Digital Terrain Model Grid Width 200 m",
                    "DEM"
                )
                serviceType shouldBe "WCS"
                dataServiceType shouldBe "3"
                versions shouldContainExactly listOf(
                    KeyValue(null, "OGC:WCS 2.0.1"),
                    KeyValue(null, "OGC:WCS 1.1.1"),
                    KeyValue(null, "OGC:WCS 1.1.0")
                )
                fees shouldBe KeyValue(
                    null,
                    "Diese Daten können geldleistungsfrei gemäß der Verordnung zur Festlegung der Nutzungsbestimmungen für die Bereitstellung von Geodaten des Bundes (GeoNutzV) vom 19. März 2013 (Bundesgesetzblatt Jahrgang 2013 Teil I Nr. 14) genutzt werden, siehe https://sg.geodatenzentrum.de/web_public/gdz/lizenz/geonutzv.pdf. Der Quellenvermerk ist zu beachten. | Quellenvermerk: © GeoBasis-DE / BKG <Jahr>"
                )
                accessConstraints shouldContainExactly listOf(KeyValue(null, "Es gelten keine Zugriffsbeschränkungen."))
                boundingBoxes shouldContainExactly listOf(
                    LocationBean(
                        5.5493554862369905,
                        47.140652918628305,
                        15.57402035157314,
                        55.0611433089022,
                        "Grid Coverage",
                        "free"
                    )
                )
                spatialReferenceSystems?.shouldHaveSize(20)
                address shouldBe AddressBean(
                    _state = "W",
                    lastName = "N/A",
                    street = "Musterstr. 23",
                    city = "Berlin",
                    postcode = "12345",
                    country = KeyValue("276", "Deutschland"),
                    state = KeyValue(null, "xxx"),
                    phone = "+49 (0) 123 456 789",
                    email = "dlz[at]my-domain.net"
                )

                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf("https://sgx.geodatenzentrum.de/wcs_dgm200_inspire?"),
                        listOf(7), "GetCapabilities", KeyValue(null, "GetCapabilities")
                    ),
                    OperationBean(
                        listOf("https://sgx.geodatenzentrum.de/wcs_dgm200_inspire?"),
                        listOf(7), "DescribeCoverage", KeyValue(null, "DescribeCoverage")
                    ),
                    OperationBean(
                        listOf("https://sgx.geodatenzentrum.de/wcs_dgm200_inspire?"),
                        listOf(7), "GetCoverage", KeyValue(null, "GetCoverage")
                    ),
                )
                onlineResources shouldContainExactly emptyList()
                timeSpan shouldBe null
                conformities shouldBe emptyList()
                resourceLocators shouldBe emptyList()
                timeReference shouldBe emptyList()
            }
        }
    }

    should("WCTS") {
        getDocument("wcts.xml").let {
            val result = factory.get(it, "test").getCapabilitiesData(it)
            result.run {
                title shouldBe "Web Coordinate Transformation Service"
                description shouldBe "Network service for transforming coordinates from one CRS to another"
                keywords shouldContainExactly listOf(
                    "Coordinate Reference System",
                    "transformation",
                    "conversion",
                    "coordinate operation"
                )
                serviceType shouldBe "WCTS"
                dataServiceType shouldBe "4"
                versions shouldContainExactly listOf(KeyValue(null, "0.0.0"))
                fees shouldBe KeyValue(null, "NONE")
                accessConstraints shouldContainExactly listOf(KeyValue(null, "NONE"))
                boundingBoxes shouldContainExactly listOf()
                spatialReferenceSystems shouldBe emptyList()
                address shouldBe AddressBean(
                    _state = "W",
                    firstName = "Andreas",
                    lastName = "Poth",
                    street = "Meckenheimer Allee 176",
                    city = "Bonn",
                    postcode = "53115",
                    country = KeyValue("276", "Germany"),
                    state = KeyValue(null, "NRW"),
                    phone = "++49 228 732838",
                    email = "poth@lat-lon.de"
                )

                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf("www.lat-lon.de/transform"),
                        listOf(7), "GetCapabilities", KeyValue("1", "GetCapabilities")
                    ),
                    OperationBean(
                        listOf("www.lat-lon.de/transform"),
                        listOf(7), "Transform", KeyValue("2", "Transform")
                    ),
                    OperationBean(
                        listOf("www.lat-lon.de/transform"),
                        listOf(7), "IsTransformable", KeyValue("3", "IsTransformable")
                    ),
                    OperationBean(
                        listOf("www.lat-lon.de/transform"),
                        listOf(7), "GetResourceByID", KeyValue("5", "GetResourceById")
                    ),
                )
                onlineResources shouldContainExactly emptyList()
                timeSpan shouldBe null
                conformities shouldBe emptyList()
                resourceLocators shouldBe emptyList()
                timeReference shouldBe emptyList()
            }
        }
    }

    should("CSW") {
        getDocument("csw202.xml").let {
            val result = factory.get(it, "test").getCapabilitiesData(it)
            result.run {
                title shouldBe "con terra GmbH test catalogue Server"
                description shouldBe "Web based Catalogue Service (CS-W 2.0.2/AP ISO 1.0) for service, datasets and applications"
                keywords shouldContainExactly listOf(
                    "Orthoimagery",
                    "Orto immagini",
                    "CS-W",
                    "ISO19119",
                    "ISO19115",
                    "con terra",
                    "Catalogue Service",
                    "metadata"
                )
                serviceType shouldBe "CSW"
                dataServiceType shouldBe "1"
                versions shouldContainExactly listOf(KeyValue("1", "OGC:CSW 2.0.2"))
                fees shouldBe KeyValue(null, "NONE")
                accessConstraints shouldContainExactly listOf(
                    KeyValue(
                        null,
                        "Basic authentication (RFC 2617) is required for all data manipulation requests"
                    )
                )
                boundingBoxes shouldContainExactly emptyList()
                spatialReferenceSystems shouldContainExactly emptyList()
                address shouldBe AddressBean(
                    _state = "W",
                    firstName = "Uwe",
                    lastName = "Voges",
                    street = "Marting-Luther-King-Weg 24",
                    city = "Münster",
                    postcode = "48165",
                    country = KeyValue("276", "Germany"),
                    state = KeyValue(null, "NRW"),
                    phone = "+49-251-7474-402",
                    email = "voges@conterra.de"
                )

                operations?.shouldHaveSize(5)
                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf(
                            "http://www.conterra.de/catalog?",
                            "http://www.conterra.de/catalog?"
                        ), listOf(7, 8), "GetCapabilities", KeyValue("1", "GetCapabilities")
                    ),
                    OperationBean(
                        listOf(
                            "http://linux2:7070/axis/services/CSW20_Discovery_SOAP_Port"
                        ), listOf(8), "DescribeRecord", KeyValue("4", "DescribeRecord")
                    ),
                    OperationBean(
                        listOf(
                            "http://linux2:7070/axis/services/CSW20_Discovery_SOAP_Port"
                        ), listOf(8), "GetRecords", KeyValue("2", "GetRecords")
                    ),
                    OperationBean(
                        listOf(
                            "http://linux2:7070/axis/services/CSW20_Discovery_SOAP_Port"
                        ), listOf(8), "GetRecordById", KeyValue("3", "GetRecordById")
                    ),
                    OperationBean(
                        listOf(
                            "http://linux2:7070/axis/services/CSW20_Publication_SOAP_Port"
                        ), listOf(8), "Harvest", KeyValue("7", "Harvest")
                    ),
                )
                onlineResources shouldContainExactly listOf(
                    UrlBean(
                        "mailto:voges@conterra.de",
                        KeyValue("9999", "Unspezifischer Verweis"),
                        "Verweis"
                    )
                )
                resourceLocators shouldBe listOf(
                    UrlBean(
                        url = "http://www.wemove.com/my-resource-locator",
                        type = KeyValue("5066", "Verweis zu Dienst")
                    )
                )
                timeReference shouldBe listOf(
                    TimeReferenceBean(1, formatter.parse("2009-07-02")),
                    TimeReferenceBean(2, formatter.parse("2012-10-22")),
                    TimeReferenceBean(3, formatter.parse("2013-11-26"))
                )
                timeSpan shouldBe TimeReferenceBean(from = formatter.parse("2009-08-20"), to = formatter.parse("2010-04-29"))
                
                conformities shouldBe listOf(
                    ConformityBean(
                        level = 1,
                        specification = "COMMISSION REGULATION (EU) No 1089/2010 of 23 November 2010 implementing Directive 2007/2/EC of the European Parliament and of the Council as regards interoperability of spatial data sets and services"
                    ),
                    ConformityBean(
                        level = 1,
                        specification = "REGOLAMENTO (UE) N. 1089/2010 DELLA COMMISSIONE del 23 novembre 2010 recante attuazione della direttiva 2007/2/CE del Parlamento europeo e del Consiglio per quanto riguarda l'interoperabilità dei set di dati territoriali e dei servizi di dati territoriali"
                    )
                )
            }
        }
    }

    should("WMTS") {
        getDocument("wmts.xml").let {
            val result = factory.get(it, "test").getCapabilitiesData(it)
            result.run {
                title shouldBe "map_cache_vertical"
                description shouldBe "Die vielfältige Geologie Deutschlands sowie die sich hieraus ergebende Nutzung sind Ursachen für verschiedenste Deformationsprozesse, wie z.B. Bodenverdichtung, lösliche und quellende Gesteinsformationen, Erdrutsche, Grundwasserentnahme, Erdgasförderung, Bergbau- und Kavernenspeicherbetrieb.             Die Erfassung von Oberflächendeformationen mittels SAR (Synthetic Aperture Radar) Satelliten ermöglicht es, bundesweite Basisinformationen für eine effiziente Erfassung von Deformationen der Erdoberfläche und deren Monitoring bereit zu stellen.             Sie tragen somit zu einer nachhaltigen Geosicherheit und Georessourcenmanagement bei.                        Möglich ist dies durch die langfristige und flächendeckende Aufnahmeplanung der Copernicus Satellitenmissionen und modernen interferometrischen SAR (InSAR) Verarbeitungstechniken.             Die Produkte basieren auf SAR Daten der Copernicus Sentinel -1A und Sentinel-1B Satelliten, die die Erdoberfläche mit einer Wiederkehrzeit von 6 Tagen im C-Band (Wellenlänge = 5,6 cm) seit April 2014 (Sentinel-1A) bzw. April 2016 (Sentinel-1B) abtasten.                        Vor diesem Hintergrund wurde von der Bundesanstalt für Geowissenschaften und Rohstoffe (BGR) der BodenBewegungsdienst Deutschland (BBD) mit dem Ziel entwickelt, Deformationen der Erdoberfläche darzustellen.             Das BBD Portal enthält Persistent Scatterer Interferometrie (PSI) Daten der gesamten Bundesrepublik Deutschland (ca. 360.000 km2).             Die PSI Technologie ermöglicht präzise Messungen von Deformationen der Erdoberfläche im mm Bereich.                        Die Messpunkte (Persistent Scatterer, PS) entsprechen bereits am Boden vorhandenen Objekten, wie z.B. Gebäuden, Infrastruktur oder natürlichen Objekten, wie Gesteinen und Schuttflächen.             Jeder PS wird durch einen über mehrere Jahre gemittelten Geschwindigkeitswert (ausgedrückt in mm/Jahr) und eine Zeitreihe der Verschiebungen charakterisiert.             Für jeden PS kann die Zeitreihe der Verschiebungen von der ersten Sentinel-1 Aufnahme bis zur letzten ausgewerteten Sentinel-1 Aufnahme eingesehen werden.             Die PS werden nach der mittleren Geschwindigkeit entlang der Sichtlinie der Sentinel-1 Satelliten, Line of Sight (LOS), gemäß der folgenden Konvention im BBD Portal visualisiert:            - die grüne Farbe entspricht den PS, deren mittlere Geschwindigkeit sehr gering ist, zwischen -2,0 und +2,0 mm/Jahr, d.h. im Empfindlichkeitsbereich der PSI Technologie;            - in den Farben von gelb bis rot werden diejenigen PS mit negativer Bewegungsrate visualisiert, d.h. Bewegungen vom Satelliten weg;            - mit den Farben von türkis bis blau werden diejenigen PS mit positiver Bewegungsrate visualisiert, d.h. PS die sich dem Satelliten nähern.                        Die Präzision der dargestellten PSI Daten liegt in der Größenordnung von typischerweise +- 2 mm/Jahr für die mittlere Geschwindigkeit in LOS."
                keywords shouldContainExactly listOf()
                serviceType shouldBe "WMTS"
                dataServiceType shouldBe "2"
                versions shouldContainExactly listOf(KeyValue("3", "OGC:WMTS 1.0.0"))
                fees shouldBe KeyValue(null, "none")
                accessConstraints shouldContainExactly listOf(
                    KeyValue(
                        null,
                        "Die im BBD Portal zur Verfügung gestellten Daten können gemäß der Verordnung zur Festlegung der Nutzungsbestimmungen für die Bereitstellung von Geodaten des Bundes -GeoNutzV- (http://www.geodatenzentrum.de/docpdf/geonutzv.pdf) genutzt werden.                        Im Übrigen gelten folgende Nutzungsbedingungen:                        Die im BBD Portal enthaltenen PSI Daten ermöglichen es, im Rahmen der räumlichen und zeitlichen Auflösung Deformationen der Erdoberfläche zu identifizieren.             Angesichts der Eigenschaften der Daten und der intrinsischen Grenzen der PSI Technologie können die im BBD Portal vorhandenen PSI Daten in keinem Fall als Echtzeit-Messung von Bodenbewegungen betrachtet werden.             Die im BBD Portal vorhandenen PSI Daten dürfen unter keinen Umständen als alleinige Entscheidungsgrundlage verwendet werden.                        Die im BBD Portal enthaltenen PSI Daten sind ein Produkt von hohem wissenschaftlichen Niveau und das Ergebnis der besten derzeit verfügbaren Techniken.             Daher müssen sie von entsprechend geschultem Fachpersonal interpretiert und angewendet werden.             Zu diesem Zweck ist es unerlässlich, dass der Nutzer des BBD Portals die Hinweise zur Nutzung für die korrekte Verwendung von PSI Daten sorgfältig liest und berücksichtigt.                        Die Daten des BBD Portals stellen ein nicht interpretiertes Produkt dar. Ihre Nutzung muss bewusst, umsichtig erfolgen.                        Eigentümer des BBD Portals und der darin enthaltenen Daten ist die Bundesrepublik Deutschland, vertreten durch die BGR.                        Datenschutz            https://www.bgr.bund.de/DE/Allgemeines/Wm/Impressum/datenschutzerklaerung.html?nn=1798032                        Impressum            https://www.bgr.bund.de/DE/Allgemeines/Wm/Impressum/impressum_node.html                        © Bundesanstalt für Geowissenschaften und Rohstoffe 2021            Contains modified Copernicus Sentinel data 2015-2021"
                    )
                )
                boundingBoxes shouldContainExactly listOf(
                    LocationBean(
                        latitude1 = 5.565645761105227,
                        longitude1 = 47.14653466517609,
                        latitude2 = 15.560505271487509,
                        longitude2 = 55.056673348249255,
                        "map_cache_vertical",
                        "frei"
                    )
                )
                spatialReferenceSystems shouldContainExactly listOf(
                    KeyValue(
                        "3857",
                        "EPSG 3857: WGS 84 / Pseudo-Mercator"
                    )
                )
                address shouldBe AddressBean(
                    _state = "W",
                    firstName = "Andre",
                    lastName = "Kalia",
                    street = "Bundesanstalt für Geowissenschaften und Rohstoffe",
                    city = "Hannover",
                    postcode = "30655",
                    country = KeyValue("276", "Germany"),
                    state = KeyValue(null, "Lower Saxony"),
                    phone = "+49 (0)511 643 3056",
                    email = "BBD@bgr.de"
                )

                operations shouldContainExactly listOf(
                    OperationBean(
                        listOf(
                            "https://bodenbewegungsdienst.bgr.de/velocity_vertical/WMTS/1.0.0/WMTSCapabilities.xml",
                        ), listOf(7),
                        null /* do not set method call so that it doesn't appear in ISO (#3651) */,
                        KeyValue("1", "GetCapabilities")
                    )
                    // Only import GetCapabilities - Operation (#3651)
                    /*,
                    OperationBean(
                        listOf(
                            "https://bodenbewegungsdienst.bgr.de/server/rest/services/map_cache_vertical/MapServer/WMTS/tile/1.0.0/"
                        ), listOf(7), "GetTile", "GetTile"
                    )*/
                )
                onlineResources shouldContainExactly listOf()
                resourceLocators shouldBe listOf()
                timeReference shouldBe listOf()
                timeSpan shouldBe null
                conformities shouldBe listOf()
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
