/**
 * ==================================================
 * Copyright (C) 2014-2025 wemove digital solutions GmbH
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
package de.ingrid.mdek.upload.storage.impl;

import de.ingrid.igeserver.model.JobCommand;
import de.ingrid.igeserver.services.SchedulerService;
import de.ingrid.igeserver.tasks.quartz.CopyFilesTask;
import org.quartz.JobDataMap;
import org.quartz.JobKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import static org.quartz.Trigger.DEFAULT_PRIORITY;

@Service
public class FileSystemStorageScheduleDelegate {

    @Autowired
    private SchedulerService scheduler;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void scheduleCopyFilesJob(JobKey jobKey, JobDataMap jobDataMap) {
        scheduler.handleJobWithCommand(JobCommand.start, CopyFilesTask.class, jobKey, jobDataMap, DEFAULT_PRIORITY, true);
    }
}
