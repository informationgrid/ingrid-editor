/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
