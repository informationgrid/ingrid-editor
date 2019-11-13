package de.ingrid.igeserver.exports.iso19115;

import java.util.List;

public class UseConstraint {
    private String name;
    private String data;
    private List<String> otherConstraints;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public List<String> getOtherConstraints() {
        return otherConstraints;
    }

    public void setOtherConstraints(List<String> otherConstraints) {
        this.otherConstraints = otherConstraints;
    }
}
