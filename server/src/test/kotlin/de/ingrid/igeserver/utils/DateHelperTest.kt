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
package de.ingrid.igeserver.utils

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class DateHelperTest {

    @Test
    fun `normalizeToUtc handles offset datetime`() {
        assertEquals("2026-08-31T15:15:00.000Z", DateHelper.normalizeToUtc("2026-08-31T17:15:00+02:00"))
        assertEquals("2026-08-31T17:15:00.000Z", DateHelper.normalizeToUtc("2026-08-31T17:15:00Z"))
    }

    @Test
    fun `normalizeToUtc handles local date`() {
        // Europe/Berlin at 1978-10-24 was Central European Time (UTC+1)
        assertEquals("1978-10-23T23:00:00.000Z", DateHelper.normalizeToUtc("1978-10-24"))
    }

    @Test
    fun `normalizeToUtc handles local datetime without offset`() {
        // This is the case reported in the issue
        // "1978-10-24T00:00:00"
        assertEquals("1978-10-23T23:00:00.000Z", DateHelper.normalizeToUtc("1978-10-24T00:00:00"))

        // Summer time (UTC+2)
        assertEquals("2026-08-31T15:15:00.000Z", DateHelper.normalizeToUtc("2026-08-31T17:15:00"))
    }
}
