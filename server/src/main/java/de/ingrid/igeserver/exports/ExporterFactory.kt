package de.ingrid.igeserver.exports;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExporterFactory {

    final List<IgeExporter> exporterList;

    @Autowired
    public ExporterFactory(List<IgeExporter> exporterList) {
        this.exporterList = exporterList;
    }

    public List<ExportTypeInfo> getTypeInfos() {
		return exporterList.stream()
				.map(IgeExporter::getTypeInfo)
				.collect(Collectors.toList());
	}

    public IgeExporter getExporter(String format) {
        return this.exporterList.stream()
				.filter(e -> format.equals(e.getTypeInfo().getType()))
				.findAny()
				.orElse(null);
    }
}
