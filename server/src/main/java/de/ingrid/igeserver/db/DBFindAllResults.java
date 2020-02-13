package de.ingrid.igeserver.db;

import java.util.List;

public class DBFindAllResults {
    public long totalHits;
    public List<String> hits;

    public DBFindAllResults(long totalHits, List<String> hits) {
        this.totalHits = totalHits;
        this.hits = hits;
    }
}
