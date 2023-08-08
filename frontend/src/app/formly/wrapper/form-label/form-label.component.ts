import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "ige-form-label",
  templateUrl: "./form-label.component.html",
  styleUrls: ["./form-label.component.scss"],
  imports: [NgIf, MatIconModule],
  standalone: true,
})
export class FormLabelComponent {
  @Input() hasContextHelp = false;
  @Input() ariaLabel: string;

  @Output() contextHelp = new EventEmitter<HTMLElement>();

  showContextHelp(evt: MouseEvent) {
    if (!this.hasContextHelp) {
      return;
    }

    const target = new ElementRef(evt.currentTarget);
    const infoElement = target.nativeElement as HTMLElement;
    this.contextHelp.emit(infoElement);
  }
}
