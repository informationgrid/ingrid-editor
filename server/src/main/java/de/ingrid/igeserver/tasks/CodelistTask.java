package de.ingrid.igeserver.tasks;

import de.ingrid.codelists.CodeListService;
import de.ingrid.codelists.model.CodeList;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;

@Component
public class CodelistTask {

    Logger log = LogManager.getLogger(CodelistTask.class);

    final
    CodeListService codeListService;

    public CodelistTask(CodeListService codeListService) {
        this.codeListService = codeListService;
    }

    @PostConstruct
    public void onStartup() {
        codelistTask();
    }

    @Scheduled(cron = "${cron.codelist.expression}")
    public void codelistTask() {

        log.debug("Starting Codelist - Task");
        Long lastModifiedTimestamp = codeListService.getLastModifiedTimestamp();
        List<CodeList> codeLists = codeListService.updateFromServer(lastModifiedTimestamp);

        logResult(codeLists);

    }

    private void logResult(List<CodeList> codeLists) {

        if (codeLists == null) {
            log.error("Requesting codelist repository failed");
        } else if (codeLists.size() > 0) {
            log.info("Finished Codelist - Task with " + codeLists.size() + " new codelists");
        } else {
            log.debug("Finished Codelist");
        }

    }

}
