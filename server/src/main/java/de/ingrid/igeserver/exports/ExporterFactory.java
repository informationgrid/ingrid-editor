package de.ingrid.igeserver.exports;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import de.ingrid.igeserver.exports.iso.IsoExporter;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Service
public class ExporterFactory {

	@Autowired
	List<IgeExporter> exporterList;

	public IgeExporter getExporter(String format) {
		Optional<IgeExporter> exporter = this.exporterList.stream().filter(e -> format.equals(e.getTypeInfo().getType())).findAny();
		return exporter.orElse(null);
	}
}
