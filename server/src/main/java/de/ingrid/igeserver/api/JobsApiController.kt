package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Job
import de.ingrid.igeserver.model.JobCommand
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.services.SchedulerService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class JobsApiController @Autowired constructor(val scheduler: SchedulerService) : JobsApi {

    override fun getJobs(principal: Principal): ResponseEntity<Job> {
        TODO("Not yet implemented")
    }

    override fun command(principal: Principal, id: String, command: JobCommand): ResponseEntity<Group> {
        val jobKey = scheduler.getJobKeyFromId(id)
        when (command) {
            JobCommand.start -> scheduler.start(jobKey)
            JobCommand.stop -> TODO()
            JobCommand.resume -> TODO()
        }

        return ResponseEntity.ok().build()
    }


}