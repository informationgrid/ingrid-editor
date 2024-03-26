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
package de.ingrid.igeserver.tasks.quartz

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.messaging.Message
import org.apache.logging.log4j.kotlin.KotlinLogger
import org.quartz.InterruptableJob
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext

abstract class IgeJob : InterruptableJob {

    abstract val log: KotlinLogger

    var currentThread: Thread? = null

    abstract fun run(context: JobExecutionContext)

    override fun execute(context: JobExecutionContext) {
        currentThread = Thread.currentThread()
        run(context)
    }

    override fun interrupt() {
        log.info("Task interrupted: $currentThread")
        currentThread?.interrupt()
    }

    /**
     * Write general JobInfo.
     * Make sure your job is annotated with @PersistJobDataAfterExecution!!!
     * Otherwise, jobDataMap will not be persisted.
     */
    protected fun finishJob(
        context: JobExecutionContext,
        jobInfo: Message
    ): JobDataMap {
        currentThread = null

        return context.jobDetail?.jobDataMap!!.apply {
            put("startTime", jobInfo.startTime)
            put("endTime", jobInfo.endTime)
            put("report", jacksonObjectMapper().writeValueAsString(jobInfo.report))
            put("infos", jacksonObjectMapper().writeValueAsString(jobInfo.infos))
            put("errors", jacksonObjectMapper().writeValueAsString(jobInfo.errors))
            put("stage", jobInfo.stage)
        }
    }
}
