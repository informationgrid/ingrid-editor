import { Injectable } from "@angular/core";
import { Plugin } from "../../plugin";
import { UntilDestroy } from "@ngneat/until-destroy";

@UntilDestroy()
@Injectable()
export class IndexingTagsPlugin extends Plugin {
  id = "plugin.indexing-tags";
  name = "Indizierung mit Veröffentlichungsrecht";
  description =
    "Hier können die Eigenschaften gewählt werden, welche Datensätze indiziert werden sollen. Standardmäßig sind die Datensätze für 'Internet' markiert. Sollen zusätzlich auch anderen Datensätze wie 'Intranet' und 'amtsintern' indiziert werden, so müssen diese hier ausgewählt werden.";
  defaultActive = false;
  hide = false;

  constructor() {
    super();

    this.fields.push({
      key: "template",
      type: "select",
      defaultValue: "internet",
      props: {
        placeholder: "",
        appearance: "outline",
        required: true,
        multiple: true,
        options: [
          { value: "internet", label: "Internet" },
          { value: "intranet", label: "Intranet" },
          { value: "amtsintern", label: "amtsintern" },
        ],
      },
      modelOptions: {
        updateOn: "blur",
      },
    });
  }

  register() {
    super.register();
  }

  unregister() {
    super.unregister();
  }
}
