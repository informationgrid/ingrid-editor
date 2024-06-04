/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.ogc

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeType
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.ogc.model.Link
import de.ingrid.igeserver.services.QueryMetadata
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ogc-api")
class OgcHtmlConverterService(
    private val generalProperties: GeneralProperties
){

    private val hostnameOgcApi = generalProperties.host + "/api/ogc"

    fun convertObjectNode2Html(doc: ObjectNode, type: String?): String {
        val table = convertFieldToTable(doc)
        val title = doc.get("title") ?: ""
        val collectionId: String? = doc["id"]?.toString()?.drop(1)?.dropLast(1)

        val h1 = if(type == null) {
            """<h1>Record: $title</h1>"""
        } else if (type == "Collection") {
            """<h1>Collection: <a href='/api/ogc/collections/${collectionId}?f=html'>${doc["name"].toString().drop(1).dropLast(1)}</a></h1>
               <p>Link to <a href='/api/ogc/collections/${collectionId}/items?f=html'">Records</a><p/>
            """.trimMargin()
        } else {
            "<h1>$type</h1>"
        }

        return """
                 <style>
                    body { font-family: Sans-Serif; padding-bottom: 50px }
                    table { text-align:left; width: 100%; border-spacing: 0; border-collapse: collapse;}
                    td { vertical-align: top; outline: 2px solid lightGray; background-color: white;}}
                </style>
                <div class="record" style="margin: 40px 10px; padding: 10px; outline: solid; background: lightgray;">
                    $h1
                    $table
                </div>
        """
    }

    private fun convertFieldToTable(node: JsonNode): String {
        var table = "<table>"
        if (node.isTextual)
            table += "<td>${node.toString()}</td>" // addRow("", node.toString());
        else
            node.fields().forEach { element ->
                val key = element.key ?: ""
                val value = element.value
                when (value.nodeType) {
                    JsonNodeType.NULL -> table += addRow(key, "null")
                    JsonNodeType.STRING -> table += addRow(key, value.toString())
                    JsonNodeType.OBJECT -> table += addRow(key, convertFieldToTable(value))
                    JsonNodeType.ARRAY -> {
                        value.forEach { it -> table += addRow(key, convertFieldToTable(it)) }
                    }

                    else -> table += addRow(key, value.toString())
                }
            }
        return "$table</table>"
    }

    private fun addRow(key: String, value: String): String {
        return "<tr><td style='width:160px'><b>$key</b></td><td>$value</td></tr>"
    }

    fun wrapperForHtml(responseRecords: String, links: List<Link>?, queryMetadata: QueryMetadata?): String{
        var metadata =""
        var linksElements = ""
        var selfLink = ""

        if(queryMetadata != null) {
            val numberMatched = queryMetadata.numberMatched
            val numberReturned = queryMetadata.numberReturned
            val timeStamp = queryMetadata.timeStamp
            metadata += """
                <div>
                    <p>numberMatched: $numberMatched</p>
                    <p>numberReturned: $numberReturned</p>
                    <p>timeStamp: $timeStamp</p>
                </div>
            """.trimIndent()
        }

        if(links != null) {
            val selfLinks = links.filter { it.rel == "self"}
            val alternateLinks = links.filter { it.rel == "alternate"}
            val nextLinks = links.filter { it.rel == "next"}
            val prevLinks = links.filter { it.rel == "prev"}
            val collectionLinks = links.filter { it.rel == "collection"}

            for(link in selfLinks) selfLink += "<p>" + link.title + ": " + link.href + "</p>"

            var htmlCollection = "<div class='grid-item dropdown'><button class='dropdownTitle'>Links to Collection</button><nav class=\"dropdown-content\">"
            for(link in collectionLinks) htmlCollection += "<a href=" + link.href + ">" + link.title + "</a>"
            htmlCollection += "</nav></div>"

            var htmlAlternate = "<div class='grid-item dropdown'><button class='dropdownTitle'>Alternate Formats</button><nav class=\"dropdown-content\">"
            for(link in alternateLinks) htmlAlternate += "<a href=" + link.href + ">" + link.title + "</a>"
            htmlAlternate += "</nav></div>"

            var htmlNext = "<div class='grid-item dropdown'><button class='dropdownTitle'>Next Page</button><nav class=\"dropdown-content\">"
            for(link in nextLinks) htmlNext += "<a href=" + link.href + ">" + link.title + "</a>"
            htmlNext += "</nav></div>"

            var htmlPrev = "<div class='grid-item dropdown'><button class='dropdownTitle'>Previous Page</button><nav class=\"dropdown-content\">"
            for(link in prevLinks) htmlPrev += "<a href=" + link.href + ">" + link.title + "</a>"
            htmlPrev += "</nav></div>"

            linksElements += htmlAlternate + htmlCollection + ( if(prevLinks.isNotEmpty() ) htmlPrev else "" ) + ( if(nextLinks.isNotEmpty() ) htmlNext else "" )
        }

        return """
            <html>
                <head><title>Ingrid - OGC Record API</title></head>
            <body>
            <header>
                <h1>OGC Record API</h1>
                <div class="grid-container">
                    <div class='grid-item dropdown'><a href='${hostnameOgcApi}?f=html'><button class='dropdownTitle'>Landing Page</button></a></div>
                    <div class='grid-item dropdown'><a href='${hostnameOgcApi}/conformance?f=html'><button class='dropdownTitle'>Conformance</button></a></div>
                    <div class='grid-item dropdown'><a href='${hostnameOgcApi}/collections?f=html'><button class='dropdownTitle'>Collections</button></a></div>
                </div>
                $metadata
                $selfLink
                <div class="grid-container">
                    $linksElements
                </div>
            </header>
            $responseRecords
             <style>
                header {
                    background: #28225b;
                    color: #ffffff;
                    padding: 10px;
                }
                button {
                    cursor: pointer;
                    font-size: large;
                    font-style: inherit;
                    font-weight: 600;
                }
                .grid-container {
                    display: grid;
                    gap: 10px;
                    grid-template-columns: auto auto auto auto;
                }
                .grid-item {
                }
                .dropdownTitle{
                    width: 100%;
                }
                .dropdown { 
                    display: inline-block; 
                    position: relative; 
                } 
                .dropdown-content {
                    display: none;
                    position: absolute;
                    width: 100%;
                    overflow: auto;
                    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                }
                .dropdown:hover .dropdown-content {
                    display: block;
                }
                .dropdown-content a {
                    display: block;
                    color: #000000;
                    background-color: #ffffff;
                    padding: 5px;
                    text-decoration: none;
              }
              .dropdown-content a:hover {
                  color: #FFFFFF;
                  background-color: #196ea2;
              }
          </style>
          </body></html>
        """.trimIndent()
    }

}