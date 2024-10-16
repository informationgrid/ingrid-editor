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
package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.annotation.JsonIgnore
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
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.services.CatalogProfile
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

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> = arrayOf(
        FacetGroup(
            "state",
            "Allgemein",
            arrayOf(
                Published(),
                ExceptFolders(),
                TitleSearch(),
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

        when (codelistId) {
            "6006" -> codelistHandler.removeAndAddCodelist(catalogId, codelist6006)
            "1350" -> codelistHandler.removeAndAddCodelist(catalogId, codelist1350)
            "6250" -> codelistHandler.removeAndAddCodelist(catalogId, codelist6250)
            "3535" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3535)
            "3555" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3555)
            null -> {
                codelistHandler.removeAndAddCodelists(
                    catalogId,
                    listOf(codelist6006, codelist1350, codelist6250, codelist3535, codelist3555),
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
            add(CodelistHandler.toCodelistEntry("1", "Konformität - Freier Eintrag", "2018-02-22"))
        }
    }

    private fun createCodelist6250(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "6250"
        catalog = catalogRef
        name = "Verwaltungsgebiet"
        description = ""
        defaultEntry = "0"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("0", "Bundesrepublik Deutschland", null, "Federal Republic of Germany"))
            add(CodelistHandler.toCodelistEntry("1", "Baden-Württemberg", null, "Baden Wurttemberg"))
            add(CodelistHandler.toCodelistEntry("2", "Bayern", null, "Bavaria"))
            add(CodelistHandler.toCodelistEntry("3", "Berlin", null, "Berlin"))
            add(CodelistHandler.toCodelistEntry("4", "Brandenburg", null, "Brandenburg"))
            add(CodelistHandler.toCodelistEntry("5", "Bremen", null, "Bremen"))
            add(CodelistHandler.toCodelistEntry("6", "Hamburg", null, "Hamburg"))
            add(CodelistHandler.toCodelistEntry("7", "Hessen", null, "Hessen"))
            add(CodelistHandler.toCodelistEntry("8", "Mecklenburg-Vorpommern", null, "Mecklenburg-West Pomerania"))
            add(CodelistHandler.toCodelistEntry("9", "Niedersachsen", null, "Lower Saxony"))
            add(CodelistHandler.toCodelistEntry("10", "Nordrhein-Westfalen", null, "North Rhine Westphalia"))
            add(CodelistHandler.toCodelistEntry("11", "Rheinland-Pfalz", null, "Rhineland Palatinate"))
            add(CodelistHandler.toCodelistEntry("12", "Saarland", null, "Saarland"))
            add(CodelistHandler.toCodelistEntry("13", "Sachsen", null, "Saxony "))
            add(CodelistHandler.toCodelistEntry("14", "Sachsen-Anhalt", null, "Saxony Anhalt"))
            add(CodelistHandler.toCodelistEntry("15", "Schleswig-Holstein", null, "Schleswig-Holstein"))
            add(CodelistHandler.toCodelistEntry("16", "Thüringen", null, "Thuringia"))
        }
    }

    private fun createCodelist3555(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3555"
        catalog = catalogRef
        name = "Symbolkatalog"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Ganzflächige Biotopkartierung 94"))
        }
    }

    private fun createCodelist3535(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3535"
        catalog = catalogRef
        name = "Schlüsselkatalog"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "von Drachenfels 94"))
        }
    }

    private fun createCodelist1350(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "1350"
        catalog = catalogRef
        name = "Weitere rechtliche Grundlagen"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Atomgesetz (AtG)"))
            add(CodelistHandler.toCodelistEntry("2", "Baugesetzbuch (BauGB)"))
            add(CodelistHandler.toCodelistEntry("3", "Bürgerl. Gesetzbuch (BGB)"))
            add(CodelistHandler.toCodelistEntry("4", "Bodenschutzgesetz (BodSchG)"))
            add(CodelistHandler.toCodelistEntry("5", "Bundesberggesetz (BBergG)"))
            add(CodelistHandler.toCodelistEntry("7", "Bundesnaturschutzgesetz (BNatSchG)"))
            add(CodelistHandler.toCodelistEntry("8", "Bundeswaldgesetz (BundeswaldG)"))
            add(CodelistHandler.toCodelistEntry("9", "Chemikaliengesetz (ChemG)"))
            add(CodelistHandler.toCodelistEntry("10", "Flurbereinigungsgesetz (FlurbG)"))
            add(CodelistHandler.toCodelistEntry("11", "Gentechnikgesetz (GenTG)"))
            add(CodelistHandler.toCodelistEntry("13", "Kreislaufwirtschafts- u. Abfallgesetz (KrW-/AbfG)"))
            add(CodelistHandler.toCodelistEntry("14", "Landesabfallgesetz (LAbfG)"))
            add(CodelistHandler.toCodelistEntry("15", "Landesabfallwirtschaftsgesetz (LAbfWG)"))
            add(CodelistHandler.toCodelistEntry("16", "Landschaftsgesetz (LG)"))
            add(CodelistHandler.toCodelistEntry("17", "Pflanzenschutzgesetz (PflSchG)"))
            add(CodelistHandler.toCodelistEntry("18", "Raumordnungsgesetz (ROG)"))
            add(CodelistHandler.toCodelistEntry("19", "Strahlenschutzvorsorgegesetz (StrVG)"))
            add(CodelistHandler.toCodelistEntry("20", "Tierschutzgesetz (TierSchG)"))
            add(CodelistHandler.toCodelistEntry("21", "Umwelthaftungsgesetz (UmweltHG)"))
            add(CodelistHandler.toCodelistEntry("22", "Umweltinformationsgesetz (UIG)"))
            add(CodelistHandler.toCodelistEntry("23", "Verwaltungsverfahrensgesetz (VwVfG)"))
            add(CodelistHandler.toCodelistEntry("24", "Bundeswasserstraßengesetz (WaStrG)"))
            add(CodelistHandler.toCodelistEntry("25", "Wasserhaushaltsgesetz (WHG)"))
            add(CodelistHandler.toCodelistEntry("26", "Umweltstatistikgesetz (Fass. 21.06.1994)"))
            add(CodelistHandler.toCodelistEntry("27", "Umweltstatistikgesetz (Fass. 14.03.1980)"))
            add(CodelistHandler.toCodelistEntry("29", "Trinkwasserverordnung (TrinkwV)"))
            add(CodelistHandler.toCodelistEntry("30", "TA Siedlungsabfall"))
            add(CodelistHandler.toCodelistEntry("31", "TA Abfall"))
            add(CodelistHandler.toCodelistEntry("32", "Strahlenschutzverordnung (StrlSchVO)"))
            add(CodelistHandler.toCodelistEntry("33", "Richtl. Em.- u. Im.-Überwachung. kerntech. Anl."))
            add(CodelistHandler.toCodelistEntry("34", "RdErl. d. ML v. 16.1.1986, GültL 10/66"))
            add(CodelistHandler.toCodelistEntry("35", "Nieders. Wassergesetz (NWG)"))
            add(CodelistHandler.toCodelistEntry("36", "Nieders. Naturschutzgesetz (NNatG)"))
            add(CodelistHandler.toCodelistEntry("38", "Nieders. Abfallgesetz (NAbfG)"))
            add(CodelistHandler.toCodelistEntry("39", "Nieders. Deichgesetz (NDG)"))
            add(CodelistHandler.toCodelistEntry("40", "Nieders. Abfallgesetz. 6. Teil \"Altlasten\""))
            add(CodelistHandler.toCodelistEntry("41", "Nieders. Abfallabgabengesetz"))
            add(CodelistHandler.toCodelistEntry("42", "Landesraumordnungsprogramm LROP"))
            add(CodelistHandler.toCodelistEntry("43", "KTA 1508"))
            add(CodelistHandler.toCodelistEntry("45", "Gesetz über eine Holzstatistik"))
            add(CodelistHandler.toCodelistEntry("46", "Ges. Statistik im Produzierenden Gewerbe"))
            add(CodelistHandler.toCodelistEntry("47", "Gesetz ü. d. Umweltverträglichkeitsprüfung (UVPG)"))
            add(CodelistHandler.toCodelistEntry("48", "Erlaß Nds. Umweltministerium vom 16.10.1992"))
            add(CodelistHandler.toCodelistEntry("49", "Bundesimmissionsschutzgesetz (BImSchG)"))
            add(CodelistHandler.toCodelistEntry("50", "BImSchG §47a"))
            add(CodelistHandler.toCodelistEntry("51", "Arbeitsschutzgesetz"))
            add(CodelistHandler.toCodelistEntry("52", "Anleitung zur Berechnung von Fluglärm"))
            add(CodelistHandler.toCodelistEntry("53", "Agrarstatistikgesetz (AgrStatG)"))
            add(CodelistHandler.toCodelistEntry("54", "Abfallklärschlammverordnung (AbfKlärV)"))
            add(CodelistHandler.toCodelistEntry("55", "Bundesimmissionsschutzverordnung, 23."))
            add(CodelistHandler.toCodelistEntry("56", "Abwasserabgabengesetz (AbwAG)"))
            add(CodelistHandler.toCodelistEntry("57", "Wasserhaushaltsgesetz (WHG) § 7a"))
            add(CodelistHandler.toCodelistEntry("58", "§ 152 NWG (Abwasserbeseitigungspläne)"))
            add(CodelistHandler.toCodelistEntry("59", "§ 52 Nieders. Wassergesetz (NWG)"))
            add(CodelistHandler.toCodelistEntry("60", "§ 67 NWG"))
            add(CodelistHandler.toCodelistEntry("61", "23. Bundesimmissionsschutzverordnung"))
            add(CodelistHandler.toCodelistEntry("62", "Abfallgesetz (AbfG)"))
            add(CodelistHandler.toCodelistEntry("63", "AdV-Plenumsbeschluß von 1994"))
            add(CodelistHandler.toCodelistEntry("64", "AdV-Plenumsbeschluß von1994"))
            add(CodelistHandler.toCodelistEntry("65", "Agrarstatistikgesetz AgrStatG"))
            add(CodelistHandler.toCodelistEntry("67", "Betriebssatzung der LGN v. 7.7.1997"))
            add(CodelistHandler.toCodelistEntry("68", "Bundesimmissionsschutzverordnung"))
        }
    }

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
                    CREATE INDEX IF NOT EXISTS parentIdentGin  ON document USING gin((data -> 'parentIdentifier'));
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
                    } catch (ex: Exception) {
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
