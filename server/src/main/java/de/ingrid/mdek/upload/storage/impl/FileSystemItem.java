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
package de.ingrid.mdek.upload.storage.impl;

import de.ingrid.mdek.upload.storage.Storage;
import de.ingrid.mdek.upload.storage.StorageItem;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

/**
 * FileSystemItem represents an item in the server file system
 */
public class FileSystemItem implements StorageItem {

    // separator used in URI paths
    public static final String URI_PATH_SEPARATOR = "/";

    private FileSystemStorage storage;
    private String catalog;
    private String document;
    private String user;
    private String path;
    private String file;
    private String type;
    private long size;
    private LocalDateTime lastModifiedTime;
    private boolean isArchived;
    private Scope state;

    /**
     * Constructor
     */
    public FileSystemItem() {}

    /**
     * Constructor
     * @param storage
     * @param path
     * @param file
     * @param type
     * @param size
     * @param lastModifiedTime
     * @param isArchived
     * @param state
     */
    public FileSystemItem(final FileSystemStorage storage, final String catalog, final String document, final String user, final String path, final String file, final String type, final long size,
            final LocalDateTime lastModifiedTime, final boolean isArchived, final Scope state) {
        this.storage = storage;
        this.catalog = catalog;
        this.document = document;
        this.user = user;
        this.path = path;
        this.file = file;
        this.type = type;
        this.size = size;
        this.lastModifiedTime = lastModifiedTime;
        this.isArchived = isArchived;
        this.state = state;
    }

    @Override
    public String getPath() {
        return this.path;
    }

    @Override
    public String getFile() {
        return this.file;
    }

    @Override
    public String getUri() {
        final FileSystem fileSystem = FileSystems.getDefault();
        final String separator = fileSystem.getSeparator();

        String uri = fileSystem.getPath(this.path, this.file).toString().replace(separator, URI_PATH_SEPARATOR);
        try {
            uri = URLEncoder.encode(uri, "UTF-8")
                    .replaceAll("\\+", "%20")
                    .replaceAll("\\%21", "!")
                    .replaceAll("\\%27", "'")
                    .replaceAll("\\%28", "(")
                    .replaceAll("\\%29", ")")
                    .replaceAll("\\%7E", "~")
                    .replaceAll("\\%2F", "/")
                    .replaceAll("\\%5C", "/");
        }
        catch (final UnsupportedEncodingException e) {}
        return uri;
    }

    @Override
    public String getType() {
        return this.type;
    }

    @Override
    public long getSize() {
        return this.size;
    }

    @Override
    public LocalDateTime getLastModifiedDate() {
        return this.lastModifiedTime;
    }

    @Override
    public boolean isArchived() {
        return this.isArchived;
    }

    @Override
    public String getNextName() {
        if (this.storage.exists(catalog, user, this.document, Path.of(this.path, this.file).toString())) {
            final List<String> parts = new LinkedList<>(Arrays.asList(this.file.split("\\.")));
            final String extension = parts.size() > 1 ? parts.remove(parts.size()-1) : "";
            final String filename = String.join(".", parts);
            String tmpFile = this.file;
            int i = 0;
            while (this.storage.exists(catalog, user, this.document, Path.of(this.path, tmpFile).toString())) {
                i++;
                tmpFile = filename + "-" + i;
                if (extension.length() > 0) {
                    tmpFile += "." + extension;
                }
            }
            return Path.of(this.path,tmpFile).toString();
        }
        return Path.of(this.path, this.file).toString();
    }

    /**
     * Get the real absolute path of the file in the file system
     * @return Path
     */
    Path getRealPath() {
        String relativePath = getRelativePath();
        Path realPath = storage.getRealPath(catalog, document, relativePath, storage.getDocsDir());
        if (this.state == Scope.UNSAVED) realPath = storage.getUnsavedPath(catalog, user, document, relativePath, storage.getDocsDir());
        else if (this.state == Scope.UNPUBLISHED) realPath = storage.getUnpublishedPath(catalog, document, relativePath, storage.getDocsDir());
        else if (this.state == Scope.ARCHIVED) realPath = storage.getArchivePath(catalog, document, relativePath, storage.getDocsDir(), Scope.PUBLISHED);
        else if (this.state == Scope.ARCHIVED_UNPUBLISHED) realPath = storage.getArchivePath(catalog, document, relativePath, storage.getDocsDir(), Scope.UNPUBLISHED);
        else if (this.state == Scope.TRASH) realPath = storage.getTrashPath(catalog, document, relativePath, storage.getDocsDir(), Scope.PUBLISHED);
        else if (this.state == Scope.TRASH_UNPUBLISHED) realPath = storage.getTrashPath(catalog, document, relativePath, storage.getDocsDir(), Scope.UNPUBLISHED);
        return realPath;
    }
    @Override
    public String getRelativePath() {
        final FileSystem fileSystem = FileSystems.getDefault();
        final String separator = fileSystem.getSeparator();

        String uri = fileSystem.getPath(this.path, this.file).toString().replace(separator, URI_PATH_SEPARATOR);

        return uri;
    }
}
