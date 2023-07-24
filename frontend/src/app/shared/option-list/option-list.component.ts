import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatRadioModule } from "@angular/material/radio";
import { NgForOf, NgIf } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { FormsModule } from "@angular/forms";

export interface Option {
  label: string;
  value: string;
}

@Component({
  selector: "ige-option-list",
  templateUrl: "./option-list.component.html",
  styleUrls: ["./option-list.component.scss"],
  standalone: true,
  imports: [MatRadioModule, NgIf, NgForOf, MatDividerModule, FormsModule],
})
export class OptionListComponent implements OnInit {
  @Input() options: Option[];
  @Output() select = new EventEmitter<string>();

  selected: string;

  constructor() {}

  ngOnInit(): void {}

  onSelect(selected: string) {
    this.selected = selected;
    this.select.emit(selected);
  }
}
