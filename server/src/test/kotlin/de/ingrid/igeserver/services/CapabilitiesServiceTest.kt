package de.ingrid.igeserver.services

import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.services.getCapabilities.*
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import javax.xml.XMLConstants
import javax.xml.parsers.DocumentBuilderFactory

class CapabilitiesServiceTest : ShouldSpec({

    val codelistHandler = mockk<CodelistHandler>()
    lateinit var factory: GetCapabilitiesParserFactory

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
    }

    should("WMS 2.0.0") {
        getDocument("wfs200.xml").let {
            val result = factory.get(it).getCapabilitiesData(it)
            result.run {
                title shouldBe "Download Service Stolpersteine Stadt Moers"
                description shouldBe "Die Stolpersteine sind im Boden verlegte kleine Gedenktafeln, die an Menschen erinnern, welche in der Zeit des Nationalsozialismus verfolgt, ermordet, deportiert, vertrieben oder in den Suizid getrieben wurden. Der Dienst zeigt die Stolpersteine, die bis jetzt in der Stadt Viersen verlegt wurden. Die Daten werden bei Bedarf aktualisiert."
                keywords shouldContainExactly listOf("Nordrhein-Westfalen", "Moers", "Gedenken", "Kultur")
                serviceType shouldBe "WFS"
                dataServiceType shouldBe "3"
                versions shouldContainExactly listOf("OGC:WFS 2.0", "OGC:WFS 1.1.0")
                fees shouldBe "Datenlizenz Deutschland – Zero – Version 2.0 (https://www.govdata.de/dl-de/zero-2-0)"
                accessConstraints shouldContainExactly listOf("Es gelten keine Beschränkungen.")
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
                    SpatialReferenceSystemBean(25832, "EPSG 25832: ETRS89 / UTM Zone 32N"),
                    SpatialReferenceSystemBean(3035, "EPSG 3035: ETRS89 / LAEA Europa"),
                    SpatialReferenceSystemBean(3857, "EPSG 3857: WGS 84 / Pseudo-Mercator"),
                    SpatialReferenceSystemBean(-1, "urn:ogc:def:crs:EPSG::5554"),
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
                    OperationBean(listOf("https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?"), listOf(7), "GetCapabilities", "GetCapabilities"),
                    OperationBean(listOf("https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?", "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine"), listOf(7, 8), "DescribeFeatureType", "DescribeFeatureType"),
                    OperationBean(listOf("https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?", "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine"), listOf(7, 8), "GetFeature", "GetFeature")
                )
                onlineResources shouldContainExactly listOf(UrlBean("https://geoservices.krzn.de"))
                timeSpans shouldBe emptyList()
                conformities shouldBe emptyList()
                resourceLocators shouldBe emptyList()
                timeReference shouldBe emptyList()
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
