import { DocumentState } from "../models/ige-document";

export class DocumentUtils {
  static getStateClass(state: DocumentState, type: string) {
    switch (state) {
      case "W":
        return type === "FOLDER" ? "published" : "working";
      case "PW":
        return "workingWithPublished";
      case "P":
        return "published";
      default:
        console.error("State is not supported: " + state);
        return "";
    }
  }

  static getStateName(state: DocumentState) {
    switch (state) {
      case "P":
        return "Veröffentlicht";
      case "W":
        return "In Bearbeitung";
      case "PW":
        return "In Bearbeitung mit Veröffentlichung";
      default:
        throw new Error("State unknown: " + state);
    }
  }
}
