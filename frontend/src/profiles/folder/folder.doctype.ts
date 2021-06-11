import { BaseDoctype } from "../base.doctype";
import { Injectable } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Injectable({
  providedIn: "root",
})
export class FolderDoctype extends BaseDoctype {
  id = "FOLDER";

  label = "Ordner";

  iconClass = "Ordner";

  // no extra fields
  documentFields = () => <FormlyFieldConfig[]>[];
}
