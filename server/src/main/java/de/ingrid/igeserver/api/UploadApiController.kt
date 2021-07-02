package de.ingrid.igeserver.api

import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.multipart.MultipartFile
import org.springframework.http.ResponseEntity
import java.lang.Void
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class UploadApiController : UploadApi {
    private val logger = logger()

    override fun uploadFile(file: MultipartFile): ResponseEntity<Void> {
        logger.info("Receiving file: " + file.name)
        return ResponseEntity(HttpStatus.OK)
    }

    override fun getFile(id: String): ResponseEntity<Void> {
        TODO("Not yet implemented")
    }
}