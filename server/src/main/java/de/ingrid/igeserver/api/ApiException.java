/**
 * ==================================================
 * Copyright (C) 2022-2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.api;

import org.springframework.http.HttpStatus;

@javax.annotation.processing.Generated(value = "io.swagger.codegen.v3.generators.java.SpringCodegen", date = "2022-07-06T11:40:14.752324+02:00[Europe/Berlin]")
public class ApiException extends Exception {

    private int code;

    public ApiException (int code, String msg) {
        super(msg);
        this.code = code;
    }

    public ApiException (HttpStatus status, String msg) {
        this(status.value(), msg);
    }

    public ApiException (HttpStatus status, Exception e) {
        this(status.value(), extractErrorTitle(e));
    }

    public int getCode() {
        return this.code;
    }

    public static String extractErrorTitle(Exception e) {
        String msgTitle = e.getMessage().split("\n")[0];
        if (msgTitle.contains("com.wemove") && e.getCause() != null) {
            msgTitle = e.getCause().getMessage();
        }
        return msgTitle;
    }
}
