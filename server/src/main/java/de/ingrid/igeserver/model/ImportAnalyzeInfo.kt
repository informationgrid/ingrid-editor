package de.ingrid.igeserver.model;

import com.fasterxml.jackson.databind.JsonNode;

public class ImportAnalyzeInfo {
    private String importType;

    private int numDocuments;

    private JsonNode result;

    public String getImportType() {
        return importType;
    }

    public void setImportType(String importType) {
        this.importType = importType;
    }

    public int getNumDocuments() {
        return numDocuments;
    }

    public void setNumDocuments(int numDocuments) {
        this.numDocuments = numDocuments;
    }

    public JsonNode getResult() {
        return result;
    }

    public void setResult(JsonNode result) {
        this.result = result;
    }
}
