import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "ige-action-button",
  templateUrl: "./action-button.component.html",
  styleUrls: ["./action-button.component.scss"],
})
export class ActionButtonComponent implements OnInit {
  @Input() label: string;
  @Input() disabled: boolean;
  @Input() icon: string;
  @Input() svgIcon: string;
  @Output() submit = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}
}
