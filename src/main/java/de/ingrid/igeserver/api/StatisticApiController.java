package de.ingrid.igeserver.api;

import de.ingrid.igeserver.db.DBApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class StatisticApiController implements StatisticApi {

    @Autowired
    private DBApi dbService;

    public ResponseEntity<String> getStatistic() throws ApiException {
//        String statistic = this.dbService.getDocStatistic();
//        return ResponseEntity.ok(statistic);
        throw new ApiException(500, "getStatistic not yet supported");
    }

}
