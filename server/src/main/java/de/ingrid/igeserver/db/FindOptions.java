package de.ingrid.igeserver.db;

public class FindOptions {
    public QueryType queryType;
    public String queryOperator;
    public Integer size;
    public String sortField;
    public String sortOrder;
    public boolean resolveReferences;

    public FindOptions() {
        this.queryOperator = "OR";
    }
}
