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
package de.ingrid.igeserver.tasks

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.configuration.MailProperties
import de.ingrid.igeserver.mail.EmailServiceImpl
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.services.UserManagementService
import de.ingrid.igeserver.utils.setAdminAuthentication
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.output.StringOutput
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.time.OffsetDateTime

@Component
class ExpiredDatasetsTask(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
    val catalogService: CatalogService,
    val emailService: EmailServiceImpl,
    val documentService: DocumentService,
    val aclService: IgeAclService,
    private val keycloakService: UserManagementService,
    val appSettings: GeneralProperties,
    val mailProps: MailProperties,
) {

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    val log = logger()

    // this ensures that the task is executed after the initial db migrations
    @EventListener(ApplicationReadyEvent::class)
    fun onStartup() {
        expiredDatasetsTask()
    }

    @Scheduled(cron = "\${cron.expired.datasets.expression}")
    fun expiredDatasetsTask() {
        catalogService.getCatalogs().forEach {
            sendExpiryEmails(it)
        }
        setAdminAuthentication("ExpiredDatasets", "Task")
    }

    private fun sendExpiryEmails(catalog: Catalog) {
        val config = catalog.settings.config.expiredDatasetConfig ?: return
        if (!config.emailEnabled) return

        val repeatExpiryCheck = config.repeatExpiry
        val expiryDuration = config.expiryDuration ?: -1
        val notifyDaysBeforeExpiry = config.notifyDaysBeforeExpiry ?: -1

        if (expiryDuration < 0) {
            log.info("Expiry duration not set for catalog ${catalog.name}")
            return
        }

        val expireDate = OffsetDateTime.now().minusDays(expiryDuration.toLong())

        // only fill if notify days before expiry is set
        var aboutToExpireDatasets = emptyList<ExpiredDataset>()
        if (notifyDaysBeforeExpiry >= 0) {
            val notifyDate =
                expireDate.plusDays(notifyDaysBeforeExpiry.toLong())
            aboutToExpireDatasets =
                this.getDatasetsEditedBefore(catalog, notifyDate, ExpiryState.INITIAL, expireDate).map {
                    this.mapToDataset(it)
                }
            log.info("Found ${aboutToExpireDatasets.size} datasets about to expire for catalog ${catalog.name}")
        } else {
            log.info("Notify days before expiry not set for catalog ${catalog.name}")
        }

        var expiredDatasets = this.getDatasetsEditedBefore(catalog, expireDate, ExpiryState.TO_BE_EXPIRED).map {
            this.mapToDataset(it)
        }
        val repeatExpiredDatasets =
            if (repeatExpiryCheck) {
                this.getDatasetsEditedBefore(catalog, expireDate, ExpiryState.EXPIRED).map {
                    this.mapToDataset(it)
                }
            } else {
                emptyList()
            }

        if (repeatExpiredDatasets.isNotEmpty() || expiredDatasets.isNotEmpty()) {
            log.info("Found ${repeatExpiredDatasets.size} again expired datasets for catalog ${catalog.name}")
            log.info("Found ${expiredDatasets.size} expired datasets for catalog ${catalog.name}")
        } else {
            log.debug("Found no expired datasets for catalog ${catalog.name}")
        }

        expiredDatasets = expiredDatasets + repeatExpiredDatasets

        val linkstub = "${appSettings.host}/${catalog.identifier}"
        val catalogType = catalog.type

        try {
            this.sendExpiryNotificationMails(expiredDatasets, ExpiryState.EXPIRED, linkstub, catalogType)
            this.sendExpiryNotificationMails(aboutToExpireDatasets, ExpiryState.TO_BE_EXPIRED, linkstub, catalogType)

            this.updateExpiryState(expiredDatasets, ExpiryState.EXPIRED)
            this.updateExpiryState(aboutToExpireDatasets, ExpiryState.TO_BE_EXPIRED)
        } catch (e: Exception) {
            log.error(
                "Error sending expiry notification mails for catalog ${catalog.name}. Expiry states not updated.",
                e,
            )
        }
    }

    private fun mapToDataset(dbResponse: Array<Any?>): ExpiredDataset {
        return ExpiredDataset(
            dbResponse[0].toString(),
            dbResponse[1].toString(),
            dbResponse[2].toString(),
            dbResponse[3] as OffsetDateTime,
            dbResponse[4].toString(),
            dbResponse[5].toString(),
        )
    }

    private fun getDatasetsEditedBefore(
        catalog: Catalog,
        date: OffsetDateTime,
        expiryState: ExpiryState = ExpiryState.INITIAL,
        limitDate: OffsetDateTime? = null,
    ): List<Array<Any?>> {
        val beginDate = limitDate ?: OffsetDateTime.now()

        // differ between querying for EXPIRED (to send another expiry email) or for first expiry email !
        // if query for EXPIRED we compare with "=" not "<=" we only want entities already expired !
        // if expiry mail already sent, we use date when email was sent to determine whether again expired !
        // Also check if date not set, then send email (state after date was introduced)
        val expiryFilter =
            if (expiryState == ExpiryState.EXPIRED) {
                "AND dw.expiry_state = :expiryState AND (dw.last_expiry_time IS NULL OR dw.last_expiry_time < :date)"
            } else {
                "AND dw.expiry_state <= :expiryState"
            }

        val limitDateFilter = if (limitDate != null) "AND d.modified >= :beginDate" else ""

        val query = entityManager.createQuery(
            """
                SELECT d.uuid, dw.responsibleUser.userId, d.title, d.modified, d.modifiedby, dw.category
                    FROM DocumentWrapper dw, Document d
                    WHERE dw.uuid = d.uuid AND dw.catalog = :catalog AND dw.type != 'FOLDER' AND dw.deleted != 1 AND d.state = 'PUBLISHED' AND d.modified < :date 
                    $limitDateFilter
                    $expiryFilter
                    """,
        )
        query.setParameter("catalog", catalog)
        query.setParameter("date", date)
        if (limitDate != null) query.setParameter("beginDate", beginDate)
        query.setParameter("expiryState", expiryState.value)
        return query.resultList as List<Array<Any?>>
    }

    fun sendExpiryNotificationMails(
        expiredDatasetList: List<ExpiredDataset>,
        expiryState: ExpiryState = ExpiryState.EXPIRED,
        linkstub: String,
        catalogType: String,
    ) {
        val emailDatasetMap = this.createMailDatasetMap(expiredDatasetList)
        val it: Iterator<Map.Entry<String, List<ExpiredDataset>>> = emailDatasetMap.entries.iterator()

        while (it.hasNext()) {
            val (login, expDatasets) = it.next()

            val recipient = keycloakService.getUser(login).email

            val subject =
                if (ExpiryState.EXPIRED == expiryState) mailProps.subjectDatasetIsExpired else mailProps.subjectDatasetWillExpire

            val output = StringOutput()

            val baseTemplate =
                if (ExpiryState.EXPIRED == expiryState) "export/expired-template.jte" else "export/will-expire-template.jte"

            // check if profile specific template exists, otherwise use default
            val template =
                if (templateEngine.hasTemplate("$catalogType/$baseTemplate")) "$catalogType/$baseTemplate" else baseTemplate
            templateEngine.render(
                template,
                mapOf(
                    "map" to mapOf(
                        "datasets" to expDatasets,
                        "linkstub" to linkstub,
                    ),
                ),
                output,
            )

            val text = output.toString()
            log.debug("Sending expired datasets mail to $recipient")
            emailService.sendEmail(
                recipient,
                subject,
                text,
            )
        }
    }

    private fun createMailDatasetMap(expiredDatasetList: List<ExpiredDataset>): Map<String, MutableList<ExpiredDataset>> {
        val mailDatasetMap: MutableMap<String, MutableList<ExpiredDataset>> = HashMap()
        for (expDataset in expiredDatasetList) {
            val login = expDataset.responsibleUserLogin ?: continue
            var datasetList = mailDatasetMap[login]
            if (datasetList == null) {
                datasetList = ArrayList()
                mailDatasetMap[login] = datasetList
            }
            datasetList.add(expDataset)
        }
        return mailDatasetMap
    }

    private fun updateExpiryState(expiredDatasetList: List<ExpiredDataset>, state: ExpiryState) {
        val expiryTime = OffsetDateTime.now()
        for (expiredDataset in expiredDatasetList) {
            ClosableTransaction(transactionManager).use {
                entityManager.createNativeQuery(
                    """
                    UPDATE document_wrapper
                        SET expiry_state = :state, last_expiry_time = :expiryTime
                        WHERE uuid = :uuid
                    """,
                )
                    .setParameter("state", state.value)
                    .setParameter("expiryTime", expiryTime)
                    .setParameter(
                        "uuid",
                        expiredDataset.uuid,
                    ).executeUpdate()
            }
        }
    }
}

data class ExpiredDataset(
    var uuid: String? = null,
    var responsibleUserLogin: String? = null,
    var title: String? = null,
    var modified: OffsetDateTime? = null,
    var modifiedBy: String = "",
    var type: String = "",
)

enum class ExpiryState(val value: Int) {
    INITIAL(0),
    TO_BE_EXPIRED(10),
    EXPIRED(20),
}
