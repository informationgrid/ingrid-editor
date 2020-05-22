package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;

import java.util.Arrays;

/**
 * Classes that implement this interface have to check that the class that
 * they are responsible for is created and has the necessary properties set.
 * Most important properties are those, which contain references to other
 * DocumentTypes.
 */
public abstract class DocumentType {

    private final String typeName;

    protected String[] forProfiles;

    public DocumentType(String typeName, String[] forProfiles) {
        this.typeName = typeName;
        this.forProfiles = forProfiles;
    }

    /**
     * Initialize a database session with this DocumentType.
     * @param session is the database session for access
     */
    abstract public void initialize(ODatabaseSession session);

    public String getTypeName() {
        return typeName;
    }

    public boolean usedInProfile(String profileId) {
        return forProfiles.length == 0 || Arrays.asList(forProfiles).contains(profileId);
    }

}
