package de.ingrid.igeserver.mail

import de.ingrid.igeserver.configuration.MailProperties
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Component
import java.text.MessageFormat

@Component
class EmailServiceImpl @Autowired constructor(val email: JavaMailSender, val mailProps: MailProperties) {

    fun sendWelcomeEmail(to: String) {
        val message = SimpleMailMessage().apply {
            from = mailProps.from
            setTo(to)
            subject = mailProps.subject
            text = mailProps.body
        }
        email.send(message)
    }
    
    fun sendWelcomeEmailWithPassword(to: String, password: String) {
        val message = SimpleMailMessage().apply {
            from = mailProps.from
            setTo(to)
            subject = mailProps.subject
            text = MessageFormat.format(mailProps.bodyWithPassword, password)
        }
        email.send(message)
    }


}