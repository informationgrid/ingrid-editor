package de.ingrid.igeserver.model;

import java.util.Objects;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import de.ingrid.igeserver.annotations.PublishedLink;
import io.swagger.annotations.ApiModelProperty;

/**
 * Data
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@JsonIgnoreProperties(ignoreUnknown = true)
public class DocUVP {

    @JsonProperty("_id")
    @NotNull
    private String id = null;

    @JsonProperty("_profile")
    @NotNull
    private String profile = null;

    @PublishedLink(value = "ADDRESS")
    public String authorRefs;
    
    @NotNull
    public String taskId;
    
    @NotNull
    public String title;

    public DocUVP id(String id) {
        this.id = id;
        return this;
    }

    /**
     * Unique identifier
     * 
     * @return id
     **/
    @ApiModelProperty(value = "Unique identifier")
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public DocUVP profile(String profile) {
        this.profile = profile;
        return this;
    }

    /**
     * Description of the dataset.
     * 
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
        DocUVP data = (DocUVP) o;
        return Objects.equals( this.id, data.id ) &&
                Objects.equals( this.profile, data.profile );
    }

    @Override
    public int hashCode() {
        return Objects.hash( id, profile );
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append( "class Data {\n" );

        sb.append( "    id: " ).append( toIndentedString( id ) ).append( "\n" );
        sb.append( "    profile: " ).append( toIndentedString( profile ) ).append( "\n" );
        sb.append( "}" );
        return sb.toString();
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces (except the first line).
     */
    private String toIndentedString(java.lang.Object o) {
        if (o == null) {
            return "null";
        }
        return o.toString().replace( "\n", "\n    " );
    }
}
