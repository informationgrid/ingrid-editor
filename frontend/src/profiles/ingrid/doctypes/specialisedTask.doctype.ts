import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { IngridShared } from "./ingrid-shared";

@Injectable({
  providedIn: "root",
})
export class SpecialisedTaskDoctype extends IngridShared {
  id = "InGridSpecialisedTask";

  label = "Fachaufgabe";

  iconClass = "Fachaufgabe";

  hasOptionalFields = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection(),
      this.addKeywordsSection(),
      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({ extraInfoLangData: true }),
      this.addLinksSection(),
    ];
}
