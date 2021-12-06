package de.ingrid.igeserver.persistence.postgresql.jpa

import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.TransactionDefinition
import org.springframework.transaction.TransactionStatus
import org.springframework.transaction.support.DefaultTransactionDefinition
import java.io.Closeable

class ClosableTransaction(private val tm: PlatformTransactionManager, private val callback: (() -> Unit)? = null) : Closeable {

    companion object {
        private val definition: DefaultTransactionDefinition = DefaultTransactionDefinition()
        init {
            definition.isolationLevel = TransactionDefinition.ISOLATION_REPEATABLE_READ
        }
    }

    private var status: TransactionStatus

    private var doRollback: Boolean = false

    init {
        status = tm.getTransaction(definition)
    }

    override fun close() {
        if (doRollback) tm.rollback(status) else tm.commit(status)
        callback?.invoke()
    }

    fun markForRollback() {
        doRollback = true
    }
}
