package de.ingrid.igeserver.exports.iso19115;

public class Keyword {
    private String name;

    private String link;

    public Keyword(String name, String link) {
        this.name = name;
        this.link = link;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}
