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
        val message = SimpleMailMessage().apply {
            from = mailProps.from
            setTo(to)
            subject = mailProps.subject
            text = MessageFormat.format(mailProps.body, firstName, lastName, appSettings.host)
        }
        email.send(message)
    }

    fun sendWelcomeEmailWithPassword(to: String, firstName: String, lastName: String, password: String, login: String) {
        val message = SimpleMailMessage().apply {
            from = mailProps.from
            setTo(to)
            subject = mailProps.subject
            text = MessageFormat.format(mailProps.bodyWithPassword, firstName, lastName, appSettings.host, password, login)
        }
        email.send(message)
    }

}
