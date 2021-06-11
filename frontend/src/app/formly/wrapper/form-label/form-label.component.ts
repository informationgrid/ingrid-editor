import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { ContextHelpService } from "../../../services/context-help/context-help.service";

@Component({
  selector: "ige-form-label",
  templateUrl: "./form-label.component.html",
  styleUrls: ["./form-label.component.scss"],
})
export class FormLabelComponent implements OnInit {
  @Input() hasContextHelp = false;

  @Output() contextHelp = new EventEmitter<HTMLElement>();

  constructor(public contextHelpService: ContextHelpService) {}

  ngOnInit(): void {}

  showContextHelp(evt: MouseEvent) {
    if (!this.hasContextHelp) {
      return;
    }

    const target = new ElementRef(evt.currentTarget);
    const infoElement = target.nativeElement as HTMLElement;
    this.contextHelp.next(infoElement);
  }
}
