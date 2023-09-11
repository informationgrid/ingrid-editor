import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { MatError } from "@angular/material/form-field";

@Component({
  selector: "ige-add-button",
  templateUrl: "./add-button.component.html",
  styleUrls: ["./add-button.component.scss"],
})
export class AddButtonComponent implements OnInit {
  @Input() buttonType: "stroked" | "flat" | "menu" = "stroked";
  @Input() showRequiredError = false;
  @Input() showTitle = true;
  @Input() buttonTitle = "Hinzufügen";

  @Input() set options(value: any[]) {
    if (value) this._options = value;
  }

  // accessibility
  @Input() ariaLabel: string;
  @ViewChild("matError") matError: ElementRef;

  @Output() add = new EventEmitter();

  _options: { key; value }[] = [];

  constructor() {}

  ngOnInit(): void {}
}
