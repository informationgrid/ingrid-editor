package de.ingrid.igeserver.mail

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.configuration.MailProperties
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Component
import java.text.MessageFormat

@Component
class EmailServiceImpl @Autowired constructor(
    val email: JavaMailSender,
    val mailProps: MailProperties,
    val appSettings: GeneralProperties
) {

    fun sendWelcomeEmail(to: String, firstName: String, lastName: String) {
        sendEmail(
            to,
            mailProps.subject,
            MessageFormat.format(mailProps.body, firstName, lastName, appSettings.host)
        )
    }

    fun sendWelcomeEmailWithPassword(to: String, firstName: String, lastName: String, password: String, login: String) {
        sendEmail(
            to,
            mailProps.subject,
            MessageFormat.format(mailProps.bodyWithPassword, firstName, lastName, appSettings.host, password, login)
        )
    }


    fun sendDeletionEmail(to: String, firstName: String, lastName: String, login: String) {
        sendEmail(
            to,
            mailProps.subjectDeleteUser,
            MessageFormat.format(mailProps.bodyDeleteUser, firstName, lastName, appSettings.host, login)
        )
    }

    fun sendResetPasswordEmail(to: String, firstName: String, lastName: String, password: String, login: String) {
        sendEmail(
            to,
            mailProps.subjectResetPassword,
            MessageFormat.format(mailProps.bodyResetPassword, firstName, lastName, appSettings.host, password, login)
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
