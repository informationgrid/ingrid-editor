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
package de.ingrid.igeserver.mail

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.configuration.MailProperties
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Component
import java.text.MessageFormat

@Component
class EmailServiceImpl(
    val email: JavaMailSender,
    val mailProps: MailProperties,
    appSettings: GeneralProperties
) {
    
    @Value("\${server.servlet.context-path}")
    private val contextPath: String = "/"
    
    private val appUrl: String = appSettings.host + contextPath

    fun sendWelcomeEmail(to: String, firstName: String, lastName: String) {
        sendEmail(
            to,
            mailProps.subject,
            MessageFormat.format(mailProps.body, firstName, lastName, appUrl)
        )
    }

    fun sendWelcomeEmailWithPassword(to: String, firstName: String, lastName: String, password: String, login: String) {
        sendEmail(
            to,
            mailProps.subject,
            MessageFormat.format(mailProps.bodyWithPassword, firstName, lastName, appUrl, password, login)
        )
    }


    fun sendDeletionEmail(to: String, firstName: String, lastName: String, login: String) {
        sendEmail(
            to,
            mailProps.subjectDeleteUser,
            MessageFormat.format(mailProps.bodyDeleteUser, firstName, lastName, appUrl, login)
        )
    }

    fun sendResetPasswordEmail(to: String, firstName: String, lastName: String, password: String, login: String) {
        sendEmail(
            to,
            mailProps.subjectResetPassword,
            MessageFormat.format(mailProps.bodyResetPassword, firstName, lastName, appUrl, password, login)
        )
    }

    fun sendEmail(to: String, subject: String, text: String) {
        val message = SimpleMailMessage().apply {
            from = mailProps.from
            setTo(to)
            setSubject(subject)
            setText(text)
        }
        email.send(message)
    }

}
