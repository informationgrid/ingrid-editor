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

package de.ingrid.igeserver.profiles.ingrid.validator

import de.ingrid.igeserver.api.InvalidField
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.utils.getBoolean
import org.jetbrains.kotlin.utils.addToStdlib.ifTrue

fun docQualityValidation(doc: Document) {
    if (doc.type == "InGridGeoService") {
        inspireValidationInGridGeoService(doc)
        advValidation(doc)
        openDataValidation(doc)
    }
    if (doc.type == "InGridPublication") {
        openDataValidation(doc)
    }
    if (doc.type == "InGridInformationSystem") {
        openDataValidation(doc)
        advValidation(doc)
        inspireValidationInGridInformationSystem(doc)
    }
    if (doc.type == "InGridDataCollection") {
        openDataValidation(doc) // Profile "ingrid-bast" does currently not support the field isOpenData
    }
    if (doc.type == "InGridGeoDataset") {
        hvdValidation(doc)
        openDataValidation(doc)
        advValidation(doc)
        inspireValidation(doc)
    }
}

private fun hvdValidation(doc: Document): Boolean {
    val isHvd: Boolean = doc.data.getBoolean("hvd") ?: false
    isHvd.ifTrue {
        validateCategories(doc, "hvdCategories")
        val valideOpenData = openDataValidation(doc)
        if (!valideOpenData) {
            throw ValidationException.withInvalidFields(InvalidField("isOpenData", "required"))
        }
    }
    return isHvd
}

private fun openDataValidation(doc: Document): Boolean {
    val isOpenData: Boolean = doc.data.getBoolean("isOpenData") ?: false
    isOpenData.ifTrue {
        validateCategories(doc, "openDataCategories")
        val atLeastOneReferenceOfTypeDatadownload = doc.data.get("references").filter { contact -> contact.get("type").get("key").textValue() == "9990" }
        if (atLeastOneReferenceOfTypeDatadownload.isEmpty()){
            throw ValidationException.withInvalidFields(InvalidField("references", "Field 'references' must have at least one reference of type '9990' (Datendownload)."))
        }
    }
    return isOpenData
}

private fun advValidation(doc: Document): Boolean  {
    val isAdVCompatible: Boolean = doc.data.getBoolean("isAdVCompatible") ?: false
    isAdVCompatible.ifTrue {
        validateCategories(doc,  "advProductGroups")
        val atLeastOnePointOfContactWhenAdV = doc.data.get("pointOfContact").filter { contact -> contact.get("type").get("key").textValue() == "7" }
        if (atLeastOnePointOfContactWhenAdV.isEmpty()){
            throw ValidationException.withInvalidFields(InvalidField("pointOfContact", "Field 'pointOfContact' must have at least one contact of type '7' (Ansprechpartner)."))
        }
    }
    return isAdVCompatible
}

private fun inspireValidation(doc: Document): Boolean  {
    val isInspireIdentified: Boolean = doc.data.getBoolean("isInspireIdentified") ?: false
    val isInspireConform: Boolean? = doc.data.getBoolean("isInspireConform")
    isInspireIdentified.ifTrue {
        if (isInspireConform == null) {
            throw ValidationException.withInvalidFields(InvalidField("isInspireConform", "required"))
        }
        validateCategories(doc, "themes")
        isInspireConform?.ifTrue {
            validateCategories(doc, "spatialRepresentationType")
            val distribution = doc.data.get("distribution")?.get("format")?.size() ?: 0
            if (distribution == 0){
                throw ValidationException.withInvalidFields(InvalidField("distribution.format", "required"))
            }
        }
    }
    return isInspireIdentified
}

private fun inspireValidationInGridInformationSystem(doc: Document): Boolean  {
    val isInspireIdentified: Boolean = doc.data.getBoolean("isInspireIdentified") ?: false
    isInspireIdentified.ifTrue {
        val accessConstraints = doc.data.get("resource")?.get("accessConstraints")?.size() ?: 0
        if (accessConstraints == 0){
            throw ValidationException.withInvalidFields(InvalidField("resource.accessConstraints", "required"))
        }
    }
    return isInspireIdentified
}

private fun inspireValidationInGridGeoService(doc: Document): Boolean  {
    val isInspireIdentified: Boolean = doc.data.getBoolean("isInspireIdentified") ?: false
    isInspireIdentified.ifTrue {
        validateCategories(doc, "themes")
    }
    return isInspireIdentified
}


private fun validateCategories(doc: Document, categoryToBeControlled: String) {
    val categories = doc.data.get(categoryToBeControlled)?.size() ?: 0
    if (categories == 0){
        throw ValidationException.withInvalidFields(InvalidField(categoryToBeControlled, "required"))
    }
}
