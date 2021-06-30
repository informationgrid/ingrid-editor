package de.ingrid.igeserver.model

data class ImportAnalyzeResponse(val importer: List<String>, val existingDatasets: List<String>)