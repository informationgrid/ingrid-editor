package de.ingrid.igeserver.api

import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import java.io.IOException
import java.security.Principal
import javax.annotation.Generated

@Generated(value = ["io.swagger.codegen.languages.SpringCodegen"], date = "2017-08-21T10:21:42.666Z")
@RestController
@RequestMapping(path = ["/api"])
class ProfileApiController : ProfileApi {

    private val log = logger()

    @Autowired
    private lateinit var dbService: DBApi

    @Autowired
    private lateinit var catalogService: CatalogService

    override fun getProfile(principal: Principal): ResponseEntity<String> {
        // ClassPathResource resource = new ClassPathResource( "/profile-uvp.chunk.js" );
        var profile: String? = null // String profile = new String( Files.readAllBytes( Paths.get( resource.getURI() ) ) );
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        dbService.acquire(dbId).use {
            val allFrom = dbService.findAll(CatalogInfoType::class)
            profile = if (allFrom!!.isNotEmpty()) {
                val map = allFrom[0]
                map!!["profile"].asText()
            } else {
                log.warn("No profiles available in database!")
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build()
            }
        }
        return ResponseEntity.ok(profile!!)
    }

    override fun uploadProfile(principal: Principal, file: MultipartFile,
                               redirectAttributes: RedirectAttributes): ResponseEntity<String> {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        log.info("Received file:" + file.originalFilename)
        log.info("file-size:" + file.size)
        var fileContent = try {
            String(file.bytes)
        } catch (e: IOException) {
            log.error("Could not get file content from uploaded file: " + file.originalFilename, e)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.message)
        }

        // manipulate file content by replacing dynamic variable name with a static one
        // this way it can be used by the frontend, after it has been loaded
        fileContent = prepareProfileContent(fileContent)
        dbService.acquire(dbId).use {
            val infos = dbService.findAll(CatalogInfoType::class)
            if (infos.isNotEmpty()) {
                val rid: String
                try {
                    rid = dbService.getRecordId(infos[0])!!
                    dbService.remove(CatalogInfoType::class, rid)
                } catch (e: Exception) {
                    log.error("Error removing profile document", e)
                }
            }
            dbService.save(CatalogInfoType::class, "profile", fileContent, null)
            return ResponseEntity.ok().build()
        }
    }

    /**
     * Remove the id of the webpack module, which is dynamic
     *
     * @param fileContent
     */
    private fun prepareProfileContent(fileContent: String): String {
        // dbService.deleteDocFrom( classType, id );
        // return fileContent.replaceFirst("(.*?):(.*)", "webpackJsonp([\"_profile_\"],{\"_profile_\":$2");
        // fileContent = fileContent.replaceFirst( "(?<=\\{).*?:", "\"_profile_\":" );
        // return fileContent.replaceFirst( "(?<=\").*pack.*.ts(?=\")", "_profile_" );
        return fileContent.replace("\"./src/profiles/pack.*.ts\"".toRegex(), "\"_profile_\"")
    }
}