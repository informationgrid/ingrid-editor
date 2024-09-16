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
package de.ingrid.igeserver.migrations

import io.kotest.assertions.throwables.shouldThrowAny
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe

class MigrationBaseTest :
    ShouldSpec({

        class DummyStrategy(override val version: Version) : MigrationBase("") {
            override fun exec() {
            }
        }

        @Suppress("ktlint:standard:property-naming")
        val strategy1_2_3 = DummyStrategy(Version("1.2.3"))

        @Suppress("ktlint:standard:property-naming")
        val strategy1_13_1 = DummyStrategy(Version("1.13.1"))

        should("determine lower versions") {

            // these versions must be lower than "1.2.3"
            arrayOf("0", "1", "0.10.4", "1.2", "1.2.2").forEach {
                strategy1_2_3.compareWithVersion(it) shouldBe VersionCompare.HIGHER
            }

            // these versions must be lower than "1.13.1"
            arrayOf("1.2", "1.2.20").forEach {
                strategy1_13_1.compareWithVersion(it) shouldBe VersionCompare.HIGHER
            }
        }

        should("determine higher versions") {

            // these versions must be greater than "1.2.3"
            arrayOf("2", "10", "1.3", "1.2.4", "1.10.2", "1.20").forEach {
                strategy1_2_3.compareWithVersion(it) shouldBe VersionCompare.LOWER
            }
        }

        should("determine same version") {

            strategy1_2_3.compareWithVersion("1.2.3") shouldBe VersionCompare.SAME
        }

        should("throw Error on invalid version format") {

            shouldThrowAny {
                strategy1_2_3.compareWithVersion("-1")
            }
        }

        should("return strategies in ascending version order") {

            listOf<MigrationStrategy>(
                DummyStrategy(Version("1.2.3")),
                DummyStrategy(Version("1.0.5")),
                DummyStrategy(Version("2.1.5")),
                DummyStrategy(Version("1.2.4")),
            )
                .sortedBy { it.version }
                .map { it.version.version }
                .shouldBe(arrayOf("1.0.5", "1.2.3", "1.2.4", "2.1.5"))
        }
    })
