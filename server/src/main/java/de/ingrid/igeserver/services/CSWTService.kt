/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CSWTConfig
import de.ingrid.utils.ElasticDocument
import de.ingrid.utils.xml.XMLUtils
import io.ktor.client.HttpClient
import io.ktor.client.engine.java.Java
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BasicAuthCredentials
import io.ktor.client.plugins.auth.providers.basic
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.client.utils.EmptyContent.contentType
import io.ktor.http.*
import kotlinx.coroutines.runBlocking
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
class CSWTService(val settingsService: SettingsService) : IConnection {

    val log = logger()

    private var clientMap: Map<String, CSWTClient> = emptyMap()

    @EventListener(ApplicationReadyEvent::class)
    fun init() = setupConnections()

    fun setupConnections() {
        try {
            val cswtServiceConfig = settingsService.getCSWTConfig()
            clientMap =
                cswtServiceConfig.associate { it.id!! to createCSWTClient(it) }
        } catch (e: Exception) {
            log.error("Could not connect to Elasticsearch", e)
        }
    }

    private fun createCSWTClient(config: CSWTConfig): CSWTClient {
        return CSWTClient(
                client = HttpClient(Java) {
                    if (config.username != null && config.password != null) {
                        install(Auth) {
                            basic {
                                sendWithoutRequest { true }
                                credentials {
                                    BasicAuthCredentials(username = config.username, password = config.password)
                                }
                            }
                        }
                    }
                },
                config.url,
                config.name
        )
    }


    fun getClient(index: String): CSWTClient = clientMap[index]!!

    override fun isConnected(id: String): Boolean = runBlocking {
        try {
            clientMap[id]!!.client.request(clientMap[id]!!.url)
            true
        } catch (e: Exception) {
            log.warn("No connection to CSW-T Service '${id}': ${e.message}")
            false
        }
    }

    override fun containsId(id: String): Boolean = clientMap[id] != null


    class CSWTClient(val client: HttpClient, val url: String, val name: String) {

        val log = logger()

        fun insertOrUpdate(doc: ElasticDocument) {
            val idfXml = convertIdfToXml(doc.get("idf").toString())
            val transformedXml = transformXmlWithXslt(idfXml)

            val cswUpdateXml = wrapInCswtUpdateTransaction(transformedXml)

            runBlocking {
                try {
                    val response: String = client.post {
                        url(this@CSWTClient.url)
                        contentType(ContentType.Application.Xml)
                        setBody(cswUpdateXml)
                    }.bodyAsText()
                    log.info("Response received: $response")
                    
                } catch (e: Exception) {
                    log.error("Failed to insert or update document: ${e.message}", e)
                }
            }

            val cswInsertXml = wrapInCswtInsertTransaction(transformedXml)

            runBlocking {
                try {
                    val response: String = client.post {
                        url(this@CSWTClient.url)
                        contentType(ContentType.Application.Xml)
                        setBody(cswInsertXml)
                    }.bodyAsText()
                    log.info("Response received: $response")
                } catch (e: Exception) {
                    log.error("Failed to insert or update document: ${e.message}", e)
                }
            }
            
            
            
        }

        private fun wrapInCswtUpdateTransaction(xmlDoc: org.w3c.dom.Document): String {
            val transactionWrapperElement = "csw:Transaction"
            val updateElement = "csw:Update"

            val xmlBuilder = StringBuilder()
            xmlBuilder.append("<$transactionWrapperElement service=\"CSW\" version=\"2.0.2\" xmlns:csw=\"http://www.opengis.net/cat/csw/2.0.2\" >")
                .append("<$updateElement>")
                .append(transformDocumentToString(xmlDoc)) 
                .append("</$updateElement>")
                .append("</$transactionWrapperElement>")

            return xmlBuilder.toString()
        }

        private fun wrapInCswtInsertTransaction(xmlDoc: org.w3c.dom.Document): String {
            val transactionWrapperElement = "csw:Transaction"
            val insertElement = "csw:Insert"

            val xmlBuilder = StringBuilder()
            xmlBuilder.append("<$transactionWrapperElement service=\"CSW\" version=\"2.0.2\" xmlns:csw=\"http://www.opengis.net/cat/csw/2.0.2\" >")
                .append("<$insertElement>")
                .append(transformDocumentToString(xmlDoc))
                .append("</$insertElement>")
                .append("</$transactionWrapperElement>")

            return xmlBuilder.toString()
        }

        fun convertIdfToXml(idf: String): org.w3c.dom.Document {
            val factory = javax.xml.parsers.DocumentBuilderFactory.newInstance()
            factory.isNamespaceAware = true
            val builder = factory.newDocumentBuilder()

            return builder.parse(org.xml.sax.InputSource(java.io.StringReader(idf)))
        }

    private fun transformDocumentToString(doc: org.w3c.dom.Document): String {
        val transformerFactory = javax.xml.transform.TransformerFactory.newInstance()
        val transformer = transformerFactory.newTransformer()
        transformer.setOutputProperty(javax.xml.transform.OutputKeys.OMIT_XML_DECLARATION, "yes")
        val source = javax.xml.transform.dom.DOMSource(doc)
        val result = java.io.StringWriter()
        val output = javax.xml.transform.stream.StreamResult(result)
        transformer.transform(source, output)
        return result.toString()
        }

        private fun transformXmlWithXslt(xmlDoc: org.w3c.dom.Document): org.w3c.dom.Document {
            val transformerFactory = javax.xml.transform.TransformerFactory.newInstance()
            val xslStream = this.javaClass.classLoader.getResourceAsStream("idf_1_0_0_to_iso_metadata.xsl")
            val xslt = javax.xml.transform.stream.StreamSource(xslStream)
            val transformer = transformerFactory.newTransformer(xslt)

            val source = javax.xml.transform.dom.DOMSource(xmlDoc)
            val result = javax.xml.transform.dom.DOMResult()
            transformer.transform(source, result)

            return result.node as org.w3c.dom.Document
        }
    }
}
