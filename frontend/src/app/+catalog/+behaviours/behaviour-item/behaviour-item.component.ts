import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter } from "rxjs/operators";

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
    const form = <FormGroup>this.control.form;
    form.valueChanges
      .pipe(
        untilDestroyed(this),
        filter(() => form.dirty && form.valid)
      )
      .subscribe(() => this.update.next());
  }

  updateFieldState(checked: boolean) {
    const form = this.control.form;
    checked ? form.enable() : form.disable();
    this.update.next();
  }
}
