import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "ige-dialog-template",
  templateUrl: "./dialog-template.component.html",
  styleUrls: ["./dialog-template.component.scss"],
})
export class DialogTemplateComponent implements OnInit {
  @Input() label: string;
  @Input() submitLabel = "Übernehmen";
  @Input() disabled = false;
  @Input() contentColor = "#ffffff";
  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}
}
