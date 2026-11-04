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
import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.model.CodeList
import de.ingrid.codelists.model.CodeListEntry
import de.ingrid.igeserver.profiles.ingrid_lubw.codelist30001
import de.ingrid.igeserver.services.CodelistHandler
import io.mockk.every

private val catalogCodelists: Map<String, CodeList> by lazy {
    buildCatalogCodelists()
}

private fun buildCatalogCodelists(): Map<String, CodeList> {
    val map = mutableMapOf<String, CodeList>()

    map["6006"] = CodeList().apply {
        id = "6006"
        name = "Freie Konformitäten"
        entries = mutableListOf(
            CodeListEntry().apply {
                id = "1"
                fields = mutableMapOf("de" to "Konformität - Freier Eintrag")
                data = "2018-02-22"
            },
        )
    }

    map["6250"] = CodeList().apply {
        id = "6250"
        name = "Verwaltungsgebiet"
        defaultEntry = "0"
        entries = mutableListOf(
            CodeListEntry().apply {
                id = "0"
                fields = mutableMapOf("de" to "Bundesrepublik Deutschland", "en" to "Federal Republic of Germany")
            },
            CodeListEntry().apply {
                id = "1"
                fields = mutableMapOf("de" to "Baden-Württemberg", "en" to "Baden Wurttemberg")
            },
            CodeListEntry().apply {
                id = "2"
                fields = mutableMapOf("de" to "Bayern", "en" to "Bavaria")
            },
            CodeListEntry().apply {
                id = "3"
                fields = mutableMapOf("de" to "Berlin", "en" to "Berlin")
            },
            CodeListEntry().apply {
                id = "4"
                fields = mutableMapOf("de" to "Brandenburg", "en" to "Brandenburg")
            },
            CodeListEntry().apply {
                id = "5"
                fields = mutableMapOf("de" to "Bremen", "en" to "Bremen")
            },
            CodeListEntry().apply {
                id = "6"
                fields = mutableMapOf("de" to "Hamburg", "en" to "Hamburg")
            },
            CodeListEntry().apply {
                id = "7"
                fields = mutableMapOf("de" to "Hessen", "en" to "Hessen")
            },
            CodeListEntry().apply {
                id = "8"
                fields = mutableMapOf("de" to "Mecklenburg-Vorpommern", "en" to "Mecklenburg-West Pomerania")
            },
            CodeListEntry().apply {
                id = "9"
                fields = mutableMapOf("de" to "Niedersachsen", "en" to "Lower Saxony")
            },
            CodeListEntry().apply {
                id = "10"
                fields = mutableMapOf("de" to "Nordrhein-Westfalen", "en" to "North Rhine Westphalia")
            },
            CodeListEntry().apply {
                id = "11"
                fields = mutableMapOf("de" to "Rheinland-Pfalz", "en" to "Rhineland Palatinate")
            },
            CodeListEntry().apply {
                id = "12"
                fields = mutableMapOf("de" to "Saarland", "en" to "Saarland")
            },
            CodeListEntry().apply {
                id = "13"
                fields = mutableMapOf("de" to "Sachsen", "en" to "Saxony ")
            },
            CodeListEntry().apply {
                id = "14"
                fields = mutableMapOf("de" to "Sachsen-Anhalt", "en" to "Saxony Anhalt")
            },
            CodeListEntry().apply {
                id = "15"
                fields = mutableMapOf("de" to "Schleswig-Holstein", "en" to "Schleswig-Holstein")
            },
            CodeListEntry().apply {
                id = "16"
                fields = mutableMapOf("de" to "Thüringen", "en" to "Thuringia")
            },
        )
    }

    map["3535"] = CodeList().apply {
        id = "3535"
        name = "Schlüsselkatalog"
        entries = mutableListOf(
            CodeListEntry().apply {
                id = "1"
                fields = mutableMapOf("de" to "von Drachenfels 94")
            },
        )
    }

    map["3555"] = CodeList().apply {
        id = "3555"
        name = "Symbolkatalog"
        entries = mutableListOf(
            CodeListEntry().apply {
                id = "1"
                fields = mutableMapOf("de" to "Ganzflächige Biotopkartierung 94")
            },
        )
    }

    val entries1350 = listOf(
        "1" to "Atomgesetz (AtG)",
        "2" to "Baugesetzbuch (BauGB)",
        "3" to "Bürgerl. Gesetzbuch (BGB)",
        "4" to "Bodenschutzgesetz (BodSchG)",
        "5" to "Bundesberggesetz (BBergG)",
        "7" to "Bundesnaturschutzgesetz (BNatSchG)",
        "8" to "Bundeswaldgesetz (BundeswaldG)",
        "9" to "Chemikaliengesetz (ChemG)",
        "10" to "Flurbereinigungsgesetz (FlurbG)",
        "11" to "Gentechnikgesetz (GenTG)",
        "13" to "Kreislaufwirtschafts- u. Abfallgesetz (KrW-/AbfG)",
        "14" to "Landesabfallgesetz (LAbfG)",
        "15" to "Landesabfallwirtschaftsgesetz (LAbfWG)",
        "16" to "Landschaftsgesetz (LG)",
        "17" to "Pflanzenschutzgesetz (PflSchG)",
        "18" to "Raumordnungsgesetz (ROG)",
        "19" to "Strahlenschutzvorsorgegesetz (StrVG)",
        "20" to "Tierschutzgesetz (TierSchG)",
        "21" to "Umwelthaftungsgesetz (UmweltHG)",
        "22" to "Umweltinformationsgesetz (UIG)",
        "23" to "Verwaltungsverfahrensgesetz (VwVfG)",
        "24" to "Bundeswasserstraßengesetz (WaStrG)",
        "25" to "Wasserhaushaltsgesetz (WHG)",
        "26" to "Umweltstatistikgesetz (Fass. 21.06.1994)",
        "27" to "Umweltstatistikgesetz (Fass. 14.03.1980)",
        "29" to "Trinkwasserverordnung (TrinkwV)",
        "30" to "TA Siedlungsabfall",
        "31" to "TA Abfall",
        "32" to "Strahlenschutzverordnung (StrlSchVO)",
        "33" to "Richtl. Em.- u. Im.-Überwachung. kerntech. Anl.",
        "34" to "RdErl. d. ML v. 16.1.1986, GültL 10/66",
        "35" to "Nieders. Wassergesetz (NWG)",
        "36" to "Nieders. Naturschutzgesetz (NNatG)",
        "38" to "Nieders. Abfallgesetz (NAbfG)",
        "39" to "Nieders. Deichgesetz (NDG)",
        "40" to "Nieders. Abfallgesetz. 6. Teil \"Altlasten\"",
        "41" to "Nieders. Abfallabgabengesetz",
        "42" to "Landesraumordnungsprogramm LROP",
        "43" to "KTA 1508",
        "45" to "Gesetz über eine Holzstatistik",
        "46" to "Ges. Statistik im Produzierenden Gewerbe",
        "47" to "Gesetz ü. d. Umweltverträglichkeitsprüfung (UVPG)",
        "48" to "Erlaß Nds. Umweltministerium vom 16.10.1992",
        "49" to "Bundesimmissionsschutzgesetz (BImSchG)",
        "50" to "BImSchG §47a",
        "51" to "Arbeitsschutzgesetz",
        "52" to "Anleitung zur Berechnung von Fluglärm",
        "53" to "Agrarstatistikgesetz (AgrStatG)",
        "54" to "Abfallklärschlammverordnung (AbfKlärV)",
        "55" to "Bundesimmissionsschutzverordnung, 23.",
        "56" to "Abwasserabgabengesetz (AbwAG)",
        "57" to "Wasserhaushaltsgesetz (WHG) § 7a",
        "58" to "§ 152 NWG (Abwasserbeseitigungspläne)",
        "59" to "§ 52 Nieders. Wassergesetz (NWG)",
        "60" to "§ 67 NWG",
        "61" to "23. Bundesimmissionsschutzverordnung",
        "62" to "Abfallgesetz (AbfG)",
        "63" to "AdV-Plenumsbeschluß von 1994",
        "64" to "AdV-Plenumsbeschluß von1994",
        "65" to "Agrarstatistikgesetz AgrStatG",
        "67" to "Betriebssatzung der LGN v. 7.7.1997",
        "68" to "Bundesimmissionsschutzverordnung",
    )
    map["1350"] = CodeList().apply {
        id = "1350"
        name = "Rechtliche Grundlagen"
        entries = entries1350.map { (id, name) ->
            CodeListEntry().apply {
                this.id = id
                this.fields = mutableMapOf("de" to name, "en" to name)
            }
        }.toMutableList()
    }

    val codelist3385 = CodeListService().initialCodelists.find { it.id == "3385" }?.entries ?: emptyList()
    map["3386"] = CodeList().apply {
        id = "3386"
        name = "Ressourcen-Typ"
        entries = codelist3385.map { entry ->
            CodeListEntry().apply {
                this.id = entry.id
                val de = entry.fields?.get("de") ?: entry.fields?.get("en") ?: ""
                val en = entry.fields?.get("en") ?: de
                this.fields = mutableMapOf("de" to de, "en" to en)
            }
        }.toMutableList()
    }

    val entries3390 = listOf(
        "1" to "Audiovisual",
        "2" to "Book",
        "3" to "BookChapter",
        "4" to "Collection",
        "5" to "ComputationalNotebook",
        "6" to "ConferencePaper",
        "7" to "ConferenceProceeding",
        "8" to "DataPaper",
        "9" to "Dataset",
        "10" to "Dissertation",
        "11" to "Event",
        "12" to "Image",
        "13" to "InteractiveResource",
        "14" to "Instrument",
        "15" to "Journal",
        "16" to "JournalArticle",
        "17" to "Model",
        "18" to "OutputManagementPlan",
        "19" to "PeerReview",
        "20" to "PhysicalObject",
        "21" to "Preprint",
        "22" to "Report",
        "23" to "Service",
        "24" to "Software",
        "25" to "Sound",
        "26" to "Standard",
        "27" to "StudyRegistration",
        "28" to "Text",
        "29" to "Workflow",
        "30" to "Other",
    )
    map["3390"] = CodeList().apply {
        id = "3390"
        name = "Ressourcen-Typ (generell)"
        entries = entries3390.map { (id, value) ->
            CodeListEntry().apply {
                this.id = id
                this.fields = mutableMapOf("de" to value, "en" to value)
            }
        }.toMutableList()
    }
    map["30001"] = CodeList().apply {
        id = "30001"
        entries = codelist30001.map { (id, value) ->
            CodeListEntry().apply {
                this.id = id
                this.fields = mutableMapOf("de" to value, "en" to value)
            }
        }.toMutableList()
    }

    return map
}

fun mockCodelists(codelistHandler: CodelistHandler) {
    val codelists = CodeListService().initialCodelists

    every { codelistHandler.initialCodelists } answers { codelists }

    every { codelistHandler.getCatalogCodelist(any(), any()) } answers {
        val codelistId = secondArg<String>()
        catalogCodelists[codelistId]
    }

    every { codelistHandler.getCodelistValue(any(), any()) } answers {
        codelists
            .find { it.id == firstArg() }
            ?.entries
            ?.find { it.id == secondArg() }
            ?.fields?.get("de")
    }

    every { codelistHandler.getCodelistValue(any(), any(), any()) } answers {
        codelists
            .find { it.id == firstArg() }
            ?.entries
            ?.find { it.id == secondArg() }
            ?.fields?.get(thirdArg())
    }

    every { codelistHandler.getCodelists(any()) } answers {
        codelists.filter { it.id in firstArg() as List<String> }
    }

    every { codelistHandler.getCodeListEntryId(any(), any(), any()) } answers {
        codelists.find { it.id == firstArg() }
            ?.entries
            ?.find { it.fields?.get(thirdArg()) == secondArg() }
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

    every { codelistHandler.getCatalogCodelistKey(any(), "3386", any(), any()) } answers {
        when (thirdArg<String>()) {
            "Brochure/Bulletin" -> "2"

            else -> {
                println("Catalog-Codelist not mocked: ${thirdArg<String>()}")
                null
            }
        }
    }

    every { codelistHandler.getCatalogCodelistValue(any(), "3386", any(), any()) } answers {
        when (thirdArg<String>()) {
            "2" -> "Brochure/Bulletin"

            else -> {
                println("Catalog-Codelist not mocked: ${thirdArg<String>()}")
                null
            }
        }
    }

    every { codelistHandler.getCatalogCodelistKey(any(), "3390", any(), any()) } answers {
        when (thirdArg<String>()) {
            "ComputationalNotebook" -> "5"

            else -> {
                println("Catalog-Codelist not mocked: ${thirdArg<String>()}")
                null
            }
        }
    }

    every { codelistHandler.getCatalogCodelistValue(any(), "3390", any(), any()) } answers {
        when (thirdArg<String>()) {
            "5" -> "ComputationalNotebook"

            else -> {
                println("Catalog-Codelist not mocked: ${thirdArg<String>()}")
                null
            }
        }
    }

    every { codelistHandler.getCatalogCodelistValue(any(), "6250", any(), any()) } answers {
        when (thirdArg<String>()) {
            "7" -> "Hessen"

            else -> {
                println("Catalog-Codelist not mocked: ${thirdArg<String>()}")
                null
            }
        }
    }
}
