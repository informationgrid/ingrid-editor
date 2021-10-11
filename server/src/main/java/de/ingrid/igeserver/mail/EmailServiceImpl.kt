package de.ingrid.igeserver.mail

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.configuration.MailProperties
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.springframework.stereotype.Component
import java.text.MessageFormat
import java.util.*

@Component
class EmailServiceImpl @Autowired constructor(
    val email: JavaMailSenderImpl,
    val mailProps: MailProperties,
    val appSettings: GeneralProperties
) {

    init {
        email.javaMailProperties =
            Properties().apply {
                setProperty("mail.mime.charset", "utf-8");
                setProperty("mail.smtp.allow8bitmime", "true");
                setProperty("mail.smtps.allow8bitmime", "true");
            }
    }

    fun sendWelcomeEmail(to: String, firstName: String, lastName: String) {
        val message = SimpleMailMessage().apply {
            from = mailProps.from
            setTo(to)
            subject = mailProps.subject
            text = MessageFormat.format(mailProps.body, firstName, lastName, appSettings.host)
        }
        email.send(message)
    }

    fun sendWelcomeEmailWithPassword(to: String, firstName: String, lastName: String, password: String) {
        val message = SimpleMailMessage().apply {
            from = mailProps.from
            setTo(to)
            subject = mailProps.subject
            text = MessageFormat.format(mailProps.bodyWithPassword, firstName, lastName, appSettings.host, password)
        }
        email.send(message)
    }


}
