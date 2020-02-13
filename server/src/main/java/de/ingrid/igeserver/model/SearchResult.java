package de.ingrid.igeserver.model;

import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.List;

public class SearchResult {
    public List<ObjectNode> hits;
    public long totalHits;
    public int page;
    public int size;
}
