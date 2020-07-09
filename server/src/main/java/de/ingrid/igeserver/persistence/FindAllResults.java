package de.ingrid.igeserver.persistence;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

public class FindAllResults {
    public long totalHits;
    public List<JsonNode> hits;

    public FindAllResults(long totalHits, List<JsonNode> hits) {
        this.totalHits = totalHits;
        this.hits = hits;
    }
}
