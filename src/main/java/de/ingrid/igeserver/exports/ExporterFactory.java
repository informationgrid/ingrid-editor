package de.ingrid.igeserver.exports;

import org.springframework.stereotype.Service;

import de.ingrid.igeserver.exports.iso.IsoExporter;

@Service
public class ExporterFactory {

	public IgeExporter getExporter(String format) {
		return new IsoExporter();
	}
}
