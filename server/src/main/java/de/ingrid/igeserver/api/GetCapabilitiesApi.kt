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
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun analyzeGetRecordUrl(
        @Parameter(required = true) @RequestBody url: String
    ): ResponseEntity<GetRecordUrlAnalysis>

    @Operation
    @PostMapping(value = ["/analyzeGetCapabilities"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun analyzeGetCapabilties(
        principal: Principal,
        @Parameter(required = true) @RequestBody url: String
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
