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
package de.ingrid.igeserver.services.ai.model

import dev.langchain4j.model.output.structured.Description

data class Evaluation(
    @Description("Der exakte Feldname aus dem JSON")
    val key: String,

    @Description("Der Name des Feldes")
    val name: String,

    @Description("Die Punktzahl der Bewertung")
    val score: Int,

    @Description("Die Begründung der Bewertung")
    val reason: String,

    @Description("Optionen zum Ersatz des Feldes")
    val options: List<Any>,
)

data class EvaluationResult(
    val uuid: String,

    @Description("Zusammenfassung der Bewertungen")
    val summary: String,

    @Description("Die durchschnittliche Punktzahl aller Bewertungen")
    val averageScore: Int,

    val evaluations: List<Evaluation>,
)
