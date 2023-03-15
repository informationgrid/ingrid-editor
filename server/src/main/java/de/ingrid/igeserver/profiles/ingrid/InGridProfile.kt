package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.imports.DocumentAnalysis
import de.ingrid.igeserver.imports.OptimizedImportAnalysis
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.IndexIdFieldConfig
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ingrid")
class InGridProfile @Autowired constructor(
    @JsonIgnore val catalogRepo: CatalogRepository,
    @JsonIgnore val codelistHandler: CodelistHandler,
    @JsonIgnore @Lazy val documentService: DocumentService
) : CatalogProfile {
    companion object {
        const val id = "ingrid"
    }

    override val identifier = id
    override val title = "InGrid Katalog"
    override val description = null
    override val indexExportFormatID = "indexInGridIDF"
    override val indexIdField = IndexIdFieldConfig("t01_object.obj_id", "t02_address.adr_id")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf()
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        return arrayOf()
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist6006 = createCodelist6006(catalogRef)
        val codelist1350 = createCodelist1350(catalogRef)
        val codelist1370 = createCodelist1370(catalogRef)
        val codelist3535 = createCodelist3535(catalogRef)
        val codelist3555 = createCodelist3555(catalogRef)

        when (codelistId) {
            "6006" -> codelistHandler.removeAndAddCodelist(catalogId, codelist6006)
            "1350" -> codelistHandler.removeAndAddCodelist(catalogId, codelist1350)
            "1370" -> codelistHandler.removeAndAddCodelist(catalogId, codelist1370)
            "3535" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3535)
            "3555" -> codelistHandler.removeAndAddCodelist(catalogId, codelist3555)
            null -> {
                codelistHandler.removeAndAddCodelists(
                    catalogId,
                    listOf(codelist6006, codelist1350, codelist1370, codelist3535, codelist3555)
                )
            }

            else -> throw ClientException.withReason("Codelist $codelistId is not supported by this profile: $identifier")
        }
    }

    private fun createCodelist6006(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "6006"
            catalog = catalogRef
            name = "Freie Konformitäten"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "Konformität - Freier Eintrag", "2018-02-22"))
            }
        }
    }

    private fun createCodelist1370(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "1370"
            catalog = catalogRef
            name = "XML Exportkriterium"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "CDS"))
            }
        }
    }

    private fun createCodelist3555(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "3555"
            catalog = catalogRef
            name = "Symbolkatalog"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "Ganzflächige Biotopkartierung 94"))
            }
        }
    }

    private fun createCodelist3535(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "3535"
            catalog = catalogRef
            name = "Schlüsselkatalog"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "von Drachenfels 94"))
            }
        }
    }

    private fun createCodelist1350(catalogRef: Catalog): Codelist {
        return Codelist().apply {
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
    }

    override fun initCatalogQueries(catalogId: String) {

    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/ingrid/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/ingrid/default-settings.json")?.readText() ?: ""
    }

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
                val coupledResources = it.get("coupledResources") as ArrayNode
                coupledResources.removeAll { node -> node.get("uuid")?.asText() in uuids }
                
            }
        }
    }
}