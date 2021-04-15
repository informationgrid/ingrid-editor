package de.ingrid.igeserver.model;

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document;

public class ImportAnalyzeInfo {
    private String importType;

    private int numDocuments;

    private Document result;

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

    public Document getResult() {
        return result;
    }

    public void setResult(Document result) {
        this.result = result;
    }
}
