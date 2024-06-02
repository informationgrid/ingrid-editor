/**
 * ==================================================
 * Copyright (C) 2022-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model

import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch.*
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.PlanStateEnum
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.PlanTypeEnum
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.ProcedureStateEnum
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.ProcedureTypeEnum
import jakarta.validation.Valid
import jakarta.validation.constraints.NotNull
import java.io.Serializable
import java.time.Instant
import java.util.*

class RecordPLUProperties : Serializable {
    var id: String? = null

    var bbox: Map<String, Any>? = null

    var geometry: Map<String, Any>? = null

    var centroid: Any? = null

    var geographicName: String? = null

    //    public CollectionProperties getCollection() {
    //        return collection;
    //    }
    //    public void setCollection(CollectionProperties collection) {
    //        this.collection = collection;
    //    }
    //    private CollectionProperties collection;
    var extras: Map<String, Any>? = null

    var contact: @Valid @NotNull(message = "dcat:contactPoint must not be null") Contact? = null

    var description: @NotNull(message = "dct:description must not be null") String? = null

    var identifier: @NotNull(message = "dct:identifier must not be null") String? = null

    var title: @NotNull(message = "dct:title must not be null") String? = null

    var planName: String? = null

    var planState: @NotNull(message = "plu:planState must not be null") PlanStateEnum? = null

    var procedureState: @NotNull(message = "plu:procedureState must not be null") ProcedureStateEnum? = null

    @Deprecated("")
    var procedureStartDate: Instant? = null

    var procedurePeriod: PeriodOfTime? = null

    var developmentFreezePeriod: PeriodOfTime? = null

    var publisher: Agent? = null

    var maintainers: Set<Agent>? = null

    var contributors: Set<Agent>? = null

    var distributions: Set<Distribution>? = null

    var issued: Instant? = null

    var modified: Instant? = null

    var relation: String? = null

    var notification: String? = null

    var admsIdentifier: String? = null

    var planType: PlanTypeEnum? = null

    var planTypeFine: String? = null

    var procedureType: ProcedureTypeEnum? = null

    var processSteps: Set<ProcessStep>? = null

    override fun equals(o: Any?): Boolean {
        if (this === o) {
            return true
        }
        if (o == null || javaClass != o.javaClass) {
            return false
        }
        val that = o as RecordPLUProperties
        return id == that.id && bbox == that.bbox && geometry == that.geometry && centroid == that.centroid && geographicName == that.geographicName && extras == that.extras && contact == that.contact && description == that.description && identifier == that.identifier && title == that.title && planName == that.planName && planState == that.planState && procedureState == that.procedureState && procedureStartDate == that.procedureStartDate && procedurePeriod == that.procedurePeriod && developmentFreezePeriod == that.developmentFreezePeriod && publisher == that.publisher && maintainers == that.maintainers && contributors == that.contributors && distributions == that.distributions && issued == that.issued && modified == that.modified && relation == that.relation && notification == that.notification && admsIdentifier == that.admsIdentifier && planType == that.planType && planTypeFine == that.planTypeFine && procedureType == that.procedureType && processSteps == that.processSteps
    }

    override fun hashCode(): Int {
        return Objects.hash(
            id,
            bbox,
            geometry,
            centroid,
            geographicName,  //                collection,
            extras,
            contact,
            description,
            identifier,
            title,
            planName,
            planState,
            procedureState,
            procedureStartDate,
            procedurePeriod,
            developmentFreezePeriod,
            publisher,
            maintainers,
            contributors,
            distributions,
            issued,
            modified,
            relation,
            notification,
            admsIdentifier,
            planType,
            planTypeFine,
            procedureType,
            processSteps
        )
    }

    override fun toString(): String {
        return "RecordPLUProperties{" +
                "id='" + id + '\'' +
                ", bbox=" + bbox +
                ", geometry=" + geometry +
                ", centroid=" + centroid +
                ", geographicName='" + geographicName + '\'' +  //                ", collection=" + collection +
                ", extras=" + extras +
                ", contact=" + contact +
                ", description='" + description + '\'' +
                ", identifier='" + identifier + '\'' +
                ", title='" + title + '\'' +
                ", planName='" + planName + '\'' +
                ", planState=" + planState +
                ", procedureState=" + procedureState +
                ", procedureStartDate=" + procedureStartDate +
                ", developmentFreezePeriod=" + developmentFreezePeriod +
                ", publisher=" + publisher +
                ", maintainers=" + maintainers +
                ", contributors=" + contributors +
                ", distributions=" + distributions +
                ", issued=" + issued +
                ", modified=" + modified +
                ", relation='" + relation + '\'' +
                ", notification='" + notification + '\'' +
                ", admsIdentifier='" + admsIdentifier + '\'' +
                ", planType=" + planType +
                ", planTypeFine='" + planTypeFine + '\'' +
                ", procedureType=" + procedureType +
                ", processSteps=" + processSteps +
                '}'
    }
}
