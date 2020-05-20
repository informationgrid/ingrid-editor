package de.ingrid.igeserver.api;

import de.ingrid.codelists.model.CodeList;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;


@Tag(name = "Codelist", description = "the codelist API")
public interface CodelistApi {

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = ""),
            @ApiResponse(responseCode = "200", description = "Unexpected error")
    })
    @Operation()
    @RequestMapping(value = "", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<List<CodeList>> getAllCodelists() throws ApiException;

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = ""),
            @ApiResponse(responseCode = "200", description = "Unexpected error")
    })
    @Operation()
    @RequestMapping(value = "", produces = {"application/json"}, method = RequestMethod.POST)
    ResponseEntity<List<CodeList>> updateCodelists() throws ApiException;

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = ""),
            @ApiResponse(responseCode = "200", description = "Unexpected error")
    })
    @Operation()
    @RequestMapping(value = "/{ids}", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<List<CodeList>> getCodelistsByIds(
            @Parameter(description = "The ID of the codelists.", required = true) @PathVariable("ids") List<String> id);

}
