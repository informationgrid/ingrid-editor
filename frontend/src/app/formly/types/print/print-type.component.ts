import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material/form-field";

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
}
