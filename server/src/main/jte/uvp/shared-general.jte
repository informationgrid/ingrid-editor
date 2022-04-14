@import de.ingrid.igeserver.profiles.uvp.exporter.model.ApprovalProcedureModel

@param ApprovalProcedureModel page

<id>${page.getUuid()}</id>
@if(page.getParentUuid() != null)
    <parent_id>${page.getParentUuid()}</parent_id>
@endif
<date>${page.getModified()}</date>
<name>${page.getTitle()}</name>
<descr>${page.getDescription()}</descr>
<type>${page.getDocumentType()}</type>