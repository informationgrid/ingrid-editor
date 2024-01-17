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
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.services.CodelistHandler
import io.mockk.every

fun mockCodelists(codelistHandler: CodelistHandler) {
    val codelists = CodeListService().initialCodelists

    every { codelistHandler.getCodelistValue(any(), any()) } answers {
        codelists
            .find { it.id == firstArg() }
            ?.entries
            ?.find { it.id == secondArg() }
            ?.getField("de")
    }

    every { codelistHandler.getCodelistValue(any(), any(), any()) } answers {
        codelists
            .find { it.id == firstArg() }
            ?.entries
            ?.find { it.id == secondArg() }
            ?.getField(thirdArg())
    }

    every { codelistHandler.getCodelists(any()) } answers {
        codelists.filter { it.id in firstArg() as List<String> }
    }

    every { codelistHandler.getCodeListEntryId(any(), any(), any()) } answers {
        codelists.find { it.id == firstArg() }
            ?.entries
            ?.find { it.getField(thirdArg()) == secondArg() }
            ?.id
    }

    every { codelistHandler.getCodelistEntryDataField(any(), any()) } answers {
        codelists.find { it.id == firstArg() }
            ?.entries
            ?.find { it.id == secondArg() }
            ?.data
    }

    every { codelistHandler.getCodeListEntryIdMatchingData(any(), any()) } answers {
        codelists.find { it.id == firstArg() }
            ?.entries?.find { it.data.contains(secondArg() as String) }
            ?.id
    }
    
    every { codelistHandler.getCatalogCodelistKey(any(), "6250", any()) } answers {
        when (thirdArg<String>()) {
                "Brandenburg" -> "4"
                "Hamburg" -> "6"
            else -> {
                println("Catalog-Codelist not mocked: ${thirdArg<String>()}")
                null
            }
        }
    }
}
