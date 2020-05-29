/*-
 * **************************************************-
 * InGrid Portal MDEK Application
 * ==================================================
 * Copyright (C) 2014 - 2020 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.1 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 * 
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 * 
 * http://ec.europa.eu/idabc/eupl5
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 * **************************************************#
 */
package de.ingrid.igeserver.utils.markdown

import org.apache.log4j.Logger
import org.commonmark.ext.front.matter.YamlFrontMatterExtension
import org.commonmark.ext.front.matter.YamlFrontMatterVisitor
import org.commonmark.ext.gfm.tables.TablesExtension
import org.commonmark.parser.Parser
import org.commonmark.renderer.html.HtmlRenderer
import org.springframework.stereotype.Service
import java.io.IOException
import java.net.URISyntaxException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.*
import java.util.stream.Collectors

/**
 * Scans the context help directory (defaults to "context_help") for markdown
 * files. Returns HTML rendered representation.
 *
 * @author jm
 */
@Service
class MarkdownContextHelpUtils {
    var contextHelpPath = DEFAULT_CONTEXT_HELP_PATH
    /**
     * Default language (ISO 639-1)
     *
     * @return
     */
    /**
     * @param language (ISO 639-1)
     */
    var defaultLanguage = DEFAULT_LANG
    private var parser: Parser? = null
    private var htmlRenderer: HtmlRenderer? = null

    constructor() {
        contextHelpPath = DEFAULT_CONTEXT_HELP_PATH
        init()
    }

    constructor(contextHelpPath: String) {
        this.contextHelpPath = contextHelpPath
        init()
    }

    private fun init() {
        val extensions = Arrays.asList(YamlFrontMatterExtension.create(), TablesExtension.create())
        parser = Parser.builder().extensions(extensions).build()
        val renderExtensions = Arrays.asList(TablesExtension.create())
        htmlRenderer = HtmlRenderer.builder().extensions(renderExtensions).build()
    }// read profile directories, exclude directory override// override directory

    /**
     * Returns a Map with rendered HTML from markdown files.
     *
     *
     * The markdown files can be localized.
     *
     *
     * A profile mechanism exists to be able to support catalog dependent
     * context help. This is not yet supported by the current editor but will
     * be in the future. The idea is, that the catalogs can be configured with
     * a context help profile parameter. This parameter must match a profile
     * directory in the context help file structure.
     *
     *
     * The context help file structure can be as follows:
     *
     * <pre>
     * context_help
     * _profile // profiles
     * myprofile // profile directory
     * en // localization directory
     * markdownfile_en.md
     * markdownfile.md
     * en // localization directory
     * markdownfile_en.md
     * markdownfile.md
    </pre> *
     *
     *
     * Base directory is <pre>TOMCAT/webapps/ingrid-portal-mdek-application/WEB-INF/classes/context_help</pre>
     *
     *
     * Markdown files must contain front matter meta data like this to be assigned to a GUI element.
     * The markdown can be specific to GUI element and object class.
     *
     * <pre>
     * ---
     * # ID of GUI element
     * guid: 3000
     * # optional: ID of "Objektklasse"
     * oid: 1
     * # optional: title, used as windows title
     * title: My Title
     * ---
    </pre> *
     *
     * @return
     */
    val availableMarkdownHelpFiles: Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem>
        get() {
            val result: MutableMap<MarkdownContextHelpItemKey, MarkdownContextHelpItem> = HashMap()
            try {
                result.putAll(getLocMarkdownHelpFilesFromPath(contextHelpPath, null))

                // override directory
                val overrideDir = Paths.get(contextHelpPath, PROFILE_DIR)
                if (javaClass.classLoader.getResource(overrideDir.toString()) != null) {
                    Files.list(Paths.get(javaClass.classLoader.getResource(overrideDir.toString()).toURI()))
                            .filter { path: Path? -> Files.isDirectory(path) }.collect(Collectors.toList())
                            .forEach { profilePath ->
                                val abs = profilePath.toAbsolutePath().toString()
                                val dir = abs.substring(abs.indexOf(contextHelpPath))
                                result.putAll(getLocMarkdownHelpFilesFromPath(dir, profilePath.fileName.toString()))
                            }
                }

            } catch (e: IOException) {
                LOG.error("Impossible to get ressource from class path.", e)
                throw RuntimeException(e)
            } catch (e: URISyntaxException) {
                LOG.error("Impossible to get ressource from class path.", e)
                throw RuntimeException(e)
            }
            return result
        }

    @Throws(IOException::class, URISyntaxException::class)
    private fun getLocMarkdownHelpFilesFromPath(sourcePath: String, profile: String?): Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem> {
        val result: MutableMap<MarkdownContextHelpItemKey, MarkdownContextHelpItem> = HashMap()
        result.putAll(getMarkdownHelpFilesFromPath(sourcePath, defaultLanguage, profile))
        Files.list(Paths.get(javaClass.classLoader.getResource(sourcePath).toURI()))
                .filter { path: Path? -> Files.isDirectory(path) }
                .filter { path: Path -> "override" != path.fileName.toString() }
                .forEach { langPath ->
                    val abs = langPath.toAbsolutePath().toString()
                    val dir = abs.substring(abs.indexOf(sourcePath))
                    result.putAll(getMarkdownHelpFilesFromPath(dir, langPath.fileName.toString(), profile))
                }

        return result
    }

    @Throws(IOException::class, URISyntaxException::class)
    private fun getMarkdownHelpFilesFromPath(sourcePath: String, language: String, profile: String?): Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem> {
        val result: MutableMap<MarkdownContextHelpItemKey, MarkdownContextHelpItem> = HashMap()
        Files.list(Paths.get(javaClass.classLoader.getResource(sourcePath).toURI()))
                .filter { path: Path? -> Files.isRegularFile(path) }
                .forEach { path ->
                    val content = String(Files.readAllBytes(Paths.get(path.toUri())))
                    val mdNode = parser!!.parse(content)
                    val visitor = YamlFrontMatterVisitor()
                    mdNode.accept(visitor)
                    val data = visitor.data
                    var fieldId: String? = null
                    var docType: String? = null
                    var title: String? = null
                    for ((key, value) in data) {
                        if (key == "id") {
                            fieldId = value[0]
                        }
                        if (key == "docType") {
                            docType = value[0]
                        }
                        if (key == "title") {
                            title = value[0]
                        }
                    }
                    if (fieldId != null) {
                        val itemKey = MarkdownContextHelpItemKey(fieldId)
                        itemKey.lang = language
                        if (docType != null) {
                            itemKey.docType = docType
                        }
                        if (profile != null) {
                            itemKey.profile = profile
                        }
                        val helpItem = MarkdownContextHelpItem(path)
                        if (title != null) {
                            helpItem.title = title
                        }
                        result[itemKey] = helpItem
                    }

                }

        return result
    }

    fun renderMarkdownFile(markdownPath: Path): String? {
        var renderedNode: String? = null
        renderedNode = try {
            val content = String(Files.readAllBytes(Paths.get(markdownPath.toUri())))
            val mdNode = parser!!.parse(content)
            htmlRenderer!!.render(mdNode)
        } catch (e: IOException) {
            LOG.error("Impossible to open ressource from class path.", e)
            throw RuntimeException(e)
        }
        return renderedNode
    }

    companion object {
        protected const val PROFILE_DIR = "profile"
        private const val DEFAULT_CONTEXT_HELP_PATH = "contextHelp"
        private const val DEFAULT_LANG = "de"
        private val LOG = Logger.getLogger(MarkdownContextHelpUtils::class.java)
    }
}