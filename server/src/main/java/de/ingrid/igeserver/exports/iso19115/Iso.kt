package de.ingrid.igeserver.exports.iso19115;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Iso {
    public String uuid;
    public String parentIdentifier;
    public String title;
    public String alternateTitle;
    public String description;
    public String hierarchyLevel;
    public Date modified;
    public List<UseConstraint> useLimitations = new ArrayList<>();
    public List<UseConstraint> accessConstraints = new ArrayList<>();
    public List<UseConstraint> useConstraints = new ArrayList<>();
    public List<Thesaurus> thesauruses = new ArrayList<>();
}
