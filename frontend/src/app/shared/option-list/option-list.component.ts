import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "ige-option-list",
  templateUrl: "./option-list.component.html",
  styleUrls: ["./option-list.component.scss"],
})
export class OptionListComponent implements OnInit {
  @Input() options: any[];
  @Input() showDivider = false;
  @Input() dense = false;

  @Output() select = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  onSelect(value: string) {
    this.select.next(value);
  }
}
