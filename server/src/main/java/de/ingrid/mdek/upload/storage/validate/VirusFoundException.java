/*-
 * **************************************************-
 * InGrid Portal MDEK Application
 * ==================================================
 * Copyright (C) 2014 - 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.1 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * http://ec.europa.eu/idabc/eupl5
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 * **************************************************#
 */
package de.ingrid.mdek.upload.storage.validate;

import java.nio.file.Path;
import java.util.Map;

/**
 * Exception signaling a virus infection. The HTTP status code is 419.
 */
public class VirusFoundException extends VirusScanException {

    private static final long serialVersionUID = 1L;
    private static final String INFECTIONS_KEY = "infections";

    public VirusFoundException(final String message, final String file, final String scanReport, final Map<Path, String> infections) {
        super(message, file, scanReport);
        this.data.put(INFECTIONS_KEY, infections);
    }

    /**
     * Get the infections as map with the file names as keys and the virus names as values
     * @return Map<Path, String>
     */
    @SuppressWarnings("unchecked")
    public Map<Path, String> getInfections() {
        return (Map<Path, String>)this.data.get(INFECTIONS_KEY);
    }
}
