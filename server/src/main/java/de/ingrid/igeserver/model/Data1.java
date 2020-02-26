package de.ingrid.igeserver.model;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * Data1
 */
public class Data1   {
  @JsonProperty("destId")
  private String destId = null;

  public Data1 destId(String destId) {
    this.destId = destId;
    return this;
  }

   /**
   * Get destId
   * @return destId
  **/

  public String getDestId() {
    return destId;
  }

  public void setDestId(String destId) {
    this.destId = destId;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Data1 data1 = (Data1) o;
    return Objects.equals(this.destId, data1.destId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(destId);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Data1 {\n");
    
    sb.append("    destId: ").append(toIndentedString(destId)).append("\n");
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
}

