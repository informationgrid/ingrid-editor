package de.ingrid.igeserver.profiles.uvp

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.profiles.uvp.quickfilter.EIANumber
import de.ingrid.igeserver.profiles.uvp.quickfilter.ProcedureTypes
import de.ingrid.igeserver.profiles.uvp.quickfilter.ProcessStep
import de.ingrid.igeserver.profiles.uvp.quickfilter.TitleSearch
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.Spatial
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service
class UvpProfile(
    @JsonIgnore val catalogRepo: CatalogRepository,
    @JsonIgnore val query: QueryRepository,
    @JsonIgnore val dateService: DateService,
    @JsonIgnore val authUtils: AuthUtils,
    @JsonIgnore val behaviourService: BehaviourService
) : CatalogProfile {

    companion object {
        const val id = "uvp"
    }

    override val identifier = id
    override val title = "UVP Katalog"
    override val description = null
    override val indexExportFormatID = "indexUvpIDF"
    override val indexIdField = IndexIdFieldConfig("t01_object.obj_id", "t02_address.adr_id")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders(),
                    TitleSearch()
                ),
                viewComponent = ViewComponent.CHECKBOX,
                combine = Operator.AND
            ),
            FacetGroup(
                "spatial", "Raumbezug", arrayOf(
                    Spatial()
                ),
                viewComponent = ViewComponent.SPATIAL
            ),
            FacetGroup(
                "timeRef", "Zeitbezug", arrayOf(
                    TimeSpan()
                ),
                viewComponent = ViewComponent.TIMESPAN
            ),
            FacetGroup(
                "docType", "Verfahrenstyp", arrayOf(
                    ProcedureTypes()
                ),
                viewComponent = ViewComponent.SELECT
            ),
            FacetGroup(
                "eiaNumber", "UVP Nummer", arrayOf(
                    EIANumber()
                ),
                viewComponent = ViewComponent.SELECT
            ),
            FacetGroup(
                "processStep", "Verfahrensschritt", arrayOf(
                    ProcessStep()
                ),
                viewComponent = ViewComponent.SELECT
            )
        )
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX
            )
        )
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {

    }

    override fun initCatalogQueries(catalogId: String) {
        val behaviours = listOf("plugin.tags", "plugin.assigned.user").map { Behaviour().apply {
            name = it
            active = false
        }}
        behaviourService.save(catalogId, behaviours)
    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/uvp/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/uvp/default-settings.json")?.readText() ?: ""
    }

    override fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String> {
        val isAdmin = authUtils.isAdmin(principal)
        val isMdAdmin = authUtils.containsRole(principal, "md-admin")

        return if (isAdmin)
        // catalog and super admins can create uvp report
            permissions + "can_create_uvp_report"
        else if (isMdAdmin)
            permissions
        else {
            // authors can not import or export
            permissions.filterNot {
                listOf(Permissions.can_import.name, Permissions.can_export.name).contains(it)
            }
        }

    }

    override fun additionalPublishConditions(catalogId: String): List<String> {
        val conditions = mutableListOf<String>()

        var doNotPublishNegativeAssessments = true
        var publishNegativeAssessmentsOnlyWithSpatialReferences = false
        var publishNegativeAssessmentsControlledByDataset = false

        behaviourService.get(catalogId, "plugin.publish.negative.assessment")?.let {
            doNotPublishNegativeAssessments = it.active == null || it.active == false
            publishNegativeAssessmentsOnlyWithSpatialReferences = it.data?.get("onlyWithSpatial") == true
            publishNegativeAssessmentsControlledByDataset = it.data?.get("controlledByDataset") == true
        }

        if (doNotPublishNegativeAssessments) conditions.add("document_wrapper.type != 'UvpNegativePreliminaryAssessmentDoc'")
        if (publishNegativeAssessmentsOnlyWithSpatialReferences) conditions.add("(document_wrapper.type != 'UvpNegativePreliminaryAssessmentDoc' OR (jsonb_path_exists(jsonb_strip_nulls(data), '\$.spatial')))")
        if (publishNegativeAssessmentsControlledByDataset) conditions.add("document_wrapper.tags IS NULL OR NOT ('{negative-assessment-not-publish}' && document_wrapper.tags)")
        
        conditions.add("document_wrapper.type != 'FOLDER'")
        
        return conditions
    }
}
