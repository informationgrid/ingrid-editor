package de.ingrid.igeserver.api

import de.ingrid.igeserver.utils.convertWktToGml32
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api/tools"])
class ToolsApiController: ToolsApi {

    override fun validWkt(wkt: String): ResponseEntity<WktValidateResponse> {
        return try {
            convertWktToGml32(wkt)
            ResponseEntity.ok(WktValidateResponse(true))
        } catch (ex: Exception) {
            ResponseEntity.ok(WktValidateResponse(false, ex.message))
        }
    }

}