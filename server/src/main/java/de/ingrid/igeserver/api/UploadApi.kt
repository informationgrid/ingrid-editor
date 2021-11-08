package de.ingrid.igeserver.api

import de.ingrid.mdek.upload.UploadResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody
import java.security.Principal

@Tag(name = "Upload", description = "the upload API")
interface UploadApi {
    @PostMapping(value = ["/upload/{docId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(description = "Upload a file")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "File was successfully uploaded"), ApiResponse(responseCode = "500", description = "An error occurred during upload")])
    fun uploadFile(
            principal: Principal,
            @Parameter(description = "The UUID of the dataset", required = true) @PathVariable("docId") docId: String,
            @Parameter(description = "The file to be uploaded", required = true) @RequestParam("file") file: MultipartFile,
            @Parameter(description = "If we want to overwrite an existing File with this Name then this parameter has to be set to true.") @RequestParam(value = "replace", required = false) replace: Boolean
        ): ResponseEntity<UploadResponse>

    @GetMapping(value = ["/upload/{docId}/{file}"])
    @Operation(description = "Get an uploaded file")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "File was successfully downloaded"), ApiResponse(responseCode = "500", description = "An error occurred during download")])
    fun getFile(
            principal: Principal,
            @Parameter(description = "The UUID of the dataset", required = true) @PathVariable("docId") docId: String,
            @Parameter(description = "The file to be downloaded", required = true) @PathVariable("file") file: String
        ): ResponseEntity<StreamingResponseBody>

    @DeleteMapping(value = ["/upload/{docId}/{file}"])
    @Operation(description = "Delete an uploaded file")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "File was successfully deleted"), ApiResponse(responseCode = "500", description = "An error occurred during deletion")])
    fun deleteFile(
            principal: Principal,
            @Parameter(description = "The UUID of the dataset", required = true) @PathVariable("docId") docId: String,
            @Parameter(description = "The file to delete", required = true) @PathVariable("file") file: String
        ): ResponseEntity<StreamingResponseBody>
}
