package igeserver.validation

import de.ingrid.igeserver.services.DocValidator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.comparables.beEqualComparingTo
import io.kotest.matchers.should

class DocValidator : ShouldSpec({
    should("throw a NullPointerException if no _profile present") {
        shouldThrow<NullPointerException> {
            DocValidator().run("{}")
        }
    }

    should("find validation error") {
        val result = DocValidator().run("""{"_profile": "UVP"}""")
        result.size should beEqualComparingTo(1)
        result.elementAt(0).message should beEqualComparingTo("One or more document links are not published.")
    }
})
