package de.ingrid.igeserver.model


class FileInfo {
    private val uploadedChunks: MutableSet<Int> = HashSet()

    fun isUploadFinished(flowTotalChunks: Int): Boolean {
        return uploadedChunks.size == flowTotalChunks
    }

    fun containsChunk(flowChunkNumber: Int): Boolean {
        return uploadedChunks.contains(flowChunkNumber)
    }

    fun addUploadedChunk(flowChunkNumber: Int) {
        uploadedChunks.add(flowChunkNumber)
    }
}
