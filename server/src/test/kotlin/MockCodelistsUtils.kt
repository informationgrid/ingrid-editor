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
}