package de.ingrid.igeserver.persistence.postgresql

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.IgeServer
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import java.time.LocalDateTime

class ClassWithDate(

        //@JsonSerialize(using= LocalDateTimeSerializer::class)
        //@JsonDeserialize(using= LocalDateTimeDeserializer::class)
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
        val date: LocalDateTime = LocalDateTime.now()
)

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [IgeServer::class])
@ActiveProfiles("postgresql")
class DateTest {

    @Test
    fun `serialize date`() {
        val date = ClassWithDate()
        val mapper = jacksonObjectMapper()
        mapper.findAndRegisterModules()

        val serialized = mapper.writeValueAsString(date);
        println(serialized)

        val deserialized = mapper.readValue(serialized, ClassWithDate::class.java)
        println(deserialized)
    }
}