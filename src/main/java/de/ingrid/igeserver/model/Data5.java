package de.ingrid.igeserver.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Data5
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

public class Data5   {
  @JsonProperty("_id")
  private String id = null;

  @JsonProperty("_profile")
  private String profile = null;

  public Data5 id(String id) {
    this.id = id;
    return this;
  }

   /**
   * Unique identifier
   * @return id
  **/
  @ApiModelProperty(value = "Unique identifier")


  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public Data5 profile(String profile) {
    this.profile = profile;
    return this;
  }

   /**
   * Description of the dataset.
   * @return profile
  **/
  @ApiModelProperty(value = "Description of the dataset.")


  public String getProfile() {
    return profile;
  }

  public void setProfile(String profile) {
    this.profile = profile;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Data5 data5 = (Data5) o;
    return Objects.equals(this.id, data5.id) &&
        Objects.equals(this.profile, data5.profile);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, profile);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Data5 {\n");
    
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    profile: ").append(toIndentedString(profile)).append("\n");
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

