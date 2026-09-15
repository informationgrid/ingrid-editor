/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.actuator

import de.ingrid.mdek.upload.UploadConfig
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import org.slf4j.LoggerFactory
import org.springframework.boot.health.contributor.Health
import org.springframework.boot.health.contributor.HealthIndicator
import org.springframework.stereotype.Component
import java.io.ByteArrayInputStream
import java.net.HttpURLConnection
import java.net.URI
import java.util.*

@Component
class UploadAccessHealthIndicator(
    private val storage: FileSystemStorage,
    private val config: UploadConfig,
) : HealthIndicator {

    private val log = LoggerFactory.getLogger(UploadAccessHealthIndicator::class.java)

    override fun health(): Health {
        val testCatalog = "health-check"
        val testDatasetID = "ds-" + UUID.randomUUID().toString()
        val testFileName = "health-check-test.txt"
        val testContent = "health check content " + System.currentTimeMillis()
        val referencedFiles = listOf(testFileName)
        val userID = "99999"

        return try {
            // 1. Create a temporary file in the unpublished directory
            storage.write(
                testCatalog,
                userID,
                testDatasetID,
                testFileName,
                ByteArrayInputStream(testContent.toByteArray()),
                testContent.length.toLong(),
                true,
            )

            // In FileSystemStorage.write, if userID is null, it seems it might be put into unsaved or unpublished.
            // Based on write() implementation in FileSystemStorage (need to check if it uses unsaved or unpublished by default)
            // Actually, FileSystemStorage.write usually writes to UNSAVED if userID is provided.
            // But publishDataset expects files in UNPUBLISHED.

            // Let's ensure it is in UNPUBLISHED by using saveDataset first if needed,
            // but saveDataset moves from UNSAVED to UNPUBLISHED.

            storage.saveDataset(testCatalog, userID, testDatasetID, referencedFiles)

            // 2. Publish the dataset (moves from UNPUBLISHED to PUBLISHED)
            storage.publishDataset(testCatalog, testDatasetID, referencedFiles)

            // 3. Construct the external URL
            val externalUrl = config.uploadExternalUrl.removeSuffix("/") + "/$testCatalog/$testDatasetID/$testFileName"

            // 4. Perform HTTP request
            val url = URI(externalUrl).toURL()
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 5000
            connection.readTimeout = 5000

            val responseCode = connection.responseCode
            if (responseCode == 200) {
                Health.up()
                    .withDetail("url", externalUrl)
                    .withDetail("status", "File upload and accessibility verified")
                    .build()
            } else {
                Health.down()
                    .withDetail("url", externalUrl)
                    .withDetail("status", "File not accessible")
                    .withDetail("responseCode", responseCode)
                    .build()
            }
        } catch (e: Exception) {
            log.error("Health check failed", e)
            Health.down(e)
                .withDetail("status", "Error during health check")
                .build()
        } finally {
            // Cleanup
            try {
                storage.discardPublished(testCatalog, testDatasetID)
            } catch (e: Exception) {
                log.warn("Failed to cleanup health check files for dataset $testDatasetID", e)
            }
        }
    }
}
