/**
 * ==================================================
 * Copyright (C) 2014-2024 wemove digital solutions GmbH
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

import de.ingrid.mdek.upload.ValidationException;
import de.ingrid.mdek.upload.storage.validate.IllegalSizeException;
import de.ingrid.mdek.upload.storage.validate.Validator;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Validator implementation that validates the size of a file or directory.
 *
 * Required configuration
 *   - maxFileSize: Maximum size of a single file in bytes, -1 if unlimited (will be limited by maxDirSize, if that is not unlimited).
 *   - maxDirSize: Maximum size of a directory in bytes, -1 if unlimited.
 */
public class SizeValidator implements Validator {

    private static final String CONFIG_KEY_MAX_FILE_SIZE = "maxFileSize";
    private static final String CONFIG_KEY_MAX_DIR_SIZE  = "maxDatasetSize";

    private Long maxFileSize = -1L;
    private Long maxDatasetSize = -1L;

    private static final Logger log = LogManager.getLogger(SizeValidator.class);

    @Override
    public void initialize(final Map<String, String> configuration) throws IllegalArgumentException {
        // check required configuration parameters
        for (final String parameter : new String[] {CONFIG_KEY_MAX_FILE_SIZE, CONFIG_KEY_MAX_DIR_SIZE}) {
            if (!configuration.containsKey(parameter)) {
                throw new IllegalArgumentException("Configuration value '"+parameter+"' is required.");
            }
        }

        // max file size parameter
        final String maxFileSizeStr = configuration.get(CONFIG_KEY_MAX_FILE_SIZE);
        try {
            this.maxFileSize = Long.parseLong(maxFileSizeStr);
        }
        catch (Exception e) {
            throw new IllegalArgumentException("Configuration value 'maxFileSize' is not a valid number.", e);
        }

        // max directory size parameter
        final String maxDirSizeStr = configuration.get(CONFIG_KEY_MAX_DIR_SIZE);
        try {
            this.maxDatasetSize = Long.parseLong(maxDirSizeStr);
        }
        catch (Exception e) {
            throw new IllegalArgumentException("Configuration value 'maxDirSize' is not a valid number.", e);
        }
    }

    @Override
    public void validate(final String path, final String file, final long size, final long currentSize, final Path data, final boolean isArchiveContent) throws ValidationException {
        final Path targetPath = Paths.get(path, file);

        try {
            // use given size as long as real data is not available yet
            long fileSize = size;
            if (data != null && Files.exists(data)) {
                fileSize = Files.size(data);
            }

            if (maxFileSize != -1) {
                // limit single file also after extraction (ignore isArchiveContent)
                if (fileSize > maxFileSize) {
                    throw new IllegalSizeException("The file size exceeds the maximum size of " + maxFileSize + " bytes.", path+"/"+file,
                            IllegalSizeException.LimitType.FILE, maxFileSize, 0L);
                }
            }

            if (maxDatasetSize != -1) {
                // reference directory for maxDirSize parameter
                final Path rootPath = Paths.get(path);
                // sum sizes of all files in the root directory
                if (fileSize + currentSize > maxDatasetSize) {
                    throw new IllegalSizeException("The dataset size exceeds the maximum size of " + maxDatasetSize + " bytes.", path+"/"+file,
                            IllegalSizeException.LimitType.DIRECTORY, maxDatasetSize, fileSize + currentSize);
                }
            }
        }
        catch (IOException e) {
            log.error("Failed to obtain file or directory size", e);
        }
    }

    /**
     * Calculate the size of a file or directory excluding the optional path
     *
     * @param path
     * @param excludePath
     * @return long
     */
    private static long getSize(Path path, Path excludePath) {
        final AtomicLong size = new AtomicLong(0);
        try {
            Files.walkFileTree(path, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                    if (excludePath == null || !excludePath.equals(file)) {
                        size.addAndGet(attrs.size());
                    }
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult visitFileFailed(Path file, IOException exc) {
                    // skip folders that can't be traversed
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path dir, IOException ex) {
                    if (ex != null) {
                        log.error("Could not traverse directory " + dir, ex);
                    }
                    // ignore errors traversing a folder
                    return FileVisitResult.CONTINUE;
                }
            });
        }
        catch (IOException e) {
            log.error("Failed to obtain directory size", e);
        }

        return size.get();
    }
}
