package de.ingrid.igeserver.model

data class ExportRequestParameter(
    val id: String,
    val exportFormat: String,
    val useDraft: Boolean = false,
    val method: ExportMethod
)

enum class ExportMethod {
    dataset, belowDataset, datasetAndBelow
}