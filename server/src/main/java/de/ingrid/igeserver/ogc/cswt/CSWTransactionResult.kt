package de.ingrid.igeserver.ogc.cswt

class CSWTransactionResult {

    private var requestId: String? = null
    private var inserts = 0
    private var updates = 0
    private var deletes = 0
//    private var insertResults: List<ActionResult>? = null
    private var successful = false
    private var errorMessage: String? = null

    /**
     * Constructor
     * @param requestId
     */
    fun CSWTransactionResult(requestId: String?) {
        this.requestId = requestId
    }

    /**
     * Get the request id
     * @return String
     */
    fun getRequestId(): String? {
        return requestId
    }

    /**
     * Set the number of inserted records
     * @param inserts
     */
    fun setNumberOfInserts(inserts: Int) {
        this.inserts = inserts
    }

    /**
     * Get the number of inserted records
     * @return Integer
     */
    fun getNumberOfInserts(): Int {
        return inserts
    }

    /**
     * Set the number of updated records
     * @param updates
     */
    fun setNumberOfUpdates(updates: Int) {
        this.updates = updates
    }

    /**
     * Get the number of updated records
     * @return Integer
     */
    fun getNumberOfUpdates(): Int {
        return updates
    }

    /**
     * Set the number of deleted records
     * @param deletes
     */
    fun setNumberOfDeletes(deletes: Int) {
        this.deletes = deletes
    }

    /**
     * Get the number of deleted records
     * @return Integer
     */
    fun getNumberOfDeletes(): Int {
        return deletes
    }

//    /**
//     * Set the list of results of insert actions
//     * @param insertResults
//     */
//    fun setInsertResults(insertResults: List<ActionResult>?) {
//        this.insertResults = insertResults
//    }
//
//    /**
//     * Get the list of results of insert actions
//     * @return List<ActionResult>
//    </ActionResult> */
//    fun getInsertResults(): List<ActionResult>? {
//        return insertResults
//    }

    fun isSuccessful(): Boolean {
        return successful
    }

    fun setSuccessful(successful: Boolean) {
        this.successful = successful
    }

    fun getErrorMessage(): String? {
        return errorMessage
    }

    fun setErrorMessage(errorMessage: String?) {
        this.errorMessage = errorMessage
    }
}