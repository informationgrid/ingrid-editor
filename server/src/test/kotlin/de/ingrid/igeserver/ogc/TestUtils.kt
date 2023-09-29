package de.ingrid.igeserver.ogc

import org.apache.commons.io.FileUtils
import org.apache.commons.lang3.StringUtils
import org.springframework.util.ResourceUtils
import java.io.File
import java.io.IOException
import java.nio.charset.Charset

class TestUtils {

    @Throws(IOException::class)
    fun readXml(vararg prefixes: String?, extension: String): String? {
        val path = StringUtils.join(prefixes, File.separatorChar)
        val file = ResourceUtils.getFile("classpath:$path.$extension")
        return FileUtils.readFileToString(file, Charset.forName("utf-8"))
    }

    @Throws(IOException::class)
    fun readFile(vararg prefixes: String?): String? {
        val path = StringUtils.join(prefixes, File.separatorChar)
        val file = ResourceUtils.getFile("classpath:$path")
        return FileUtils.readFileToString(file, Charset.forName("utf-8"))
    }

}