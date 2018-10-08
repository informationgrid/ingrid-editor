package de.ingrid.igeserver.model;


import java.util.List;
import java.util.Set;

public class UserInfo {
    public String userId;
    public String name;

    public List<Catalog> assignedCatalogs;
    public Set<String> roles;
}
