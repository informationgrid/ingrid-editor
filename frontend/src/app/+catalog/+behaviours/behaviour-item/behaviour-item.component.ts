/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import {
  Component,
  DestroyRef,
  inject,
  Input,
  input,
  OnInit,
  output,
} from "@angular/core";
import { ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import { delay, filter } from "rxjs/operators";
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from "@angular/material/card";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { FormlyForm } from "@ngx-formly/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "ige-behaviour-item",
  templateUrl: "./behaviour-item.component.html",
  styleUrls: ["./behaviour-item.component.scss"],
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatSlideToggle,
    ReactiveFormsModule,
    MatCardContent,
    FormlyForm,
  ],
})
export class BehaviourItemComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  readonly title = input<string>(undefined);
  @Input() description: string;
  @Input() control: any;

  readonly update = output<void>();

  constructor() {}

  ngOnInit(): void {
    const form = <UntypedFormGroup>this.control.form;
    form.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        delay(0), // add tiny delay to get updated form state
        filter(() => form.dirty && form.valid),
      )
      .subscribe(() => this.update.emit());
  }

  updateFieldState(checked: boolean) {
    const form = this.control.form;
    checked ? form.enable() : form.disable();
    this.update.emit();
  }
}
