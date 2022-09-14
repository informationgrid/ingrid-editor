import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material/form-field";

@Component({
  selector: "ige-textarea-print",
  templateUrl: "./textarea-print.component.html",
  styleUrls: ["./textarea-print.component.scss"],
})
export class TextareaPrintComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {}
}
