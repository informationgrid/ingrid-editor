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

import de.ingrid.mdek.upload.UploadResponse
import de.ingrid.mdek.upload.storage.ConflictHandling
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody
import java.security.Principal

@Hidden
@Tag(name = "Upload", description = "the upload API")
interface UploadApi {

    @GetMapping("/upload")
    fun chunkExists(
        @RequestParam("flowChunkNumber") flowChunkNumber: Int,
        @RequestParam("flowIdentifier") flowIdentifier: String?
    ): ResponseEntity<Void>

    @PostMapping(value = ["/upload/{docId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(description = "Upload a file")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "File was successfully uploaded"), ApiResponse(responseCode = "500", description = "An error occurred during upload")])
    fun uploadFile(
        principal: Principal,
        @Parameter(description = "The UUID of the dataset", required = true) @PathVariable("docId") docUuid: String,
        @Parameter(description = "The file to be uploaded", required = true) @RequestParam("file") file: MultipartFile,
        @Parameter(description = "If we want to overwrite an existing File with this Name then this parameter has to be set to true.") @RequestParam(value = "replace", required = false) replace: Boolean,
        @Parameter(description = "") @RequestParam("flowChunkNumber") flowChunkNumber: Int,
        @Parameter(description = "") @RequestParam("flowTotalChunks") flowTotalChunks: Int,
        @Parameter(description = "") @RequestParam("flowCurrentChunkSize") flowCurrentChunkSize: Long,
        @Parameter(description = "") @RequestParam(value = "flowTotalSize") flowTotalSize: Long,
        @Parameter(description = "") @RequestParam("flowIdentifier") flowIdentifier: String,
        @Parameter(description = "") @RequestParam("flowFilename") flowFilename: String,
    ): ResponseEntity<UploadResponse>

    @GetMapping(value = ["/upload/extract/{docId}/{file}"])
    @Operation(description = "Extract an uploaded file")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "File was successfully downloaded"), ApiResponse(responseCode = "500", description = "An error occurred during download")])
    fun extractFile(
        principal: Principal,
        @Parameter(description = "The UUID of the dataset", required = true) @PathVariable("docId") docUuid: String,
        @Parameter(description = "The file to be extracted", required = true) @PathVariable("file") file: String,
        @Parameter(description = "How to handle with Conflicts during Extraction.") @RequestParam(value = "conflict", required = false, defaultValue = "EXCEPTION") conflictHandling: ConflictHandling,
    ): ResponseEntity<UploadResponse>

    @GetMapping(value = ["/upload/{docId}/**"])
    @Operation(description = "Get an uploaded file")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "File was successfully downloaded"), ApiResponse(responseCode = "500", description = "An error occurred during download")])
    fun getFileDownloadHash(
        request: HttpServletRequest,
        principal: Principal,
            @Parameter(description = "The UUID of the dataset", required = true) @PathVariable("docId") docUuid: String
            //@Parameter(description = "The file to be downloaded", required = true) @PathVariable("file") file: String
        ): ResponseEntity<String>

    @GetMapping(value = ["/upload/download/{hash}"])
    @Operation(description = "Get an uploaded file")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "File was successfully downloaded"), ApiResponse(responseCode = "500", description = "An error occurred during download")])
    fun getFileByHash(
        request: HttpServletRequest,
            @Parameter(description = "The Downloadhash for the dataset", required = true) @PathVariable("hash") hash: String,
        ): ResponseEntity<StreamingResponseBody>

    @DeleteMapping(value = ["/upload/{docId}/{file}"])
    @Operation(description = "Delete an uploaded file")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "File was successfully deleted"), ApiResponse(responseCode = "500", description = "An error occurred during deletion")])
    fun deleteFile(
            principal: Principal,
            @Parameter(description = "The UUID of the dataset", required = true) @PathVariable("docId") docUuid: String,
            @Parameter(description = "The file to delete", required = true) @PathVariable("file") file: String
        ): ResponseEntity<Unit>
}
