import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "ige-add-button",
  templateUrl: "./add-button.component.html",
  styleUrls: ["./add-button.component.scss"],
})
export class AddButtonComponent implements OnInit {
  @Input() buttonType: "stroked" | "flat" | "menu" = "stroked";
  @Input() showRequiredError = false;
  @Input() showLabel = true;
  @Input() buttonTitle = "Hinzufügen";
  @Input() set options(value: any[]) {
    if (value) this._options = value;
  }

  @Output() add = new EventEmitter();

  _options: { key; value }[] = [];

  constructor() {}

  ngOnInit(): void {}
}
