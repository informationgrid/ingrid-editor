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
package de.ingrid.igeserver.utils.markdown

import org.apache.logging.log4j.kotlin.logger
import org.commonmark.ext.front.matter.YamlFrontMatterExtension
import org.commonmark.ext.front.matter.YamlFrontMatterVisitor
import org.commonmark.ext.gfm.tables.TablesExtension
import org.commonmark.parser.Parser
import org.commonmark.renderer.html.HtmlRenderer
import org.springframework.stereotype.Service
import java.io.File
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.*

/**
 * Scans the context help directory (defaults to "context_help") for markdown
 * files. Returns HTML rendered representation.
 *
 * @author jm
 */
@Service
class MarkdownContextHelpUtils {

    val log = logger()

    val contextHelpPath = DEFAULT_CONTEXT_HELP_PATH

    /**
     * Default language (ISO 639-1)
     *
     * @return
     */
    var defaultLanguage = DEFAULT_LANG

    private lateinit var parser: Parser

    private var htmlRenderer: HtmlRenderer? = null

    private fun init() {
        val extensions = Arrays.asList(YamlFrontMatterExtension.create(), TablesExtension.create())
        parser = Parser.builder().extensions(extensions).build()
        val renderExtensions = Arrays.asList(TablesExtension.create())
        htmlRenderer = HtmlRenderer.builder().extensions(renderExtensions).build()
    } // read profile directories, exclude directory override// override directory

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
     *   myprofile // profile directory
     *     en // localization directory
     *       markdownfile_en.md
     *     markdownfile.md
     * </pre>
     *
     *
     * Base directory is <pre>resources/contextHelp</pre>
     *
     *
     * Markdown files must contain front matter meta data like this to be assigned to a GUI element.
     * The markdown can be specific to GUI element and object class.
     *
     * <pre>
     * ---
     * # ID of GUI element
     * id: 3000
     * # optional: ID of "Objektklasse"
     * docType: mcloud
     * # optional: title, used as windows title
     * title: My Title
     * ---
     * </pre>
     *
     * @return
     */
    val availableMarkdownHelpFiles: Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem>
        get() {
            val result = mutableMapOf<MarkdownContextHelpItemKey, MarkdownContextHelpItem>()

            val profileDir = this::class.java.getResource(contextHelpPath)
            if (profileDir == null) {
                log.error("Path for context help not found: $contextHelpPath")
                return result
            }

            val profileResource = File(profileDir.path)

            profileResource.walk()
                .maxDepth(1)
                .drop(1)
                .filter { it.isDirectory }
                .forEach { profilePath ->
                    val from = getLanguageHelpFiles(profilePath, profilePath.name)
                    result.putAll(from)
                }

            return result
        }

    private fun getLanguageHelpFiles(
        sourcePath: File,
        profile: String,
    ): Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem> {
        val result = mutableMapOf<MarkdownContextHelpItemKey, MarkdownContextHelpItem>()

        // get default language
        val defaultHelpFiles = getHelpFilesFromPath(sourcePath, defaultLanguage, profile)
        result.putAll(defaultHelpFiles)

        // get other languages
        sourcePath.walk().maxDepth(1)
            .drop(1)
            .filter { it.isDirectory }
//                .filter { "override" != it.name }
            .forEach { langPath ->
                val localeHelpFiles = getHelpFilesFromPath(langPath, langPath.name, profile)
                result.putAll(localeHelpFiles)
            }

        return result
    }

    private fun getHelpFilesFromPath(
        sourcePath: File,
        language: String,
        profile: String,
    ): Map<MarkdownContextHelpItemKey, MarkdownContextHelpItem> {
        return sourcePath.walk().maxDepth(1)
            .filter { it.isFile }
            .flatMap { readMarkDownFile(it, language, profile) }
            .map { it!!.first to it.second }
            .toMap()
    }

    private fun readMarkDownFile(
        path: File,
        language: String,
        profile: String,
    ): List<Pair<MarkdownContextHelpItemKey, MarkdownContextHelpItem>?> {
        val result = mutableListOf<Pair<MarkdownContextHelpItemKey, MarkdownContextHelpItem>>()
        val content = File(path.toURI()).readText()
        val data = parseYaml(content)

        val fieldId: String? = data["id"]?.get(0)
        val docTypes: List<String> = data["docType"] ?: emptyList()
        val title: String? = data["title"]?.get(0)

        docTypes.forEach { docType ->

            if (fieldId != null) {
                val itemKey = MarkdownContextHelpItemKey(
                    fieldId,
                    docType,
                    language,
                    profile,
                )

                val helpItem = MarkdownContextHelpItem(path.toPath())
                helpItem.title = title
                result.add(Pair(itemKey, helpItem))
            }
        }

        return result
    }

    private fun parseYaml(content: String): Map<String, MutableList<String>> {
        val mdNode = parser.parse(content)
        val visitor = YamlFrontMatterVisitor()
        mdNode.accept(visitor)
        return visitor.data
    }

    fun renderMarkdownFile(markdownPath: Path): String? {
        val renderedNode: String?
        renderedNode = try {
            val content = String(Files.readAllBytes(Paths.get(markdownPath.toUri())))
            val mdNode = parser.parse(content)
            htmlRenderer!!.render(mdNode)
        } catch (e: IOException) {
            log.error("Impossible to open ressource from class path.", e)
            throw RuntimeException(e)
        }
        return renderedNode
    }

    companion object {
        private const val DEFAULT_CONTEXT_HELP_PATH = "/contextHelp"
        private const val DEFAULT_LANG = "de"
    }

    init {
        init()
    }
}
