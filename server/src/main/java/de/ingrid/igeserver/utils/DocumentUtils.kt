package de.ingrid.igeserver.utils

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DOCUMENT_STATE

fun documentInPublishedState(document: Document) =
    document.state == DOCUMENT_STATE.PUBLISHED || document.state == DOCUMENT_STATE.DRAFT_AND_PUBLISHED || document.state == DOCUMENT_STATE.PENDING