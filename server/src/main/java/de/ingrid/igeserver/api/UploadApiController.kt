package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.FileInfo
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.concurrent.ConcurrentHashMap
import javax.servlet.http.HttpServletResponse

@RestController
@RequestMapping(path = ["/api"])
class UploadApiController : UploadApi {
    private val logger = logger()

    private val fileInfos: Map<String, FileInfo> = ConcurrentHashMap()

    private val uploadDirectory: String? = null

    override fun chunkExists(flowChunkNumber: Int, flowIdentifier: String?): ResponseEntity<Void> {
            val fileInfo = this.fileInfos.get(flowIdentifier)
            if (fileInfo != null && fileInfo.containsChunk(flowChunkNumber)) {
                return ResponseEntity.ok().build()
            }
            return ResponseEntity.noContent().build()
    }

    override fun uploadFile(
        flowChunkNumber: Int,
        flowTotalChunks: Int,
        flowChunkSize: Long,
        flowTotalSize: Long,
        flowIdentifier: String,
        flowFilename: String,
        file: MultipartFile
    ): ResponseEntity<Void> {
        logger.info("Receiving file: " + file.name)
        return ResponseEntity(HttpStatus.OK)

    }

    override fun getFile(id: String): ResponseEntity<Void> {
        TODO("Not yet implemented")
    }
}
