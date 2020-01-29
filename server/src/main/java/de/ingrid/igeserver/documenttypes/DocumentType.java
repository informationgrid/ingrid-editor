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

    protected String[] forProfiles;

    /**
     * Initialize a database session with this DocumentType.
     * @param session is the database session for access
     */
    abstract public void initialize(ODatabaseSession session);

    /**
     * Return a list of profile IDs, where this DocumentType should be used.
     */
    abstract String[] activeInProfiles();

    public boolean usedInProfile(String profileId) {
        String[] activeInProfiles = activeInProfiles();
        return activeInProfiles.length == 0 || Arrays.asList(activeInProfiles).contains(profileId);
    }

}
