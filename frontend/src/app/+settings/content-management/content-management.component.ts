/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { Component, inject, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { ConfigService } from "../../services/config/config.service";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "ige-content-management",
  templateUrl: "./content-management.component.html",
  styleUrls: ["./content-management.component.scss"],
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    PageTemplateModule,
    MatButtonModule,
  ],
  standalone: true,
})
export class ContentManagementComponent implements OnInit {
  configService = inject(ConfigService);
  snackBar = inject(MatSnackBar);

  accessibility = new FormControl<string>("");

  ngOnInit(): void {
    this.configService.getCMSPages().subscribe((pages) => {
      const accessibility = pages.find(
        (item) => item.pageId === "accessibility",
      );
      this.accessibility.setValue(accessibility?.content ?? "");
    });
  }

  save() {
    this.configService
      .updateCMSPage([
        { pageId: "accessibility", content: this.accessibility.value },
      ])
      .subscribe(() => this.snackBar.open("Die Änderung wurde gespeichert"));
  }
}
