package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.ingrid.igeserver.model.Data1;
import de.ingrid.igeserver.model.SearchResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.security.Principal;
import java.util.List;


@Tag(name = "Datasets", description = "the datasets API")
public interface DatasetsApi {

    @GetMapping(value = "/datasets", produces = {"application/json"})
    @Operation(description = "Get all datasets or those which match a given query. The results can also be sorted.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Datasets found")}
    )
    ResponseEntity<SearchResult> find(
            Principal principal,
            @Parameter(description = "Find datasets by a search query.") @RequestParam(value = "query", required = false) String query,
            @Parameter(description = "Define the maximum number of returned documents.", allowEmptyValue = true) @RequestParam(value = "size", required = false) int size,
            @Parameter(description = "Sort by a given field.") @RequestParam(value = "sort", required = false) String sort,
            @Parameter(description = "Define the sort order.") @RequestParam(value = "sortOrder", required = false, defaultValue = "ASC") String sortOrder,
            @Parameter(description = "Search in addresses.") @RequestParam(value = "address", required = false) boolean forAddress) throws Exception;


    @PostMapping(
            value = "/datasets", produces = {"application/json"}
    )
    @Operation(summary = "Create a complete dataset")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."),
            @ApiResponse(responseCode = "200", description = "Unexpected error")})
    ResponseEntity<JsonNode> createDataset(
            Principal principal,
            @Parameter(description = "The dataset to be stored.", required = true) @Valid @RequestBody String data,
            @Parameter(description = "Is this an address document") @Valid @RequestParam(required = false) boolean address,
            @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) Boolean publish) throws ApiException;

    @PutMapping(value = "/datasets/{id}", produces = {"application/json"})
    @Operation(summary = "Update a complete dataset")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."),
            @ApiResponse(responseCode = "200", description = "Unexpected error")})
    ResponseEntity<JsonNode> updateDataset(
            Principal principal,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @Parameter(description = "The dataset to be stored.", required = true) @Valid @RequestBody String data,
            @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) boolean publish,
            @Parameter(description = "Delete the draft version and make the published version the current one.") @RequestParam(value = "revert", required = false) boolean revert,
            @Parameter(description = "Delete an address.") @RequestParam(value = "address", required = false) boolean forAddress) throws ApiException;


    @Operation(description = "Copy a dataset or tree under another dataset")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Datasets have been copied successfully.")})
    @RequestMapping(value = "/datasets/{ids}/copy", produces = {"application/json"}, method = RequestMethod.POST)
    ResponseEntity<Void> copyDatasets(
            Principal principal,
            @Parameter(description = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids,
            @Parameter(description = "...", required = true) @Valid @RequestBody Data1 data);

    @Operation(description = "Deletes a dataset")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200"),
            @ApiResponse(responseCode = "200", description = "Unexpected error")})
    @RequestMapping(value = "/datasets/{id}", produces = {"application/json"}, method = RequestMethod.DELETE)
    ResponseEntity<String> deleteById(
            Principal principal,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") String[] ids,
            @Parameter(description = "Delete an address document") @RequestParam(value = "address", required = false) boolean address) throws Exception;

    @Operation(description = "Get child datasets of a given parent document/folder")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Child Datasets found")})
    @RequestMapping(value = "/tree/children", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<List<ObjectNode>> getChildren(
            Principal principal,
            @Parameter(description = "The ID of the parent dataset to get the children from. If empty then the root datasets are returned.")
            @RequestParam(value = "parentId", required = false) String parentId,
            @Parameter(description = "Define if we want to have addresses or documents.")
            @RequestParam(value = "address", required = false) boolean isAddress) throws Exception;

    @Operation(description = "Retrieve a dataset by a given ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "The dataset with the given ID."),
            @ApiResponse(responseCode = "200", description = "Unexpected error")})
    @RequestMapping(value = "/datasets/{id}", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<JsonNode> getByID(
            Principal principal,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @Parameter(description = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) Boolean publish,
            @Parameter(description = "Get an address instead of a document") @RequestParam(value = "address", required = false) boolean forAddress) throws Exception;

    @Operation(description = "Get the hierarchical path of a document. Retrieve an array of ID of all parents leading to the given dataset ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Array of IDs.")})
    @RequestMapping(value = "/datasets/{id}/path", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<List<String>> getPath(
            Principal principal,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @Parameter(description = "The path for addresses") @RequestParam(value = "address", required = false) boolean forAddress) throws ApiException;

    @Operation(description = "Move a dataset or tree under another dataset")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Datasets have been moved successfully.")})
    @RequestMapping(value = "/datasets/{ids}/move", produces = {"application/json"}, method = RequestMethod.POST)
    ResponseEntity<Void> moveDatasets(
            Principal principal,
            @Parameter(description = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids,
            @Parameter(description = "...", required = true) @Valid @RequestBody Data1 data) throws Exception;

}
