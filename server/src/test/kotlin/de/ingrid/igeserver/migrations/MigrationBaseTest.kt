package de.ingrid.igeserver.migrations

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.migrations.MigrationStrategy
import de.ingrid.igeserver.migrations.Version
import de.ingrid.igeserver.migrations.VersionCompare
import io.kotest.assertions.throwables.shouldThrowAny
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe

class MigrationBaseTest : ShouldSpec({

    class DummyStrategy(override val version: Version) : MigrationBase("") {
        override fun exec() {
        }
    }

    val strategy1_2_3 = DummyStrategy(Version("1.2.3"))
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

        listOf<MigrationStrategy>(DummyStrategy(Version("1.2.3")),
                DummyStrategy(Version("1.0.5")),
                DummyStrategy(Version("2.1.5")),
                DummyStrategy(Version("1.2.4")))
                .sortedBy { it.version }
                .map { it.version.version }
                .shouldBe(arrayOf("1.0.5", "1.2.3", "1.2.4", "2.1.5"))

    }

})
