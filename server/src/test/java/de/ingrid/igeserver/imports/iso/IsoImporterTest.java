package de.ingrid.igeserver.imports.iso;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.junit.Test;

public class IsoImporterTest {

	@Test
	public void testRun() {
		
		IsoImporter isoImporter = new IsoImporter();
		
		String data = getXmlDoc();
		isoImporter.run(data);
		
	}

	private String getXmlDoc() {
		try {
			return new String(Files.readAllBytes(Paths.get(ClassLoader.getSystemResource("csw_test_import_example.xml").toURI())));
		} catch (IOException | URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
	}

}
