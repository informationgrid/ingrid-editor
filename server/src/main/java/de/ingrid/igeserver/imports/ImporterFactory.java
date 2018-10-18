package de.ingrid.igeserver.imports;

import de.ingrid.ige.api.IgeImporter;
import de.ingrid.igeserver.imports.iso.IsoImporter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImporterFactory {

    private final List<IgeImporter> importer;

    @Autowired
    public ImporterFactory(List<IgeImporter> importer) {
        this.importer = importer;

        for (IgeImporter impClass : importer) {
            impClass.run(null);
        }
    }

    public IgeImporter getImporter() {
        return new IsoImporter();
    }
}
