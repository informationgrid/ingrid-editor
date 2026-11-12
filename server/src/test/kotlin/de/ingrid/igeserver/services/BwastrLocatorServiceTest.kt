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
package de.ingrid.igeserver.services

import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk

class BwastrLocatorServiceTest :
    ShouldSpec({
        val codelistHandler = mockk<CodelistHandler>()
        every { codelistHandler.getCodelistValue(any(), any(), any()) } returns null
        every { codelistHandler.getCodelistValue("BAW_bwastrIds", "7000", "de") } returns "Nordsee"
        val service = BwastrLocatorService(codelistHandler)

        should("resolve a special BWaStr ID from the codelist") {
            val result = service.getSpecial("7000")!!
            result.bwastrid shouldBe "7000"
            result.bwastr_name shouldBe "Nordsee"
            result.strecken_name shouldBe ""
            result.concat_name shouldBe "7000 Nordsee"
        }

        should("ignore leading zeros") {
            service.getSpecial("07000")!!.bwastrid shouldBe "7000"
        }

        should("return null for IDs that are not in the codelist") {
            service.getSpecial("701").shouldBeNull()
            service.getSpecial("").shouldBeNull()
            service.getSpecial("0000").shouldBeNull()
        }
    })
