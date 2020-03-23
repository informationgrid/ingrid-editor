package de.ingrid.igeserver.model;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ExportRequestParameter {
  @JsonProperty("id")
  private String id = null;

  @JsonProperty("exportFormat")
  private String exportFormat = null;

  @JsonProperty("useDraft")
  private boolean useDraft = false;

  public ExportRequestParameter id(String id) {
    this.id = id;
    return this;
  }

   /**
   * Unique identifier
   * @return id
  **/

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public ExportRequestParameter exportFormat(String format) {
    this.exportFormat = format;
    return this;
  }

   /**
   * Description of the dataset.
   * @return exportFormat
  **/
  public String getExportFormat() {
    return exportFormat;
  }

  public void setExportFormat(String exportFormat) {
    this.exportFormat = exportFormat;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ExportRequestParameter data5 = (ExportRequestParameter) o;
    return Objects.equals(this.id, data5.id) &&
        Objects.equals(this.exportFormat, data5.exportFormat);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, exportFormat);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Data5 {\n");
    
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    exportFormat: ").append(toIndentedString(exportFormat)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }

  public boolean isUseDraft() {
    return useDraft;
  }

  public void setUseDraft(boolean useDraft) {
    this.useDraft = useDraft;
  }
}

