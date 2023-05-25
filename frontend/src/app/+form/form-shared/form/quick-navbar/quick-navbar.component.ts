import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { IgeDocument } from "../../../../models/ige-document";

@UntilDestroy()
@Component({
  selector: "ige-quick-navbar",
  templateUrl: "./quick-navbar.component.html",
  styleUrls: ["./quick-navbar.component.scss"],
})
export class QuickNavbarComponent {
  @Input() sections: string[] = [];
  @Input() hasOptionalFields = false;

  @Input() numberOfErrors: number = 0;
  @Input() optionalButtonState: boolean = true;

  @Input() model: IgeDocument;

  @Output() toggleOptionalFields = new EventEmitter<boolean>();
}
