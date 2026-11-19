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

import de.ingrid.mdek.upload.storage.validate.Validator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.ByteArrayInputStream
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

class FileSystemStoragePartsTest {

    @TempDir
    lateinit var tempDir: Path

    private lateinit var partsDir: Path
    private lateinit var docsDir: Path
    private lateinit var uploadTempDir: Path
    private lateinit var storage: FileSystemStorage

    @BeforeEach
    fun setup() {
        partsDir = tempDir.resolve("parts")
        docsDir = tempDir.resolve("documents")
        uploadTempDir = tempDir.resolve("upload-temp")
        Files.createDirectories(partsDir)
        storage = FileSystemStorage().apply {
            setPartsDir(partsDir.toString())
            setDocsDir(this@FileSystemStoragePartsTest.docsDir.toString())
            setTempDir(uploadTempDir.toString())
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
        part("flow-failed-attempt-1-2", 0)
        part("flow-failed-attempt-1-3", 0)
        part("flow-other-attempt-1-1", 0)

        storage.deleteParts("flow-failed-attempt-1", setOf(1, 3))

        remainingParts() shouldContainExactlyInAnyOrder listOf(
            "flow-failed-attempt-1-2",
            "flow-other-attempt-1-1",
        )
    }

    @Test
    fun `part operations should reject paths outside the parts directory`() {
        val outside = Files.writeString(tempDir.resolve("outside-1"), "preserve")

        shouldThrow<IOException> {
            storage.writePart("../outside", 1, ByteArrayInputStream("replacement".toByteArray()), 11L)
        }
        shouldThrow<IOException> {
            storage.deleteParts("../outside", setOf(1))
        }

        Files.readString(outside) shouldBe "preserve"
    }

    @Test
    fun `part operations should reject symbolic links`() {
        val outside = Files.writeString(tempDir.resolve("outside"), "preserve")
        val link = Files.createSymbolicLink(partsDir.resolve("flow-link-1"), outside)

        shouldThrow<IOException> {
            storage.writePart("flow-link", 1, ByteArrayInputStream("replacement".toByteArray()), 11L)
        }
        shouldThrow<IOException> {
            storage.deleteParts("flow-link", setOf(1))
        }
        shouldThrow<IOException> {
            storage.combineParts("catalog", "user", "doc", "file.txt", "flow-link", 1, 7L, true)
        }

        Files.isSymbolicLink(link) shouldBe true
        Files.readString(outside) shouldBe "preserve"
    }

    @Test
    fun `size mismatch should preserve the existing destination and remove the temporary file`() {
        val destination = docsDir.resolve(FileSystemStorage.UNSAVED_PATH).resolve("catalog").resolve("doc").resolve("user").resolve("file.txt")
        Files.createDirectories(destination.parent)
        Files.writeString(destination, "existing")

        shouldThrow<IOException> {
            storage.write("catalog", "user", "doc", "file.txt", ByteArrayInputStream("short".toByteArray()), 6L, true)
        }

        Files.readString(destination) shouldBe "existing"
        Files.list(uploadTempDir).use { it.count() shouldBe 0L }
    }

    @Test
    fun `stale cleanup should wait for an in-flight part write`() {
        val oldPart = part("flow-active-1", 30)
        val writeStarted = CountDownLatch(1)
        val releaseWrite = CountDownLatch(1)
        val writeFailure = AtomicReference<Throwable?>()
        val source = object : java.io.InputStream() {
            private val bytes = "new".toByteArray()
            private var index = 0

            override fun read(): Int {
                if (index == 0) {
                    writeStarted.countDown()
                    if (!releaseWrite.await(5, TimeUnit.SECONDS)) throw IOException("Timed out waiting to release part write")
                }
                return if (index < bytes.size) bytes[index++].toInt() and 0xff else -1
            }
        }
        val writer = Thread {
            try {
                storage.writePart("flow-active", 2, source, 3L)
            } catch (ex: Throwable) {
                writeFailure.set(ex)
            }
        }
        writer.start()
        writeStarted.await(5, TimeUnit.SECONDS) shouldBe true

        val cleanupStarted = CountDownLatch(1)
        val cleanupFailure = AtomicReference<Throwable?>()
        val cleaner = Thread {
            cleanupStarted.countDown()
            try {
                storage.deleteStaleParts()
            } catch (ex: Throwable) {
                cleanupFailure.set(ex)
            }
        }
        cleaner.start()
        cleanupStarted.await(5, TimeUnit.SECONDS) shouldBe true
        val deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5)
        while (cleaner.state != Thread.State.BLOCKED && cleaner.isAlive && System.nanoTime() < deadline) {
            Thread.yield()
        }
        cleaner.state shouldBe Thread.State.BLOCKED

        releaseWrite.countDown()
        writer.join(5000)
        cleaner.join(5000)

        writer.isAlive shouldBe false
        cleaner.isAlive shouldBe false
        writeFailure.get() shouldBe null
        cleanupFailure.get() shouldBe null
        Files.exists(oldPart) shouldBe true
        Files.exists(partsDir.resolve("flow-active-2")) shouldBe true
    }

    @Test
    fun `stale cleanup should wait for an in-flight merge`() {
        part("flow-merge-1", 30)
        val mergeStarted = CountDownLatch(1)
        val releaseMerge = CountDownLatch(1)
        val validator = mockk<Validator>()
        every { validator.validate(any(), any(), any(), any(), any(), any()) } answers {
            mergeStarted.countDown()
            check(releaseMerge.await(5, TimeUnit.SECONDS))
        }
        storage.setValidators(listOf(validator))
        val mergeFailure = AtomicReference<Throwable?>()
        val cleanerFailure = AtomicReference<Throwable?>()
        val merger = Thread {
            try {
                storage.combineParts("catalog", "user", "doc", "file.txt", "flow-merge", 1, 7L, true)
            } catch (ex: Throwable) {
                mergeFailure.set(ex)
            }
        }
        val cleaner = Thread {
            try {
                storage.deleteStaleParts()
            } catch (ex: Throwable) {
                cleanerFailure.set(ex)
            }
        }
        merger.start()
        try {
            mergeStarted.await(5, TimeUnit.SECONDS) shouldBe true
            cleaner.start()
            val deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5)
            while (cleaner.state != Thread.State.BLOCKED && cleaner.isAlive && System.nanoTime() < deadline) {
                Thread.yield()
            }
            cleaner.state shouldBe Thread.State.BLOCKED
        } finally {
            releaseMerge.countDown()
            merger.join(5000)
            cleaner.join(5000)
        }
        merger.isAlive shouldBe false
        cleaner.isAlive shouldBe false
        mergeFailure.get() shouldBe null
        cleanerFailure.get() shouldBe null
        val destination = docsDir.resolve(FileSystemStorage.UNSAVED_PATH).resolve("catalog/doc/user/file.txt")
        Files.readString(destination) shouldBe "content"
    }
}
