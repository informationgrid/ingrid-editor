import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
@Component({
  selector: "ige-dialog-template",
  templateUrl: "./dialog-template.component.html",
  styleUrls: ["./dialog-template.component.scss"],
})
export class DialogTemplateComponent implements OnInit {
  @ViewChild("contextTemplateContainer") container: ElementRef;
  @Input() title: string;
  @Input() disabled = false;
  @Input() contentColor = "#ffffff";
  @Output() submit = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
