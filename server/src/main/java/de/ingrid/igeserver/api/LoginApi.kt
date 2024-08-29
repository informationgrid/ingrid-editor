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
package de.ingrid.igeserver.api

import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestPart

@Hidden
@Tag(name = "Login", description = "the login API")
interface LoginApi {
    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Return the JWT"), ApiResponse(responseCode = "403", description = "Error when user is not accepted.")])
    @RequestMapping(value = ["/login"], produces = [MediaType.APPLICATION_JSON_VALUE], consumes = ["application/x-www-form-urlencoded"], method = [RequestMethod.POST])
    fun login(
        @Parameter @RequestPart(value = "username", required = false) username: String?,
        @Parameter @RequestPart(value = "password", required = false) password: String?,
    ): ResponseEntity<Void> //    @ApiOperation(value = "", notes = ""})
    //    @ApiResponses(value = {
    //            @ApiResponse(code = 200, message = "Return the JWT", response = Void.class),
    //            @ApiResponse(code = 403, message = "Error when user is not accepted.", response = Void.class) })
    //    @RequestMapping(value = "/logout", produces = { MediaType.APPLICATION_JSON_VALUE }, method = RequestMethod.POST)
    //    ResponseEntity<Void> logout();
}
