import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormFieldHelper } from "../../form-field-helper";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CommonFieldsBast extends FormFieldHelper {
  getFields(): FormlyFieldConfig[] {
    return [
      this.getProjectNumberFieldConfig(),
      this.getProjectTitleFieldConfig(),
      this.getCommentsFieldConfig(),
    ];
  }

  getUseConstraintsCommentsFieldConfig(): FormlyFieldConfig {
    return this.addTextArea(
      "useConstraintsComments",
      "Nutzungshinweise",
      "ingrid",
    );
  }

  private getProjectNumberFieldConfig(): FormlyFieldConfig {
    return this.addInput("projectNumber", "Projektnummer", {
      wrappers: ["panel", "form-field"],
    });
  }

  private getProjectTitleFieldConfig(): FormlyFieldConfig {
    return this.addInput("projectTitle", "Projekttitel", {
      wrappers: ["panel", "form-field"],
    });
  }

  private getCommentsFieldConfig(): FormlyFieldConfig {
    return this.addTextArea("supplementalInformation", "Bemerkungen", {
      wrappers: ["panel", "form-field"],
    });
  }
}
