package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;

/**
 * Classes that implement this interface have to check that the class that
 * they are responsible for is created and has the necessary properties set.
 * Most important properties are those, which contain references to other
 * DocumentTypes.
 */
public interface DocumentType {

    void initialize(ODatabaseSession session);

}
