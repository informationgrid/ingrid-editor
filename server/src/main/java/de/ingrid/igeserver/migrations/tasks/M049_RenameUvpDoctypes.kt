/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

/**
 * Rename document types 
 *  UvpAdmissionProcedureDoc -> UvpApprovalProcedureDoc
 *  UvpNegativePreliminaryExaminationDoc -> UvpNegativePreliminaryAssessmentDoc
 */
@Service
class M049_RenameUvpDoctypes : MigrationBase("0.49") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            val renameAdmissionProcedure = entityManager.createNativeQuery(
                "UPDATE document SET type = 'UvpApprovalProcedureDoc' WHERE type = 'UvpAdmissionProcedureDoc'"
            )
            val renameNegativPreliminary = entityManager.createNativeQuery(
                "UPDATE document SET type = 'UvpNegativePreliminaryAssessmentDoc' WHERE type = 'UvpNegativePreliminaryExaminationDoc'"
            )
            val renameAdmissionProcedureInWrapper = entityManager.createNativeQuery(
                "UPDATE document_wrapper SET type = 'UvpApprovalProcedureDoc' WHERE type = 'UvpAdmissionProcedureDoc'"
            )
            val renameNegativPreliminaryInWrapper = entityManager.createNativeQuery(
                "UPDATE document_wrapper SET type = 'UvpNegativePreliminaryAssessmentDoc' WHERE type = 'UvpNegativePreliminaryExaminationDoc'"
            )

            renameAdmissionProcedure.executeUpdate()
            renameNegativPreliminary.executeUpdate()
            renameAdmissionProcedureInWrapper.executeUpdate()
            renameNegativPreliminaryInWrapper.executeUpdate()
        }
    }

}
