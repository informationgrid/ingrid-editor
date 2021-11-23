/*-
 * **************************************************-
 * InGrid Portal MDEK Application
 * ==================================================
 * Copyright (C) 2014 - 2021 wemove digital solutions GmbH
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
package de.ingrid.mdek.upload.storage.impl;

import de.ingrid.mdek.upload.ConflictException;
import de.ingrid.mdek.upload.ValidationException;
import de.ingrid.mdek.upload.storage.Storage;
import de.ingrid.mdek.upload.storage.StorageItem;
import de.ingrid.mdek.upload.storage.impl.Scope;
import de.ingrid.mdek.upload.storage.validate.IllegalNameException;
import de.ingrid.mdek.upload.storage.validate.Validator;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.tika.config.TikaConfig;
import org.apache.tika.io.TikaInputStream;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.mime.MediaType;
import org.joda.time.DateTime;
import org.joda.time.Duration;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.SequenceInputStream;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.nio.file.CopyOption;
import java.nio.file.DirectoryStream;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.Vector;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * FileSystemStorage manages files in the server file system
 *
 * The storage has a common archive and trash directory in
 * the document root (docsDir):
 *
 * -- <docsDir>
 *   +-- _archive_
 *   +-- _trash_
 *   +-- dirA
 *       +-- dirAA
 *           +-- ...
 *       +-- fileA.1
 *       +-- ...
 *   +-- ...
 */
public class FileSystemStorage implements Storage {

    private static final String ARCHIVE_PATH = "_archive_";
    private static final String TRASH_PATH = "_trash_";
    private static final String UNSAVED_PATH = "_unsaved_";
    private static final String UNPUBLISHED_PATH = "_unpublished_";

    private static final String UNKNOWN_MIME_TYPE = "";

    private static final int MAX_FILE_LENGTH = 255;
    private static final Pattern ILLEGAL_FILE_CHARS = Pattern.compile("[/<>?\":|\\*]");
    private static final Pattern ILLEGAL_PATH_CHARS = Pattern.compile("[<>?\":|\\*]");
    private static final Pattern ILLEGAL_FILE_NAME = Pattern.compile(".*"+ILLEGAL_FILE_CHARS.pattern()+".*");

    private static final String TMP_FILE_PREFIX = "upload";

    private static final Logger log = LogManager.getLogger(FileSystemStorage.class);

    private static final TikaConfig tika;
    static {
        TikaConfig obj = null;
        try {
            obj = new TikaConfig();
        }
        catch (final Exception ex) {
            log.warn("Initialization of mime type detection failed", ex);
        }
        finally {
            tika = obj;
        }
    }

    private String docsDir = null;
    private String partsDir = null;
    private String tempDir = null;

    private int trashRetentionTime = 0;
    private int unsavedRetentionTime = 0;

    private List<Validator> validators = new ArrayList<>();

    /**
     * Filename validator class
     */
    public static class NameValidator implements Validator {
        @Override
        public void initialize(final Map<String, String> configuration) throws IllegalArgumentException {}

        @Override
        public void validate(final String path, final String file, final long size, final Path data, final boolean isArchiveContent) throws ValidationException {
            final Path filePath = Paths.get(path, file);
            final Iterator<Path> it = filePath.iterator();
            while(it.hasNext()) {
                final String pathPart = it.next().toString();
                // check if names conflict with special directories
                if (TRASH_PATH.equals(pathPart) || ARCHIVE_PATH.equals(pathPart)) {
                    throw new IllegalNameException("The file name containes the reserved name '" + pathPart + "'.", path+"/"+file,
                            IllegalNameException.ErrorReason.RESERVED_WORD, pathPart);
                }
            }
            // we only reject invalid filenames, because the path will be sanitized
            // NOTE file could be a path, if extracted from an archive
            final String filename = Paths.get(file).getFileName().toString();
            if (!this.isValidName(filename, ILLEGAL_FILE_NAME)) {
                throw new IllegalNameException("The file name '" + file + "' contains illegal characters.", path+"/"+file,
                        IllegalNameException.ErrorReason.ILLEGAL_CHAR, filename);
            }

        }

        /**
         * Check if a path is valid
         *
         * @param path
         * @param illegalChars
         * @return String
         */
        private boolean isValidName(final String path, final Pattern illegalChars) {
            boolean isValid = true;
            // check against rules provided in https://en.m.wikipedia.org/wiki/Filename
            if (path == null || path.length() == 0 || path.length() > MAX_FILE_LENGTH) {
                isValid = false;
            }
            if (illegalChars.matcher(path).matches()) {
                isValid = false;
            }
            return isValid;
        }
    }

   /**
    * Set the document directory
    *
    * @param docsDir
    */
    public void setDocsDir(final String docsDir) {
        this.docsDir = docsDir;
    }

    /**
     * returns the document directory
     *
     */
    public String getDocsDir() {
        return this.docsDir;
    }

    /**
     * Set the partial upload directory
     *
     * @param partsDir
     */
    public void setPartsDir(final String partsDir) {
        this.partsDir = partsDir;
    }

    /**
     * Set the temporary upload directory
     *
     * @param tempDir
     */
    public void setTempDir(final String tempDir) {
        this.tempDir = tempDir;
    }

    /**
     * Set the validators
     *
     * @param validators
     */
    public void setValidators(final List<Validator> validators) {
        this.validators = validators;
    }


    /**
     * Set the Limit after how many hours files are removed from trash.
     * Files will never be removed for values of 0 or among
     *
     * @param trashRetentionTime
     */
    public void setTrashRetentionTime(final int trashRetentionTime) {
        this.trashRetentionTime = trashRetentionTime;
    }

    /**
     * Set the Limit after how many hours files are removed from trash.
     * Files will never be removed for values of 0 or among
     *
     * @param unsavedRetentionTime
     */
    public void setUnsavedRetentionTime(final int unsavedRetentionTime) {
        this.unsavedRetentionTime = unsavedRetentionTime;
    }

    /**
     * List the files in the given path recursively
     *
     *
     * @return List<StorageItem>
     * @throws IOException
     */
    private List<StorageItem> listFiles(String catalog, String userID, String docID, String basePath, Scope scope) throws IOException {
        final List<StorageItem> files = new ArrayList<>();
        Path dir = this.getRealPath(catalog, docID, "", basePath);
        if (scope == Scope.UNSAVED) dir = this.getUnsavedPath(catalog, userID, docID, "", basePath);
        else if (scope == Scope.UNPUBLISHED) dir = this.getUnpublishedPath(catalog, docID, "", basePath);
        else if (scope == Scope.ARCHIVED) dir = this.getArchivePath(catalog, docID, "", basePath);
        else if (scope == Scope.TRASH) dir = this.getTrashPath(catalog, docID, "", basePath);
        final Path archivePath = this.getArchivePath(catalog, docID, "", basePath);
        final Path dirPath = dir;

        if (dirPath.toFile().exists()) {
            try (Stream<Path> stream = Files.walk(dirPath)) {
                stream
                .forEach(p -> {
                    try {
                        if(!p.toFile().isDirectory())
                        {
                            files.add(this.getFileInfo(catalog, userID, docID, dirPath.relativize(p).toString(), basePath, scope));
                        }
                    }
                    catch (final IOException e) {
                        throw new UncheckedIOException(e);
                    }
                });
            }
        }
        return files;
    }

    @Override
    public boolean exists(final String catalog, final String userID, final String path, final String file) {
        Path realPath = this.getUnsavedPath(catalog, userID, path, file, this.docsDir);
        if(realPath.toFile().exists()){
            return true;
        }
        realPath = this.getUnpublishedPath(catalog, path, file, this.docsDir);
        if(realPath.toFile().exists()){
            return true;
        }
        realPath = this.getRealPath(catalog, path, file, this.docsDir);
        return realPath.toFile().exists();
    }

    @Override
    public void validate(final String catalog, final String userID, final String path, final String file, final long size) {
        final String validatePath = Paths.get(this.docsDir, path).toString();
        for (final Validator validator : this.validators) {
            validator.validate(validatePath, file, size, null, false);
        }
    }

    @Override
    public StorageItem getInfo(final String catalog, final String userID, final String path, final String file) throws IOException {
        Path realPath = this.getUnsavedPath(catalog, userID, path, file, this.docsDir);
        if(realPath.toFile().exists()){
            return this.getFileInfo(catalog, userID, path, file, this.docsDir, Scope.UNSAVED);
        }
        realPath = this.getUnpublishedPath(catalog, path, file, this.docsDir);
        if(realPath.toFile().exists()){
            return this.getFileInfo(catalog, userID, path, file, this.docsDir, Scope.UNPUBLISHED);
        }
        realPath = this.getRealPath(catalog, path, file, this.docsDir);
        return this.getFileInfo(catalog, userID, path, file, this.docsDir, Scope.PUBLISHED);
    }

    @Override
    public InputStream read(final String catalog, final String userID, final String path, final String file) throws IOException {
        Path realPath = this.getUnsavedPath(catalog, userID, path, file, this.docsDir);
        if(realPath.toFile().exists()){
            return Files.newInputStream(realPath);
        }
        realPath = this.getUnpublishedPath(catalog, path, file, this.docsDir);
        if(realPath.toFile().exists()){
            return Files.newInputStream(realPath);
        }
        realPath = this.getRealPath(catalog, path, file, this.docsDir);
        return Files.newInputStream(realPath);
    }

    @Override
    public FileSystemItem[] write(final String catalog, final String userID, final String path, final String file, final InputStream data, final Long size, final boolean replace) throws IOException {
        // file name and content validation
        // NOTE: we write the data to a temporary file before calling the validators
        // in order to allow multiple access to the streamed data
        Files.createDirectories(Paths.get(this.tempDir));
        final Path tmpFile = Files.createTempFile(Paths.get(this.tempDir), TMP_FILE_PREFIX, null);
        Files.copy(data, tmpFile, StandardCopyOption.REPLACE_EXISTING);

        final String validatePath = Paths.get(this.docsDir, path).toString();
        try {
            for (final Validator validator : this.validators) {
                validator.validate(validatePath, file, size, tmpFile, false);
            }
        }
        catch (final ValidationException ex) {
            // remove temporary file, if validation failed
            Files.delete(tmpFile);
            throw ex;
        }

        // copy file
        final Path realPath = this.getUnsavedPath(catalog, userID, path, file, this.docsDir);
        Files.createDirectories(realPath.getParent());

        final List<CopyOption> copyOptionList = new ArrayList<>();
        if (replace) {
            copyOptionList.add(StandardCopyOption.REPLACE_EXISTING);
        }
        final CopyOption[] copyOptions = copyOptionList.toArray(new CopyOption[copyOptionList.size()]);

        try {
            Files.move(tmpFile, realPath, copyOptions);
        }
        catch (final FileAlreadyExistsException faex) {
            final StorageItem[] items = null;//{ this.getFileInfo(catalog, userID, path, file, this.docsDir, Path.of(faex.getFile()).getFileName().toString()) };
            throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
        }
        if (Files.size(realPath) != size) {
            throw new IOException("The file size is different to the expected size");
        }
        String[] files = new String[] { realPath.toString() };

        // prepare result
        final FileSystemItem[] result = new FileSystemItem[files.length];
        for (int i = 0, count = files.length; i < count; i++) {
            result[i] = this.getFileInfo(catalog, userID, path, file, this.docsDir, Scope.UNSAVED);
        }
        return result;
    }

    @Override
    public void writePart(final String id, final Integer index, final InputStream data, final Long size) throws IOException {
        final String file = id + "-" + index;
        final Path realPath = this.getRealPath(file, this.partsDir);
        Files.createDirectories(realPath.getParent());
        try {
            Files.copy(data, realPath, StandardCopyOption.REPLACE_EXISTING);
        }
        catch (final FileAlreadyExistsException faex) {
            final StorageItem[] items = null;//{ this.getFileInfo(faex.getFile()) };
            throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
        }
        if (Files.size(realPath) != size) {
            throw new IOException("The file size is different to the expected size");
        }
    }

    @Override
    public FileSystemItem[] combineParts(final String catalog, final String userID, final String datasetID, final String file, final String id, final Integer totalParts, final Long size, final boolean replace) throws IOException {

        // combine parts into stream
        final Vector<InputStream> streams = new Vector<>();
        final List<Path> parts = new ArrayList<>();
        for (int i = 1; i <= totalParts; i++) {
            final String part = id + "-" + i;
            final Path realPath = this.getRealPath(part, this.partsDir);
            streams.add(Files.newInputStream(realPath));
            parts.add(realPath);
        }

        // delegate to write method
        FileSystemItem[] result = null;
        // this also closes InputStreams of streams
        try (InputStream data = new SequenceInputStream(streams.elements())) {
            result = this.write(catalog, userID, datasetID, file, data, size, replace);
        }
        finally {
            for (final Path part : parts) {
                Files.delete(part);
            }
        }

        return result;
    }

    @Override
    public void delete(final String catalog, final String userID, final String path, final String file) throws IOException {
        final Path realPath = this.getUnsavedPath(catalog, userID, path, file, this.docsDir);
        Files.deleteIfExists(realPath);
    }

    @Override
    public void archive(final String catalog, final String path, final String file) throws IOException {
        final Path realPath = this.getRealPath(catalog, path, file, this.docsDir);
        final Path archivePath = this.getArchivePath(catalog, path, file, this.docsDir);
        // ensure directory
        this.getArchivePath(catalog, path, "", this.docsDir).toFile().mkdirs();
        Files.move(realPath, archivePath, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
    }

    @Override
    public void restore(final String catalog, final String path, final String file) throws IOException {
        final Path realPath = this.getRealPath(catalog, path, file, this.docsDir);
        final Path archivePath = this.getArchivePath(catalog, path, file, this.docsDir);
        // ensure directory
        this.getRealPath(catalog, path, "", this.docsDir).toFile().mkdirs();
        Files.move(archivePath, realPath, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
    }

    @Override
    public StorageItem[] extract(final String catalog, String userID, String datasetID, String file, boolean replace) throws IOException {
        final Path realPath = this.getUnsavedPath(catalog, userID, datasetID, file, this.docsDir);

        final List<CopyOption> copyOptionList = new ArrayList<>();
        if (replace) {
            copyOptionList.add(StandardCopyOption.REPLACE_EXISTING);
        }
        final CopyOption[] copyOptions = copyOptionList.toArray(new CopyOption[copyOptionList.size()]);

        String[] files = extract(realPath, copyOptions);
        List<StorageItem> storageItems = new ArrayList<>();
        for (String fileName: files) {
            storageItems.add(this.getFileInfo(catalog, userID, datasetID, fileName, this.docsDir, Scope.UNSAVED));
        }
        return storageItems.toArray(new StorageItem[storageItems.size()]);
    }

    @Override
    public void cleanup() throws IOException {
        // delete empty directories
        final Path trashPath = Paths.get(this.docsDir, TRASH_PATH);
        final Path archivePath = Paths.get(this.docsDir, ARCHIVE_PATH);
        final Path unsavedPath = Paths.get(this.docsDir, UNSAVED_PATH);
        final Path unpublishedPath = Paths.get(this.docsDir, UNPUBLISHED_PATH);

        // Delete old unsaved Files
        if(this.unsavedRetentionTime > 0)
        try (Stream<Path> stream = Files.walk(unsavedPath)) {
            final List<Path> oldFiles = stream
                    .filter(p -> !p.toFile().isDirectory() && p.toFile().lastModified() < DateTime.now().minus(Duration.standardDays(this.unsavedRetentionTime)).getMillis())
                    .collect(Collectors.toList());
            for (final Path oldFile : oldFiles) {
                Files.delete(oldFile);
            }
        }


        // Delete old Trash Files
        if(this.trashRetentionTime > 0)
            try (Stream<Path> stream = Files.walk(trashPath)) {
                final List<Path> oldFiles = stream
                        .filter(p -> !p.toFile().isDirectory() && p.toFile().lastModified() < DateTime.now().minus(Duration.standardDays(this.trashRetentionTime)).getMillis())
                        .collect(Collectors.toList());
                for (final Path oldFile : oldFiles) {
                    Files.delete(oldFile);
                }
            }

        // run as long as there are empty directories
        boolean hasEmptyDirs = true;
        while (hasEmptyDirs) {
            // collect empty directories
            try (Stream<Path> stream = Files.walk(Paths.get(this.docsDir))) {
                final List<Path> emptyDirs = stream
                .filter(p -> {
                    boolean isEmptyDir = false;
                    try {
                        if (p.toFile().isDirectory()) {
                            try (DirectoryStream<Path> dirStream = Files.newDirectoryStream(p)) {
                                isEmptyDir = !dirStream.iterator().hasNext() && !(p.equals(trashPath) || p.equals(archivePath) || p.equals(unsavedPath) || p.equals(unpublishedPath));
                            }
                        }
                    }
                    catch (final IOException ex) {
                        throw new UncheckedIOException(ex);
                    }
                    return isEmptyDir;
                })
                .collect(Collectors.toList());

                // delete directories
                for (final Path emptyDir : emptyDirs) {
                    Files.delete(emptyDir);
                }

                hasEmptyDirs = !emptyDirs.isEmpty();
            }
        }
    }


    @Override
    public void saveDataset(final String catalog, String userID, String datasetID, List<String> referencedFiles) throws IOException {
        var unsavedFiles = this.listFiles(catalog, userID, datasetID, this.docsDir, Scope.UNSAVED);
        var existingFiles = this.listFiles(catalog, userID, datasetID, this.docsDir, Scope.UNPUBLISHED);

        final CopyOption[] copyOptions = {StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING};


        existingFiles.stream().filter(f -> !referencedFiles.contains(f.getFile())).forEach(f -> {
            try {
                var existingFile = ((FileSystemItem) f).getRealPath();

                var trashPath = this.getTrashPath(catalog, datasetID, f.getFile(), this.docsDir);
                Files.createDirectories(trashPath.getParent());
                Files.move(existingFile, trashPath, copyOptions);
            }
            catch (final FileAlreadyExistsException faex) {
                    final StorageItem[] items = null;//{this.getFileInfo(faex.getFile())};
                    throw new ConflictException(faex.getMessage(), items, items[0].getNextName());

            }
            catch (final IOException ex) {
                throw new UncheckedIOException(ex);
            }
        });

        unsavedFiles.stream().filter(f -> referencedFiles.contains(f.getFile())).forEach(f -> {
            try {
                var srcPath = this.getUnsavedPath(catalog, userID, datasetID, f.getFile(), this.docsDir);
                var targetPath = this.getUnpublishedPath(catalog, datasetID, f.getFile(), this.docsDir);

                if(targetPath.toFile().exists()){
                    var trashPath = this.getTrashPath(catalog, datasetID, targetPath.getFileName().toString(), this.docsDir);
                    Files.createDirectories(trashPath.getParent());
                    Files.move(targetPath, trashPath, copyOptions);
                }

                Files.createDirectories(targetPath.getParent());
                Files.move(srcPath, targetPath, copyOptions);
            }
            catch (final FileAlreadyExistsException faex) {

                final StorageItem[] items = null;//{this.getFileInfo(faex.getFile())};
                throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
            }
            catch (final IOException ex) {
                throw new UncheckedIOException(ex);
            }
        });

        unsavedFiles.stream().filter(f -> !referencedFiles.contains(f.getFile())).forEach(f -> {
            try {
                var unsavedFile = ((FileSystemItem) f).getRealPath();

                Files.deleteIfExists(unsavedFile);
            }
            catch (final FileAlreadyExistsException faex) {

                final StorageItem[] items = null;//{this.getFileInfo(faex.getFile())};
                throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
            }
            catch (final IOException ex) {
                throw new UncheckedIOException(ex);
            }
        });
    }


    @Override
    public void publishDataset(final String catalog, String datasetID, List<String> referencedFiles) throws IOException{
        var unpublishedFiles = this.listFiles(catalog, null, datasetID, this.docsDir, Scope.UNPUBLISHED);
        var existingFiles = this.listFiles(catalog, null, datasetID, this.docsDir, Scope.PUBLISHED);

        final CopyOption[] copyOptions = {StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING};


        existingFiles.stream().filter(f -> !referencedFiles.contains(f.getFile())).forEach(f -> {
            try {
                var existingFile = ((FileSystemItem) f).getRealPath();

                var trashPath = this.getTrashPath(catalog, datasetID, f.getFile(), this.docsDir);
                Files.createDirectories(trashPath.getParent());
                Files.move(existingFile, trashPath, copyOptions);
            }
            catch (final FileAlreadyExistsException faex) {

                final StorageItem[] items = null;//{this.getFileInfo(faex.getFile())};
                throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
            }
            catch (final IOException ex) {
                throw new UncheckedIOException(ex);
            }
        });

        unpublishedFiles.stream().filter(f -> referencedFiles.contains(f.getFile())).forEach(f -> {
            try {
                var srcPath = this.getUnpublishedPath(catalog, datasetID, f.getFile(), this.docsDir);
                var targetPath = this.getRealPath(catalog, datasetID, f.getFile(), this.docsDir);

                if(targetPath.toFile().exists()){
                    var trashPath = this.getTrashPath(catalog, datasetID, targetPath.getFileName().toString(), this.docsDir);
                    Files.createDirectories(trashPath.getParent());
                    Files.move(targetPath, trashPath, copyOptions);
                }

                Files.createDirectories(targetPath.getParent());
                Files.move(srcPath, targetPath, copyOptions);
            }
            catch (final FileAlreadyExistsException faex) {

                final StorageItem[] items = null;//{this.getFileInfo(faex.getFile())};
                throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
            }
            catch (final IOException ex) {
                throw new UncheckedIOException(ex);
            }
        });

        unpublishedFiles.stream().filter(f -> !referencedFiles.contains(f.getFile())).forEach(f -> {
            try {
                var unsavedFile = ((FileSystemItem) f).getRealPath();

                Files.deleteIfExists(unsavedFile);
            }
            catch (final FileAlreadyExistsException faex) {

                final StorageItem[] items = null;//{this.getFileInfo(faex.getFile())};
                throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
            }
            catch (final IOException ex) {
                throw new UncheckedIOException(ex);
            }
        });
    }

    @Override
    public void unpublishDataset(final String catalog, String datasetID, List<String> referencedFiles) throws IOException{
        var publishedFiles = this.listFiles(catalog, null, datasetID, this.docsDir, Scope.PUBLISHED);

        final CopyOption[] copyOptions = {StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING};

        publishedFiles.stream().filter(f -> referencedFiles.contains(f.getFile())).forEach(f -> {
            try {
                var srcPath = this.getRealPath(catalog, datasetID, f.getFile(), this.docsDir);
                var targetPath = this.getUnpublishedPath(catalog, datasetID, f.getFile(), this.docsDir);

                if(!targetPath.toFile().exists()){
                    Files.createDirectories(targetPath.getParent());
                    Files.move(srcPath, targetPath);
                }
                else{
                    var trashPath = this.getTrashPath(catalog, datasetID, srcPath.getFileName().toString(), this.docsDir);
                    Files.createDirectories(trashPath.getParent());
                    Files.move(srcPath, trashPath, copyOptions);
                }
            }
            catch (final FileAlreadyExistsException faex) {

                final StorageItem[] items = null;//{this.getFileInfo(faex.getFile())};
                throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
            }
            catch (final IOException ex) {
                throw new UncheckedIOException(ex);
            }
        });
    }

    @Override
    public void discardUnpublished(final String catalog, final String datasetID) throws IOException{
        var unpublishedDirPath = this.getUnpublishedPath(catalog, datasetID, "", this.docsDir);

        var unpublishedFiles = this.listFiles(catalog, null, datasetID, this.docsDir, Scope.UNPUBLISHED);

        final CopyOption[] copyOptions = {StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING};

        unpublishedFiles.stream().forEach(f -> {
            try {
                var existingFile = ((FileSystemItem) f).getRealPath();

                var trashPath = this.getTrashPath(catalog, datasetID, f.getFile(), this.docsDir);
                Files.createDirectories(trashPath.getParent());
                Files.move(existingFile, trashPath, copyOptions);
            }
            catch (final FileAlreadyExistsException faex) {

                final StorageItem[] items = null;//{this.getFileInfo(faex.getFile())};
                throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
            }
            catch (final IOException ex) {
                throw new UncheckedIOException(ex);
            }
        });
    }

    @Override
    public void discardUnsaved(final String catalog, String userID, String datasetID) throws IOException{

        var unsavedDirPath = this.getUnsavedPath(catalog, userID, datasetID, "", this.docsDir);

        var unsavedFiles = this.listFiles(catalog, userID, datasetID, this.docsDir, Scope.UNSAVED);

        unsavedFiles.stream().forEach(f -> {
            try {
                var existingFile = ((FileSystemItem) f).getRealPath();
                Files.deleteIfExists(existingFile);
            }
            catch (final FileAlreadyExistsException faex) {

                final StorageItem[] items = null;//{this.getFileInfo(faex.getFile())};
                throw new ConflictException(faex.getMessage(), items, items[0].getNextName());
            }
            catch (final IOException ex) {
                throw new UncheckedIOException(ex);
            }
        });
    }

    /**
     * Check if the file denoted by path is an archive
     *
     * @param path
     * @return
     * @throws IOException
     */
    private boolean isArchive(final Path path) throws IOException {
        final String mimeType = getMimeType(path);
        return mimeType.contains("zip") || mimeType.contains("compressed");
    }

    /**
     * Extract the archive file denoted by path into a directory with the same name.
     *
     * @param path
     * @param copyOptions
     * @return String[]
     * @throws Exception
     */
    private String[] extract(final Path path, final CopyOption... copyOptions) throws IOException {
        final List<Path> result = new ArrayList<>();

        // get the directory name from the archive name
        final Path dir = this.getExtractPath(path);
        Files.createDirectories(dir);

        final int bufferSize = 1024;
        // NOTE: UTF8 encoded ZIP file entries can be interpreted when the constructor is provided
        // with a non-UTF-8 encoding.
        try (ZipInputStream zis = new ZipInputStream(
                new BufferedInputStream(new FileInputStream(path.toString()), bufferSize),
                Charset.forName("Cp437")
            )) {
            ZipEntry zipEntry = zis.getNextEntry();
            while(zipEntry != null){
                final Path file = Paths.get(dir.toString(), this.sanitize(zipEntry.getName(), ILLEGAL_PATH_CHARS));
                if (zipEntry.isDirectory()) {
                    // handle directory
                    Files.createDirectories(file);
                }
                else {
                    // handle file
                    Files.createDirectories(file.getParent());
                    Files.copy(zis, file, copyOptions);
                    result.add(path.getParent().relativize(file));
                }
                zipEntry = zis.getNextEntry();
            }
            zis.closeEntry();
        }
        catch (final Exception ex) {
            log.error("Failed to extract archive '" + path + "'. Cleaning up...", ex);
            // delete all extracted files, if one file fails
            for (final Path file : result) {
                try {
                    Files.delete(file);
                }
                catch (final Exception ex1) {
                    log.error("Could not delete '" + file + "' while cleaning up from failed extraction.");
                }
            }
            throw ex;
        }

        // delete archive
        Files.delete(path);
        return result.stream().map(p -> p.toString()).toArray(size -> new String[size]);
    }



    /**
     * Get the path where files from the given archive should be extracted to
     * @param path
     * @return Path
     */
    private Path getExtractPath(final Path path) {
        String filename = path.getName(path.getNameCount()-1).toString();
        if (filename.indexOf('.') > 0) {
            filename = filename.substring(0, filename.lastIndexOf('.'));
        }
        return Paths.get(path.getParent().toString(), this.sanitize(filename, ILLEGAL_PATH_CHARS));
    }

    /**
     * Replace forbidden characters from a path
     *
     * @param path
     * @param illegalChars
     * @return String
     */
    private String sanitize(String path, final Pattern illegalChars) {
        if(path != null) {
            path = path.replace("/../", "/");
            if (path.startsWith("../")) {
                path = path.substring(3);
            }
            return illegalChars.matcher(path).replaceAll("_");
        }
        return null;
    }

    /**
     * Get the real path of a requested path
     *
     * @param path
     * @param file
     * @param basePath
     * @return Path
     */
    Path getRealPath(final String catalog, final String path, final String file, final String basePath) {
        return FileSystems.getDefault().getPath(basePath,
                this.sanitize(catalog, ILLEGAL_PATH_CHARS), this.sanitize(path, ILLEGAL_PATH_CHARS), this.sanitize(file, ILLEGAL_PATH_CHARS));
    }


    /**
     * Get the real path of a requested path
     *
     * @param path
     * @param file
     * @param basePath
     * @return Path
     */
    Path getUnsavedPath(final String catalog, final String userID, final String path, final String file, final String basePath) {
        return FileSystems.getDefault().getPath(basePath, UNSAVED_PATH,
                this.sanitize(catalog, ILLEGAL_PATH_CHARS), this.sanitize(path, ILLEGAL_PATH_CHARS), this.sanitize(userID, ILLEGAL_PATH_CHARS), this.sanitize(file, ILLEGAL_PATH_CHARS));
    }

    /**
     * Get the real path of a requested path
     *
     * @param path
     * @param file
     * @param basePath
     * @return Path
     */
    Path getUnpublishedPath(final String catalog, final String path, final String file, final String basePath) {
        return FileSystems.getDefault().getPath(basePath, UNPUBLISHED_PATH,
                this.sanitize(catalog, ILLEGAL_PATH_CHARS), this.sanitize(path, ILLEGAL_PATH_CHARS), this.sanitize(file, ILLEGAL_PATH_CHARS));
    }

    /**
     * Get the real path of a requested path
     *
     * @param file
     * @param basePath
     * @return Path
     */
    Path getRealPath(final String file, final String basePath) {
        return FileSystems.getDefault().getPath(basePath, this.sanitize(file, ILLEGAL_PATH_CHARS));
    }

    /**
     * Get the trash path of a requested path
     *
     * @param path
     * @param file
     * @param basePath
     * @return Path
     */
    Path getTrashPath(final String catalog, final String path, final String file, final String basePath) {
        return FileSystems.getDefault().getPath(basePath, TRASH_PATH,
                this.sanitize(catalog, ILLEGAL_PATH_CHARS), this.sanitize(path, ILLEGAL_PATH_CHARS), this.sanitize(file, ILLEGAL_PATH_CHARS));
    }

    /**
     * Get the archive path of a requested path
     *
     * @param path
     * @param file
     * @param basePath
     * @return Path
     */
    Path getArchivePath(final String catalog, final String path, final String file, final String basePath) {
        return FileSystems.getDefault().getPath(basePath, ARCHIVE_PATH,
            this.sanitize(path, ILLEGAL_PATH_CHARS), this.sanitize(file, ILLEGAL_PATH_CHARS));
    }

    /**
     * Get the archive path of a requested path
     *
     * @param file
     * @param basePath
     * @return Path
     */
    private Path getArchivePath(final String file, final String basePath) {
        final Path strippedPath = Paths.get(this.stripPath(this.sanitize(file, ILLEGAL_PATH_CHARS)));
        if (strippedPath.getNameCount() < 2) {
            throw new IllegalArgumentException("Illegal path: "+file);
        }
        final int nameCount = strippedPath.getNameCount();
        final boolean isArchivePath = ARCHIVE_PATH.equals(strippedPath.getName(0).toString());
        return FileSystems.getDefault().getPath(basePath,
                !isArchivePath ? ARCHIVE_PATH : "",
                strippedPath.subpath(0, nameCount).toString());
    }

    /**
     * Remove the upload base directory from a path
     *
     * @param path
     * @return String
     */
    private String stripPath(final String path) {
        final Path basePath = FileSystems.getDefault().getPath(this.docsDir);
        return path.replace(basePath.toString(), "").replaceAll("^[/\\\\]+", "");
    }

    /**
     * Get information about a file
     *
     * @param file
     * @return Item
     * @throws IOException
     */
    private FileSystemItem getFileInfo(String catalog, String userID, String docID, String file, String basePath, Scope scope) throws IOException {
        Path filePath = this.getRealPath(catalog, docID, file, basePath);
        if (scope == Scope.UNSAVED) filePath = this.getUnsavedPath(catalog, userID, docID, file, basePath);
        else if (scope == Scope.UNPUBLISHED) filePath = this.getUnpublishedPath(catalog, docID, file, basePath);
        else if (scope == Scope.ARCHIVED) filePath = this.getArchivePath(catalog, docID, file, basePath);
        else if (scope == Scope.TRASH) filePath = this.getTrashPath(catalog, docID, file, basePath);
        final Path archivePath = this.getArchivePath(catalog, docID, file, basePath);
        if (!filePath.toFile().exists() && archivePath.toFile().exists()) {
            // fall back to archive, if file does not exist
            file = archivePath.toString();
            filePath = archivePath;
        }

        final Path strippedPath = Paths.get(this.stripPath(file));
        final boolean isArchived = filePath.equals(archivePath);

        final int nameCount = strippedPath.getNameCount();
        final String itemPath = ((isArchived ? 1 : 0) < nameCount-1)?strippedPath.subpath((isArchived ? 1 : 0), nameCount-1).toString():"";
        final String itemFile = strippedPath.getName(nameCount-1).toString();

        final String mimeType = getMimeType(filePath);
        final long fileSize = Files.size(filePath);

        // get last modified date of file and take care of timezone correctly, since LocalDateTime does not store time zone information (#745)
        final LocalDateTime lastModifiedTime = LocalDateTime.ofInstant(Files.getLastModifiedTime(filePath).toInstant(), TimeZone.getDefault().toZoneId());

        return new FileSystemItem(this, catalog, docID, userID, itemPath, itemFile, mimeType, fileSize, lastModifiedTime,
                isArchived, scope);
    }

    /**
     * Get the mime type of a file
     *
     * @param path
     * @return String
     * @throws IOException
     */
    private String getMimeType(final Path path) throws IOException {
        if (tika == null) {
            return UNKNOWN_MIME_TYPE;
        }
        try (TikaInputStream stream = TikaInputStream.get(path)) {
            final Metadata metadata = new Metadata();
            metadata.set(Metadata.RESOURCE_NAME_KEY, path.toFile().toString());
            final MediaType mediaType = tika.getDetector().detect(stream, metadata);
            return mediaType.getBaseType().toString();
        }
    }
}
