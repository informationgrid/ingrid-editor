import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material/form-field";
import { SelectOptionUi } from "../../../services/codelist/codelist.service";
import { FieldTypeConfig } from "@ngx-formly/core";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "ige-print-type",
  templateUrl: "./print-type.component.html",
  styleUrls: ["./print-type.component.scss"],
})
export class PrintTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  constructor() {
    super();
  }

  ngOnInit(): void {}

  getFromOption(value: any): string {
    if (value === null) return "";
    const options = Array.isArray(this.props.options)
      ? this.props.options
      : (this.props.options as BehaviorSubject<any[]>).value;
    return options?.find((option) => option.value === value.key)?.label ?? "";
  }

  replaceNewLines(value: any) {
    return typeof value?.replace === "function"
      ? value?.replace(/\n/g, "<br>")
      : "";
  }
}
