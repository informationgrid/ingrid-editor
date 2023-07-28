import { Plugin2 } from "../../../app/+catalog/+behaviours/plugin2";

export class PublishNegativeAssessmentBehaviour extends Plugin2 {
  id = "plugin.publish.negative.assessment";
  name = "'Negative Vorprüfungen' veröffentlichen";
  description =
    "Es werden zusätzliche Formularfelder angezeigt, die für die vollständige Erfassung einer negativen Vorprüfung " +
    "benötigt werden. Die negativen Vorprüfungen werden nur im Portal angezeigt, wenn diese Option ausgewählt ist. " +
    "Bitte nach Änderung der Option die Seite neu laden.";
  defaultActive = false;
  group = "UVP";

  constructor() {
    super();

    this.fields.push({
      key: "onlyWithSpatial",
      type: "toggle",
      props: {
        label: "Nur mit Raumbezügen",
      },
    });
  }
}
