package de.ingrid.igeserver.imports;

import de.ingrid.igeserver.imports.iso.IsoImporter;

public class ImporterFactory {

	public IgeImporter getImporter() {
		return new IsoImporter();
	}
}
