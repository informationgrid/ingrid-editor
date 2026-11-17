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
package de.ingrid.igeserver.services.ai

object AiPrompts {
    // Default prompts loaded only once from the classpath resources.
    val roleDefinition: String by lazy { loadPrompt("evaluate-role-definition.md") }
    val instruction: String by lazy { loadPrompt("evaluate-instruction.md") }

    // Build the system message for the evaluation.
    // If not given, fall back to the default prompts.
    fun buildEvaluateInstruction(roleDefinition: String?, instruction: String?): String {
        val role = roleDefinition?.takeIf { it.isNotBlank() } ?: this.roleDefinition
        val task = instruction?.takeIf { it.isNotBlank() } ?: this.instruction

        return "$role\n\n$task"
    }

    // Load the prompt from the classpath resources.
    private fun loadPrompt(fileName: String): String {
        val resource = "/ai/prompts/$fileName"
        val stream = AiPrompts::class.java.getResourceAsStream(resource)
            ?: throw IllegalStateException("Prompt resource not found: $resource")
        return stream.bufferedReader().use { it.readText() }.trim()
    }
}
