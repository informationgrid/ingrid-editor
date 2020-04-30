package de.ingrid.igeserver.model;

import java.util.Objects;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * InlineResponse200
 */
public class InlineResponse200   {
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

  public InlineResponse200 id(String id) {
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

  public InlineResponse200 profile(String profile) {
    this.profile = profile;
    return this;
  }

   /**
   * Description of the dataset.
   * @return profile
  **/


  public String getProfile() {
    return profile;
  }

  public void setProfile(String profile) {
    this.profile = profile;
  }

  public InlineResponse200 created(String created) {
    this.created = created;
    return this;
  }

   /**
   * The date the dataset was created.
   * @return created
  **/
  @NotNull


  public String getCreated() {
    return created;
  }

  public void setCreated(String created) {
    this.created = created;
  }

  public InlineResponse200 modified(String modified) {
    this.modified = modified;
    return this;
  }

   /**
   * The date the dataset was last modified.
   * @return modified
  **/


  public String getModified() {
    return modified;
  }

  public void setModified(String modified) {
    this.modified = modified;
  }

  public InlineResponse200 published(String published) {
    this.published = published;
    return this;
  }

   /**
   * The date the dataset was last published.
   * @return published
  **/


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
    InlineResponse200 inlineResponse200 = (InlineResponse200) o;
    return Objects.equals(this.id, inlineResponse200.id) &&
        Objects.equals(this.profile, inlineResponse200.profile) &&
        Objects.equals(this.created, inlineResponse200.created) &&
        Objects.equals(this.modified, inlineResponse200.modified) &&
        Objects.equals(this.published, inlineResponse200.published);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, profile, created, modified, published);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class InlineResponse200 {\n");
    
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

