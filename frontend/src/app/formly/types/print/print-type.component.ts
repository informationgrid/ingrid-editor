import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material/form-field";
import { SelectOptionUi } from "../../../services/codelist/codelist.service";

@Component({
  selector: "ige-print-type",
  templateUrl: "./print-type.component.html",
  styleUrls: ["./print-type.component.scss"],
})
export class PrintTypeComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {}

  getFromOption(value: any) {
    const options = this.to.options as any[];
    return options.find((option) => option.value === value.key).label;
  }
}