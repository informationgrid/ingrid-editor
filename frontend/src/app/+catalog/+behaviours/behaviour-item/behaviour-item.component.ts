/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
