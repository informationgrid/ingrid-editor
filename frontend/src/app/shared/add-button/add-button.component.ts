import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "ige-add-button",
  templateUrl: "./add-button.component.html",
  styleUrls: ["./add-button.component.scss"],
})
export class AddButtonComponent implements OnInit {
  @Input() buttonType: "stroked" | "flat" = "stroked";
  @Input() showRequiredError = false;
  @Input() showLabel = true;
  @Output() add = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
