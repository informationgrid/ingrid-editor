/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.migrations.forEachDocumentInBatches
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate
import tools.jackson.databind.node.ArrayNode
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

@Profile("ingrid-baw")
@Service
class M107MigrateBawSubsoilKeywords(
    private val entityManager: EntityManager,
    private val transactionManager: PlatformTransactionManager,
) : MigrationBase("0.107") {

    private val log = logger()

    override fun exec() {
        TransactionTemplate(transactionManager).executeWithoutResult {
            setAdminAuthentication("Migration", "Task")
            entityManager.forEachDocumentInBatches(
                "doc.state != 'ARCHIVED' AND doc.catalog.type = 'ingrid-baw'",
            ) { doc ->
                try {
                    if (migrateKeywords(doc.data)) log.info("Migrated BAW subsoil keywords for doc with dbID ${doc.id}")
                    else log.debug("No subsoil keywords migrated for doc with dbID ${doc.id}")
                } catch (e: Exception) {
                    log.error("Error during migration", e)
                }
            }
        }
    }

    internal fun migrateKeywords(data: ObjectNode): Boolean {
        val keywords = data.get("keywords") as? ObjectNode ?: return false
        val subsoilKeywords = keywords.get("subsoilKeywords") ?: return false

        if (subsoilKeywords !is ArrayNode) {
            keywords.remove("subsoilKeywords")
            return false
        }

        val existingBawKeywords = keywords.get("bawKeywords")
        val bawKeywords = (existingBawKeywords as? ArrayNode)?.deepCopy() ?: jacksonObjectMapper().createArrayNode()

        // iterate through all subsoil Keywords, migrate and handle invalid and duplicate values
        subsoilKeywords.forEach { entry ->
            val oldKey = entry.getString("key")
            if (oldKey !in SUBSOIL_KEYWORDS) return@forEach // ignore any invalid values

            val mapped = SUBSOIL_KEYWORDS[oldKey]
            val value = mapped!!.second
            val migrated = jacksonObjectMapper().createObjectNode().apply {
                put("key", mapped.first)
                put("value", value)
                put("_codelistId", "3950005")
            }

            val isDuplicate: Boolean = bawKeywords.any {
                it.getString("key") == mapped.first
            }
            if (!isDuplicate) bawKeywords.add(migrated)
        }
        if (!bawKeywords.isEmpty) keywords.set("bawKeywords", bawKeywords)
        keywords.remove("subsoilKeywords")
        return true
    }

    companion object {
        // Mapping from 3950007 (Baugrunddynamik/Subsoil Keywords) to Schlagwortkatalog_2026 (3950005).
        private val SUBSOIL_KEYWORDS = mapOf(
            "1" to ("952" to "Beweissicherung"),
            "2" to ("1002" to "Messdaten BD"),
            "3" to ("953" to "Probemaßnahme"),
            "4" to ("951" to "Produktion"),
            "5" to ("954" to "Prognose"),
            "6" to ("955" to "Baugrund"),
            "7" to ("956" to "Bauteil"),
            "8" to ("957" to "Bauwerk"),
            "9" to ("62" to "Beton"),
            "10" to ("438" to "Boden"),
            "11" to ("4" to "Erdbeben"),
            "12" to ("958" to "Erschütterung"),
            "13" to ("33" to "Fundament"),
            "14" to ("959" to "Geophysik"),
            "15" to ("965" to "Schaden"),
            "16" to ("964" to "Schiffsschwingung"),
            "17" to ("469" to "Schiffsstoß"),
            "18" to ("422" to "Schwingung"),
            "19" to ("962" to "Schwingungsanregung"),
            "20" to ("963" to "Schwingungsminderung"),
            "21" to ("960" to "Seismik"),
            "22" to ("966" to "Denkmalschutz"),
            "23" to ("974" to "Erdbauwerk"),
            "24" to ("967" to "historische Bebauung"),
            "25" to ("970" to "Hochhaus"),
            "26" to ("971" to "Industriebau"),
            "27" to ("973" to "Kernkraftwerk"),
            "28" to ("975" to "Maschine"),
            "29" to ("972" to "Massivbauwerk"),
            "30" to ("968" to "Menschen"),
            "31" to ("129" to "Rohrleitung"),
            "32" to ("146" to "Tunnel"),
            "33" to ("969" to "Wohnhaus"),
            "34" to ("978" to "Dieselramme"),
            "35" to ("982" to "Fallgewicht"),
            "36" to ("981" to "Freifallramme"),
            "37" to ("979" to "Hydraulikramme"),
            "38" to ("980" to "Schnellschlagramme"),
            "39" to ("976" to "Vibrationsramme - HF"),
            "40" to ("977" to "Vibrieren"),
            "41" to ("100" to "Dalben"),
            "42" to ("986" to "Doppelbohle"),
            "43" to ("985" to "Einzelbohle"),
            "44" to ("988" to "Frankipfahl"),
            "45" to ("987" to "Schrägpfahl"),
            "46" to ("989" to "Sonderprofil"),
            "47" to ("990" to "Baggern"),
            "48" to ("991" to "Bohren"),
            "49" to ("992" to "Bohren - Austausch"),
            "50" to ("993" to "Fräsen"),
            "51" to ("994" to "Meißeln Abbruch"),
            "52" to ("995" to "Meißeln Fels"),
            "53" to ("79" to "Pressen"),
            "54" to ("996" to "Reißen"),
            "55" to ("997" to "Sprengung Abbruch"),
            "56" to ("998" to "Sprengung Boden"),
            "57" to ("999" to "Verdichten"),
            "58" to ("1000" to "Verdichten-Intensivverdichtung"),
            "59" to ("984" to "Verkehr"),
            "60" to ("983" to "Ziehen"),
            "61" to ("1001" to "Messwerte im Gutachten"),
            "62" to ("1003" to "s-Bauwerk"),
            "63" to ("1004" to "s-Boden"),
            "64" to ("340" to "Setzung"),
            "65" to ("1010" to "v-1D"),
            "66" to ("1011" to "v-3D"),
            "67" to ("1006" to "v-Bauwerk"),
            "68" to ("1005" to "v-Boden"),
            "69" to ("1008" to "v-Decke"),
            "70" to ("1007" to "v-Fundament"),
            "71" to ("1009" to "v-Obergeschoss"),
            "72" to ("1012" to "v-Vektor"),
            "73" to ("961" to "Schall"),
            // Entry 74 in the old list is an empty placeholder.
        )
    }
}
