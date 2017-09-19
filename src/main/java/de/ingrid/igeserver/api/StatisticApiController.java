package de.ingrid.igeserver.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import de.ingrid.igeserver.OrientDbService;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class StatisticApiController implements StatisticApi {

    @Autowired
    private OrientDbService dbService;

    public ResponseEntity<String> getStatistic() {
        String statistic = this.dbService.getDocStatistic();
        return ResponseEntity.ok(statistic);
    }

    public ResponseEntity<Void> getStatisticOp() {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
