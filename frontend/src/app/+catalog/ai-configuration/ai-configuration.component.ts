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
import { Component, OnInit, signal } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { aiConfigFields } from "./ai-configuration.fields";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { MatButton } from "@angular/material/button";
import { FormlyFieldConfig, FormlyForm } from "@ngx-formly/core";
import { AiService } from "../../services/ai/ai.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "ige-ai-configuration",
  templateUrl: "./ai-configuration.component.html",
  styleUrls: ["./ai-configuration.component.scss"],
  imports: [PageTemplateComponent, MatButton, FormlyForm, TranslocoDirective],
})
export class AiConfigurationComponent implements OnInit {
  form = new UntypedFormGroup({});
  fields: FormlyFieldConfig[];
  model = signal<any>({});

  constructor(
    private aiService: AiService,
    private snackbar: MatSnackBar,
  ) {
    this.fields = aiConfigFields();
  }

  ngOnInit(): void {
    this.aiService.getSettings().subscribe((value) => {
      if (value) this.model.set(value);
    });
  }

  save() {
    this.aiService.saveSettings(this.form.value).subscribe({
      next: () => {
        this.snackbar.open("KI-Konfiguration wurde gespeichert.");
      },
      error: (error) => {
        this.snackbar.open(
          "Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.",
        );
      },
    });
  }
}
