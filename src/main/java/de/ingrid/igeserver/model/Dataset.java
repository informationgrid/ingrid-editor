package de.ingrid.igeserver.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * Dataset
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

public class Dataset   {
  @JsonProperty("_id")
  private String id = null;

  @JsonProperty("_profile")
  private String profile = null;

  @JsonProperty("_created")
  private String created = null;

  @JsonProperty("_modified")
  private String modified = null;

  @JsonProperty("_published")
  private String published = null;

  public Dataset id(String id) {
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

  public Dataset profile(String profile) {
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

  public Dataset created(String created) {
    this.created = created;
    return this;
  }

   /**
   * The date the dataset was created.
   * @return created
  **/
  @ApiModelProperty(required = true, value = "The date the dataset was created.")
  @NotNull


  public String getCreated() {
    return created;
  }

  public void setCreated(String created) {
    this.created = created;
  }

  public Dataset modified(String modified) {
    this.modified = modified;
    return this;
  }

   /**
   * The date the dataset was last modified.
   * @return modified
  **/
  @ApiModelProperty(value = "The date the dataset was last modified.")


  public String getModified() {
    return modified;
  }

  public void setModified(String modified) {
    this.modified = modified;
  }

  public Dataset published(String published) {
    this.published = published;
    return this;
  }

   /**
   * The date the dataset was last published.
   * @return published
  **/
  @ApiModelProperty(value = "The date the dataset was last published.")


  public String getPublished() {
    return published;
  }

  public void setPublished(String published) {
    this.published = published;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Dataset dataset = (Dataset) o;
    return Objects.equals(this.id, dataset.id) &&
        Objects.equals(this.profile, dataset.profile) &&
        Objects.equals(this.created, dataset.created) &&
        Objects.equals(this.modified, dataset.modified) &&
        Objects.equals(this.published, dataset.published);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, profile, created, modified, published);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Dataset {\n");
    
    sb.append("    id: ").append(toIndentedString(id)).append("\n");
    sb.append("    profile: ").append(toIndentedString(profile)).append("\n");
    sb.append("    created: ").append(toIndentedString(created)).append("\n");
    sb.append("    modified: ").append(toIndentedString(modified)).append("\n");
    sb.append("    published: ").append(toIndentedString(published)).append("\n");
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

