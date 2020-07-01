package de.ingrid.igeserver.imports;

import de.ingrid.ige.api.IgeImporter;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.imports.iso.IsoImporter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ImporterFactory {

    private static Logger log = LogManager.getLogger(ImporterFactory.class);

    @Autowired
    private List<IgeImporter> importer;

    public IgeImporter getImporter(String contentType, String fileContent) throws ApiException {

        List<IgeImporter> responsibleImporter = importer.stream()
                .filter(item -> item.canHandleImportFile(contentType, fileContent))
                .collect(Collectors.toList() );

        if (responsibleImporter.size() == 0) {
            String message = "No matching importer found that can handle the input file with contentType: " + contentType;
            throw new ApiException(message, true);
        } else if (responsibleImporter.size() > 1) {
            String importerNames = responsibleImporter.stream()
                    .map(IgeImporter::getName)
                    .collect(Collectors.joining(","));
            String message = "There's more than one importer who wants to handle the import: " + importerNames;
            throw new ApiException(message, true);
        }

        return responsibleImporter.get(0);

    }
}
