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
package de.ingrid.mdek.upload.storage.impl

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.nio.file.Files
import java.nio.file.Path
import java.time.Instant
import java.time.temporal.ChronoUnit

class FileSystemStoragePartsTest {

    @TempDir
    lateinit var tempDir: Path

    private lateinit var partsDir: Path
    private lateinit var storage: FileSystemStorage

    @BeforeEach
    fun setup() {
        partsDir = tempDir.resolve("parts")
        Files.createDirectories(partsDir)
        storage = FileSystemStorage().apply {
            setPartsDir(partsDir.toString())
            setPartsRetentionTime(24)
        }
    }

    private fun part(name: String, ageHours: Long): Path {
        val file = Files.writeString(partsDir.resolve(name), "content")
        file.toFile().setLastModified(Instant.now().minus(ageHours, ChronoUnit.HOURS).toEpochMilli())
        return file
    }

    private fun remainingParts() = Files.list(partsDir).use { stream -> stream.map { it.fileName.toString() }.toList() }

    @Test
    fun `deleteStaleParts should remove uploads whose newest part is older than the retention time`() {
        part("flow-abandoned-attempt-1-1", 30)
        part("flow-abandoned-attempt-1-2", 25)

        storage.deleteStaleParts()

        remainingParts() shouldBe emptyList()
    }

    @Test
    fun `deleteStaleParts should keep all parts of an upload that recently received a part`() {
        part("flow-running-attempt-1-1", 30)
        part("flow-running-attempt-1-2", 1)
        part("flow-abandoned-attempt-1-1", 30)

        storage.deleteStaleParts()

        remainingParts() shouldContainExactlyInAnyOrder listOf(
            "flow-running-attempt-1-1",
            "flow-running-attempt-1-2",
        )
    }

    @Test
    fun `deleteStaleParts should be disabled by a retention time of zero`() {
        storage.setPartsRetentionTime(0)
        part("flow-abandoned-attempt-1-1", 30)

        storage.deleteStaleParts()

        remainingParts() shouldBe listOf("flow-abandoned-attempt-1-1")
    }

    @Test
    fun `deleteStaleParts should ignore a missing parts directory`() {
        storage.setPartsDir(tempDir.resolve("does-not-exist").toString())

        storage.deleteStaleParts()
    }

    @Test
    fun `deleteParts should remove the existing parts of an upload and ignore missing ones`() {
        part("flow-failed-attempt-1-1", 0)
        part("flow-failed-attempt-1-3", 0)
        part("flow-other-attempt-1-1", 0)

        storage.deleteParts("flow-failed-attempt-1", 3)

        remainingParts() shouldBe listOf("flow-other-attempt-1-1")
    }
}
