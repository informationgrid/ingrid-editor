import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "ige-behaviour-item",
  templateUrl: "./behaviour-item.component.html",
  styleUrls: ["./behaviour-item.component.scss"],
})
export class BehaviourItemComponent implements OnInit {
  @Input() title: string;
  @Input() description: string;
  @Input() control: any;

  @Output() change = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  updateFieldState(checked: boolean) {
    const form = this.control.form;
    checked ? form.enable() : form.disable();
    this.change.next();
  }
}
