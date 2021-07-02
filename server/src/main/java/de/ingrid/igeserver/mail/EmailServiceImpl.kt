package de.ingrid.igeserver.mail

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Component

@Component
class EmailServiceImpl @Autowired constructor(val email: JavaMailSender) {
    
    fun sendWelcomeEmail() {
        val message = SimpleMailMessage().apply { 
            from = "keycloak@wemove.com"
            setTo("andre.wallat@gmail.com")
            subject = "Test von IGE-NG"
            text = "Willkommen beim IGE-NG\n\nLink: https://ige-ng.informationgrid.eu"
        }
        email.send(message)
    }
}