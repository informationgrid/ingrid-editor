/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api;

import de.ingrid.igeserver.model.InlineResponseDefault;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Api(value = "statistic", description = "the statistic API")
@RequestMapping(path="/api")
public interface StatisticApi {

    @ApiOperation(value = "", notes = "", response = Void.class, tags = { "Statistic", })
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "", response = Void.class),
            @ApiResponse(code = 200, message = "Unexpected error", response = InlineResponseDefault.class) })

    @RequestMapping(value = "/statistic", produces = { "application/json" }, method = RequestMethod.GET)
    ResponseEntity<String> getStatistic() throws ApiException;

}
