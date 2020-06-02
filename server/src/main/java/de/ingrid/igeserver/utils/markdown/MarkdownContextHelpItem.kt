package de.ingrid.igeserver.utils.markdown

import java.nio.file.Path

class MarkdownContextHelpItem(val markDownFilename: Path) {

    /**
     * Title, used in help window bar.
     */
    var title: String? = null

    override fun toString(): String {
        return "MarkdownContextHelpItem: {markDownFilename: $markDownFilename; title: $title}"
    }

}