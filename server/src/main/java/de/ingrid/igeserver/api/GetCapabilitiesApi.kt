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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.GetRecordUrlAnalysis
import de.ingrid.igeserver.services.getCapabilities.CapabilitiesBean
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import java.security.Principal

@Hidden
@Tag(name = "GetCapabilities", description = "the groups API")
interface GetCapabilitiesApi {
    @Operation(description = "")
    @PostMapping(
        value = ["/analyzeGetRecordUrl"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun analyzeGetRecordUrl(
        @Parameter(required = true) @RequestBody url: String,
    ): ResponseEntity<GetRecordUrlAnalysis>

    @Operation
    @PostMapping(value = ["/analyzeGetCapabilities"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun analyzeGetCapabilties(
        principal: Principal,
        @Parameter(required = true) @RequestBody url: String,
    ): ResponseEntity<CapabilitiesBean>
}

data class GetCapabilitiesAnalysis(
    val serviceType: String,
//    val dataServiceType: Int,
//    val title: String,
//    val description: String,
//    val fees: String,

//    val versions: List<String>,
//    val operations: List<OperationBean>,
//    val keywords: List<String>,
//    val timeSpans: List<TimeReferenceBean>,
//    val timeReferences: List<TimeReferenceBean>,
//    val conformities: List<ConformityBean>,
//    val coupledResources: List<MdekDataBean>,
//    val spatialReferenceSystems: List<SpatialReferenceSystemBean>,
//    val accessConstraints: List<String>,
//    val onlineResources: List<UrlBean>,
//    val resourceLocators: List<UrlBean>,
//    val boundingBoxes: List<LocationBean>,
//
//    val address: Address
)
