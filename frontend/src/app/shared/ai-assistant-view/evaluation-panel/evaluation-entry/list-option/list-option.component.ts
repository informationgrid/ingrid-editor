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
import { Component, computed, input } from "@angular/core";
import { MatChip, MatChipSet } from "@angular/material/chips";

@Component({
  selector: "ige-list-option",
  templateUrl: "./list-option.component.html",
  styleUrls: ["./list-option.component.scss"],
  imports: [MatChipSet, MatChip],
})
export class ListOptionComponent {
  option = input.required<any[]>();

  values = computed(() => {
    return this.option().map((entry) => {
      if (typeof entry === "string") return entry;
      return entry.value ?? entry.label;
    });
  });
}
