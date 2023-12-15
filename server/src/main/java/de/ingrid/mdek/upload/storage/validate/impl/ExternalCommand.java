/**
 * ==================================================
 * Copyright (C) 2014-2023 wemove digital solutions GmbH
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
package de.ingrid.mdek.upload.storage.validate.impl;

import org.apache.commons.io.IOUtils;

import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * Class for executing commands in a operating system process.
 */
public class ExternalCommand {

    private final static int TIMEOUT = 60;

    private final int timeout;

    /**
     * Constructor using default timeout
     */
    public ExternalCommand() {
        this(TIMEOUT);
    }

    /**
     * Constructor with timeout in seconds
     * @param timeout
     */
    public ExternalCommand(final int timeout) {
        this.timeout = timeout;
    }

    /**
     * Run a command and return the result
     * @param command
     * @return String
     * @throws CommandExecutionException
     */
    public String execute(final String command) throws CommandExecutionException {
        try {
            final ProcessBuilder builder = new ProcessBuilder();
            final String[] commands = Arrays.stream(command.split("\\s+")).map(String::trim).toArray(String[]::new);
            final Process process = builder.command(commands).redirectErrorStream(true).start();

            // capture output
            final ExecutorService newFixedThreadPool = Executors.newFixedThreadPool(1);
            final Future<String> output = newFixedThreadPool.submit(() -> {
                return IOUtils.toString(process.getInputStream());
            });
            newFixedThreadPool.shutdown();

            if (!process.waitFor(timeout, TimeUnit.SECONDS)) {
                process.destroy();
            }

            return output.get();
        }
        catch (final Exception e) {
            throw new CommandExecutionException("Error executing external command '"+String.join(" ", command)+"'.", e);
        }
    }
}
