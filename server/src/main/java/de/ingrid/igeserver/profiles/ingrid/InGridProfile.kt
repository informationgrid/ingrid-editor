/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.imports.DocumentAnalysis
import de.ingrid.igeserver.imports.OptimizedImportAnalysis
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.profiles.ingrid.quickfilter.DocumentTypes
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid.quickfilter.SpatialInGrid
import de.ingrid.igeserver.profiles.uvp.quickfilter.TitleSearch
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.ArchivedDocs
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.CodelistField
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.CodelistHandler.Companion.toCodelistEntry
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.IndexIdFieldConfig
import de.ingrid.igeserver.utils.getString
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class InGridProfile(
    @JsonIgnore val catalogRepo: CatalogRepository,
    @JsonIgnore val codelistHandler: CodelistHandler,
    @JsonIgnore @Lazy val documentService: DocumentService,
    @JsonIgnore val query: QueryRepository,
    @JsonIgnore val dateService: DateService,
    @JsonIgnore val openDataCategory: OpenDataCategory,
) : CatalogProfile {

    @Autowired
    @JsonIgnore
    lateinit var entityManager: EntityManager

    @Autowired
    @JsonIgnore
    private lateinit var transactionManager: PlatformTransactionManager

    companion object {
        const val ID = "ingrid"
    }

    override val identifier = ID
    override val title = "InGrid Katalog"
    override val description = null
    override val indexExportFormatID = "indexInGridIDF"
    override val indexIdField = IndexIdFieldConfig("t01_object.obj_id", "t02_address.adr_id")
    override val codelistFields = listOf(
        CodelistField.ListField("advProductGroups", null, "8010"),
        CodelistField.ListField("spatial.spatialSystems", null, "100"),
//      CodelistField.SingleField("gridSpatialRepresentation.type", ""),
        CodelistField.ListField("distribution.format", "name", "1320"),
        CodelistField.SingleField("fileReferences.format", "1320"),
        CodelistField.ListField("themes", null, "6100"),
        CodelistField.ListField("openDataCategories", null, "6400"),
        CodelistField.ListField("hvdCategories", null, "hvdCategories"),
        CodelistField.ListField("priorityDatasets", null, "6350"),
        CodelistField.SingleField("spatialScope", "6360"),
        CodelistField.ListField("topicCategories", null, "527"),
        CodelistField.SingleField("spatial.verticalExtent.unitOfMeasure", "102"),
        CodelistField.SingleField("spatial.verticalExtent.Datum", "101"),
        CodelistField.ListField("temporal.events", "referenceDateType", "502"),
        CodelistField.SingleField("temporal.status", "523"),
        CodelistField.SingleField("maintenanceInformation.maintenanceAndUpdateFrequency", "518"),
        CodelistField.SingleField("maintenanceInformation.userDefinedMaintenanceFrequency.unit", "1230"),
        CodelistField.SingleField("metadata.language", "99999999"),
        CodelistField.ListField("dataset.languages", null, "99999999"),
        CodelistField.SingleField("metadata.characterSet", "510"),
        CodelistField.ListField("conformanceResult", "pass", "6000"),
        CodelistField.ListField("conformanceResult", "specification", "6005"),
        CodelistField.ListField("extraInfo.legalBasicsDescriptions", null, "1350"),
        CodelistField.ListField("resource.accessConstraints", null, "6010"),
        CodelistField.ListField("resource.useConstraints", "title", "6500"),
        CodelistField.ListField("digitalTransferOptions", "name", "520"),
        CodelistField.SingleField("generalResourceType", "3390"),
        CodelistField.SingleField("resourceType", "3386"),
        CodelistField.ListField("references", "type", "2000"),
        CodelistField.ListField("references", "urlDataType", "1320"),
        CodelistField.ListField("pointOfContact", "type", "505"),

        CodelistField.SingleField("service.type", "5100"),
        CodelistField.ListField("service.classification", null, "5200"),
        CodelistField.ListField("service.version", null, "5152"), // dynamic!!!
        CodelistField.ListField("service.operations", "name", "5110"), // dynamic!!!
    )

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> = arrayOf(
        FacetGroup(
            "state",
            "Allgemein",
            arrayOf(
                Published(),
                ExceptFolders(),
                TitleSearch(),
                ArchivedDocs(),
            ),
            viewComponent = ViewComponent.CHECKBOX,
            combine = Operator.AND,
        ),
        FacetGroup(
            "spatial",
            "Raumbezug",
            arrayOf(
                SpatialInGrid(),
            ),
            viewComponent = ViewComponent.SPATIAL,
        ),
        FacetGroup(
            "timeRef",
            "Zeitbezug",
            arrayOf(
                TimeSpan(),
            ),
            viewComponent = ViewComponent.TIMESPAN,
        ),
        FacetGroup(
            "docType",
            "Datensatztyp",
            arrayOf(
                DocumentTypes(),
            ),
            viewComponent = ViewComponent.SELECT,
        ),
        FacetGroup(
            "openDataCategory",
            "OpenData Kategorie",
            arrayOf(
                openDataCategory,
            ),
            viewComponent = ViewComponent.SELECT,
        ),
    )

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> = arrayOf(
        FacetGroup(
            "state",
            "Allgemein",
            arrayOf(
                Published(),
                ExceptFolders(),
            ),
            viewComponent = ViewComponent.CHECKBOX,
        ),
    )

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist6006 = createCodelist6006(catalogRef)
        val codelist1350 = createCodelist1350(catalogRef)
        val codelist6250 = createCodelist6250(catalogRef)
        val codelist3535 = createCodelist3535(catalogRef)
        val codelist3555 = createCodelist3555(catalogRef)
        val codelist3386 = createCodelist3386(catalogRef)
        val codelist3390 = createCodelist3390(catalogRef)

        when (codelistId) {
            "6006" -> codelistHandler.removeAndAddCodelist(catalogId, codelist6006)
            "1350" -> codelistHandler.removeAndAddCodelist(catalogId, codelist1350)
            "6250" -> codelistHandler.removeAndAddCodelist(catalogId, codelist6250)
            "3535" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3535)
            "3555" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3555)
            "3386" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3386)
            "3390" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3390)
            null -> {
                codelistHandler.removeAndAddCodelists(
                    catalogId,
                    listOf(
                        codelist6006,
                        codelist1350,
                        codelist6250,
                        codelist3535,
                        codelist3555,
                        codelist3386,
                        codelist3390,
                    ),
                )
            }

            else -> throw ClientException.withReason("Codelist $codelistId is not supported by this profile: $identifier")
        }
    }

    private fun createCodelist6006(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "6006"
        catalog = catalogRef
        name = "Freie Konformitäten"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(toCodelistEntry("1", "Konformität - Freier Eintrag", "2018-02-22"))
        }
    }

    private fun createCodelist6250(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "6250"
        catalog = catalogRef
        name = "Verwaltungsgebiet"
        description = ""
        defaultEntry = "0"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(toCodelistEntry("0", "Bundesrepublik Deutschland", null, "Federal Republic of Germany"))
            add(toCodelistEntry("1", "Baden-Württemberg", null, "Baden Wurttemberg"))
            add(toCodelistEntry("2", "Bayern", null, "Bavaria"))
            add(toCodelistEntry("3", "Berlin", null, "Berlin"))
            add(toCodelistEntry("4", "Brandenburg", null, "Brandenburg"))
            add(toCodelistEntry("5", "Bremen", null, "Bremen"))
            add(toCodelistEntry("6", "Hamburg", null, "Hamburg"))
            add(toCodelistEntry("7", "Hessen", null, "Hessen"))
            add(toCodelistEntry("8", "Mecklenburg-Vorpommern", null, "Mecklenburg-West Pomerania"))
            add(toCodelistEntry("9", "Niedersachsen", null, "Lower Saxony"))
            add(toCodelistEntry("10", "Nordrhein-Westfalen", null, "North Rhine Westphalia"))
            add(toCodelistEntry("11", "Rheinland-Pfalz", null, "Rhineland Palatinate"))
            add(toCodelistEntry("12", "Saarland", null, "Saarland"))
            add(toCodelistEntry("13", "Sachsen", null, "Saxony "))
            add(toCodelistEntry("14", "Sachsen-Anhalt", null, "Saxony Anhalt"))
            add(toCodelistEntry("15", "Schleswig-Holstein", null, "Schleswig-Holstein"))
            add(toCodelistEntry("16", "Thüringen", null, "Thuringia"))
        }
    }

    private fun createCodelist3555(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3555"
        catalog = catalogRef
        name = "Symbolkatalog"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(toCodelistEntry("1", "Ganzflächige Biotopkartierung 94"))
        }
    }

    private fun createCodelist3535(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3535"
        catalog = catalogRef
        name = "Schlüsselkatalog"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(toCodelistEntry("1", "von Drachenfels 94"))
        }
    }

    private fun createCodelist1350(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "1350"
        catalog = catalogRef
        name = "Rechtliche Grundlagen"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(toCodelistEntry("1", "Atomgesetz (AtG)"))
            add(toCodelistEntry("2", "Baugesetzbuch (BauGB)"))
            add(toCodelistEntry("3", "Bürgerl. Gesetzbuch (BGB)"))
            add(toCodelistEntry("4", "Bodenschutzgesetz (BodSchG)"))
            add(toCodelistEntry("5", "Bundesberggesetz (BBergG)"))
            add(toCodelistEntry("7", "Bundesnaturschutzgesetz (BNatSchG)"))
            add(toCodelistEntry("8", "Bundeswaldgesetz (BundeswaldG)"))
            add(toCodelistEntry("9", "Chemikaliengesetz (ChemG)"))
            add(toCodelistEntry("10", "Flurbereinigungsgesetz (FlurbG)"))
            add(toCodelistEntry("11", "Gentechnikgesetz (GenTG)"))
            add(toCodelistEntry("13", "Kreislaufwirtschafts- u. Abfallgesetz (KrW-/AbfG)"))
            add(toCodelistEntry("14", "Landesabfallgesetz (LAbfG)"))
            add(toCodelistEntry("15", "Landesabfallwirtschaftsgesetz (LAbfWG)"))
            add(toCodelistEntry("16", "Landschaftsgesetz (LG)"))
            add(toCodelistEntry("17", "Pflanzenschutzgesetz (PflSchG)"))
            add(toCodelistEntry("18", "Raumordnungsgesetz (ROG)"))
            add(toCodelistEntry("19", "Strahlenschutzvorsorgegesetz (StrVG)"))
            add(toCodelistEntry("20", "Tierschutzgesetz (TierSchG)"))
            add(toCodelistEntry("21", "Umwelthaftungsgesetz (UmweltHG)"))
            add(toCodelistEntry("22", "Umweltinformationsgesetz (UIG)"))
            add(toCodelistEntry("23", "Verwaltungsverfahrensgesetz (VwVfG)"))
            add(toCodelistEntry("24", "Bundeswasserstraßengesetz (WaStrG)"))
            add(toCodelistEntry("25", "Wasserhaushaltsgesetz (WHG)"))
            add(toCodelistEntry("26", "Umweltstatistikgesetz (Fass. 21.06.1994)"))
            add(toCodelistEntry("27", "Umweltstatistikgesetz (Fass. 14.03.1980)"))
            add(toCodelistEntry("29", "Trinkwasserverordnung (TrinkwV)"))
            add(toCodelistEntry("30", "TA Siedlungsabfall"))
            add(toCodelistEntry("31", "TA Abfall"))
            add(toCodelistEntry("32", "Strahlenschutzverordnung (StrlSchVO)"))
            add(toCodelistEntry("33", "Richtl. Em.- u. Im.-Überwachung. kerntech. Anl."))
            add(toCodelistEntry("34", "RdErl. d. ML v. 16.1.1986, GültL 10/66"))
            add(toCodelistEntry("35", "Nieders. Wassergesetz (NWG)"))
            add(toCodelistEntry("36", "Nieders. Naturschutzgesetz (NNatG)"))
            add(toCodelistEntry("38", "Nieders. Abfallgesetz (NAbfG)"))
            add(toCodelistEntry("39", "Nieders. Deichgesetz (NDG)"))
            add(toCodelistEntry("40", "Nieders. Abfallgesetz. 6. Teil \"Altlasten\""))
            add(toCodelistEntry("41", "Nieders. Abfallabgabengesetz"))
            add(toCodelistEntry("42", "Landesraumordnungsprogramm LROP"))
            add(toCodelistEntry("43", "KTA 1508"))
            add(toCodelistEntry("45", "Gesetz über eine Holzstatistik"))
            add(toCodelistEntry("46", "Ges. Statistik im Produzierenden Gewerbe"))
            add(toCodelistEntry("47", "Gesetz ü. d. Umweltverträglichkeitsprüfung (UVPG)"))
            add(toCodelistEntry("48", "Erlaß Nds. Umweltministerium vom 16.10.1992"))
            add(toCodelistEntry("49", "Bundesimmissionsschutzgesetz (BImSchG)"))
            add(toCodelistEntry("50", "BImSchG §47a"))
            add(toCodelistEntry("51", "Arbeitsschutzgesetz"))
            add(toCodelistEntry("52", "Anleitung zur Berechnung von Fluglärm"))
            add(toCodelistEntry("53", "Agrarstatistikgesetz (AgrStatG)"))
            add(toCodelistEntry("54", "Abfallklärschlammverordnung (AbfKlärV)"))
            add(toCodelistEntry("55", "Bundesimmissionsschutzverordnung, 23."))
            add(toCodelistEntry("56", "Abwasserabgabengesetz (AbwAG)"))
            add(toCodelistEntry("57", "Wasserhaushaltsgesetz (WHG) § 7a"))
            add(toCodelistEntry("58", "§ 152 NWG (Abwasserbeseitigungspläne)"))
            add(toCodelistEntry("59", "§ 52 Nieders. Wassergesetz (NWG)"))
            add(toCodelistEntry("60", "§ 67 NWG"))
            add(toCodelistEntry("61", "23. Bundesimmissionsschutzverordnung"))
            add(toCodelistEntry("62", "Abfallgesetz (AbfG)"))
            add(toCodelistEntry("63", "AdV-Plenumsbeschluß von 1994"))
            add(toCodelistEntry("64", "AdV-Plenumsbeschluß von1994"))
            add(toCodelistEntry("65", "Agrarstatistikgesetz AgrStatG"))
            add(toCodelistEntry("67", "Betriebssatzung der LGN v. 7.7.1997"))
            add(toCodelistEntry("68", "Bundesimmissionsschutzverordnung"))
        }
    }

    private fun createCodelist3386(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3386"
        catalog = catalogRef
        name = "Ressourcen-Typ"
        description =
            "Die Liste der Ressourcentypen ist initial eine Kopie der Codeliste 3385: Objektklasse 2 - Dokumenttyp"
        data = jacksonObjectMapper().createArrayNode().apply {
            codelistHandler.getCodelists(listOf("3385"))?.get(0)?.entries?.let { codelist3385 ->
                codelist3385.forEach { entry ->
                    val de = entry.fields.get("de") ?: entry.fields.get("en") ?: ""
                    add(toCodelistEntry(entry.id, de, null, entry.fields.get("en")))
                }
            }
        }
    }

    private fun createCodelist3390(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3390"
        catalog = catalogRef
        name = "Ressourcen-Typ (generell)"
        description =
            "Die Liste der generellen Ressourcentypen ist übernommen von https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/resourcetype/#a-resourcetypegeneral"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(toDualLanguageCodelistEntry("1", "Audiovisual"))
            add(toDualLanguageCodelistEntry("2", "Book"))
            add(toDualLanguageCodelistEntry("3", "BookChapter"))
            add(toDualLanguageCodelistEntry("4", "Collection"))
            add(toDualLanguageCodelistEntry("5", "ComputationalNotebook"))
            add(toDualLanguageCodelistEntry("6", "ConferencePaper"))
            add(toDualLanguageCodelistEntry("7", "ConferenceProceeding"))
            add(toDualLanguageCodelistEntry("8", "DataPaper"))
            add(toDualLanguageCodelistEntry("9", "Dataset"))
            add(toDualLanguageCodelistEntry("10", "Dissertation"))
            add(toDualLanguageCodelistEntry("11", "Event"))
            add(toDualLanguageCodelistEntry("12", "Image"))
            add(toDualLanguageCodelistEntry("13", "InteractiveResource"))
            add(toDualLanguageCodelistEntry("14", "Instrument"))
            add(toDualLanguageCodelistEntry("15", "Journal"))
            add(toDualLanguageCodelistEntry("16", "JournalArticle"))
            add(toDualLanguageCodelistEntry("17", "Model"))
            add(toDualLanguageCodelistEntry("18", "OutputManagementPlan"))
            add(toDualLanguageCodelistEntry("19", "PeerReview"))
            add(toDualLanguageCodelistEntry("20", "PhysicalObject"))
            add(toDualLanguageCodelistEntry("21", "Preprint"))
            add(toDualLanguageCodelistEntry("22", "Report"))
            add(toDualLanguageCodelistEntry("23", "Service"))
            add(toDualLanguageCodelistEntry("24", "Software"))
            add(toDualLanguageCodelistEntry("25", "Sound"))
            add(toDualLanguageCodelistEntry("26", "Standard"))
            add(toDualLanguageCodelistEntry("27", "StudyRegistration"))
            add(toDualLanguageCodelistEntry("28", "Text"))
            add(toDualLanguageCodelistEntry("29", "Workflow"))
            add(toDualLanguageCodelistEntry("30", "Other"))
        }
    }

    private fun toDualLanguageCodelistEntry(id: String, value: String): JsonNode = toCodelistEntry(id, value, null, value)

    override fun initCatalogQueries(catalogId: String) {
        val queryTest = Query().apply {
            this.catalog = catalogRepo.findByIdentifier(catalogId)
            category = "sql"
            name = "Alle Dokumente ohne Adressreferenzen"
            description = "Zeigt alle Dokumente an, die keine Adresse angegeben haben"
            data = jacksonObjectMapper().createObjectNode().apply {
                put(
                    "sql",
                    """
                SELECT document1.*, document_wrapper.category
                FROM document_wrapper JOIN document document1 ON document_wrapper.uuid=document1.uuid
                WHERE document1.is_latest = true AND document_wrapper.category = 'data'
                  AND document_wrapper.type <> 'FOLDER'
                  AND (data ->> 'pointOfContact' IS NULL OR data -> 'pointOfContact' = '[]'\:\:jsonb)
                    """.trimIndent(),
                )
            }
            global = true
            modified = dateService.now()
        }
        query.save(queryTest)
    }

    override fun initIndices() {
        ClosableTransaction(transactionManager).use {
            entityManager
                .createNativeQuery(
                    """
                    CREATE INDEX IF NOT EXISTS parentIdentGin ON document USING gin((data -> 'parentIdentifier'));
                    CREATE INDEX IF NOT EXISTS coupledResourcesGin ON document USING gin((data->'service'->'coupledResources'));
                    CREATE INDEX IF NOT EXISTS referencesGin ON document USING gin((data->'references'));
                    """.trimIndent(),
                )
                .executeUpdate()
        }
    }

    override fun getElasticsearchMapping(format: String): String = {}.javaClass.getResource("/ingrid/mappings/default-mapping.json")?.readText() ?: ""

    override fun getElasticsearchSetting(format: String): String = {}.javaClass.getResource("/ingrid/default-settings.json")?.readText() ?: ""

    override fun additionalImportAnalysis(catalogId: String, report: OptimizedImportAnalysis, message: Message) {
        val notExistingCoupledResources = mutableListOf<String>()

        report.references
            .flatMap { it.document.data.get("service")?.get("coupledResources")?.toList() ?: emptyList() }
            .filter { !it.get("isExternalRef").asBoolean() }
            .map { it.get("uuid").asText() }
            .forEach { coupledUuid ->
                val referenceInImport = report.references.any { it.document.uuid == coupledUuid }
                if (!referenceInImport) {
                    try {
                        documentService.getWrapperByCatalogAndDocumentUuid(catalogId, coupledUuid)
                    } catch (_: Exception) {
                        message.infos.add("Coupled Resource with UUID $coupledUuid was not found. Removing reference.")
                        notExistingCoupledResources.add(coupledUuid)
                    }
                }
            }

        removeReferencesFromDatasets(report.references, notExistingCoupledResources)
    }

    private fun removeReferencesFromDatasets(refs: List<DocumentAnalysis>, uuids: MutableList<String>) {
        refs.forEach { ref ->
            ref.document.data.get("service")?.let {
                (it.get("coupledResources") as ArrayNode?)
                    ?.removeAll { node -> node.getString("uuid") in uuids }
            }
        }
    }
}
