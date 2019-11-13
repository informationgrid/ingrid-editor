package de.ingrid.igeserver.exports.iso19115;

import java.util.List;

public class Thesaurus {

    public String name;

    public String date;

    public List<Keyword> keywords;

    public Thesaurus(String name, String date, List<Keyword> keywords) {
        this.name = name;
        this.date = date;
        this.keywords = keywords;
    }

}
