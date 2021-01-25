package de.ingrid.igeserver.model;

import java.util.List;

public class SearchResult<T> {
    public List<T> hits;
    public long totalHits;
    public int page;
    public int size;
}
