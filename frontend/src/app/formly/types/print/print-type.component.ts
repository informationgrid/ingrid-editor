import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material/form-field";
import { FieldTypeConfig } from "@ngx-formly/core";
import { BehaviorSubject } from "rxjs";
import { isObject } from "../../../shared/utils";

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
      : (this.props.options as BehaviorSubject<any[]>)?.value;

    if (options != undefined) {
      return options.find((option) => option.value === value.key)?.label ?? "";
    } else if (isObject(value)) {
      return value.value ?? value.label ?? "";
    } else {
      return "";
    }
  }

  getValueByDefault(value: any) {
    if (typeof value?.replace === "function") {
      return value.replace(/\n/g, "<br>");
    }

    const unit = this.props?.addonRight?.text;
    if (value && unit) return `${value} ${unit}`;

    return value ?? "";
  }
}
