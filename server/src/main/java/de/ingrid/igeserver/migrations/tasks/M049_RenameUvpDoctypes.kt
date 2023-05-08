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
