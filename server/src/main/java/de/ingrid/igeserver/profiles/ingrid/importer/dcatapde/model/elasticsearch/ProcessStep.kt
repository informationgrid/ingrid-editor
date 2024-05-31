/*
 * **************************************************-
 * ogc-records-api
 * ==================================================
 * Copyright (C) 2022 - 2024 wemove digital solutions GmbH
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
 * **************************************************#
 */
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch

import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.ProcessStepTypeEnum
import java.io.Serializable
import java.util.*

class ProcessStep : Serializable {
    var identifier: String? = null

    var passNumber: String? = null

    var processStepType: ProcessStepTypeEnum? = null

    var temporal: PeriodOfTime? = null

    var title: String? = null

    var distributions: Set<Distribution>? = null

    override fun equals(o: Any?): Boolean {
        if (this === o) {
            return true
        }
        if (o == null || javaClass != o.javaClass) {
            return false
        }
        val that = o as ProcessStep
        return identifier == that.identifier && passNumber == that.passNumber && processStepType == that.processStepType && temporal == that.temporal && title == that.title && distributions == that.distributions
    }

    override fun hashCode(): Int {
        return Objects.hash(identifier, passNumber, processStepType, temporal, title, distributions)
    }

    override fun toString(): String {
        return "ProcessStep{" +
                "identifier='" + identifier + '\'' +
                ", passNumber='" + passNumber + '\'' +
                ", processStepType=" + processStepType +
                ", temporal=" + temporal +
                ", title='" + title + '\'' +
                ", distributions=" + distributions +
                '}'
    }
}
