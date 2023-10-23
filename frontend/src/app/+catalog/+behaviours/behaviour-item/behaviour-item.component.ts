import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { delay, filter } from "rxjs/operators";

@UntilDestroy()
@Component({
  selector: "ige-behaviour-item",
  templateUrl: "./behaviour-item.component.html",
  styleUrls: ["./behaviour-item.component.scss"],
})
export class BehaviourItemComponent implements OnInit {
  @Input() title: string;
  @Input() description: string;
  @Input() control: any;

  @Output() update = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {
    const form = <UntypedFormGroup>this.control.form;
    form.valueChanges
      .pipe(
        untilDestroyed(this),
        delay(0), // add tiny delay to get updated form state
        filter(() => form.dirty && form.valid),
      )
      .subscribe(() => this.update.next());
  }

  updateFieldState(checked: boolean) {
    const form = this.control.form;
    checked ? form.enable() : form.disable();
    this.update.next();
  }
}
