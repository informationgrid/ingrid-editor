package de.ingrid.igeserver.api;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping(path = "/api")
public class UploadApiController implements UploadApi {

    private static Logger log = LogManager.getLogger(UploadApiController.class);

    @Override
    public ResponseEntity<Void> uploadFile(MultipartFile file) {
        log.info("Receiving file: " + file.getName());
        return null;
    }
}
