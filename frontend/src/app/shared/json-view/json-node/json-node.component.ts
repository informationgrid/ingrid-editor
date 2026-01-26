/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
import { Component, computed, input, signal } from "@angular/core";
import { KeyValuePipe, NgClass } from "@angular/common";

@Component({
  selector: "ige-json-node",
  imports: [KeyValuePipe, NgClass],
  templateUrl: "./json-node.component.html",
  styleUrl: "./json-node.component.scss",
})
export class JsonNodeComponent {
  key = input<string | null>(null);
  value = input.required<any>();

  isExpanded = signal(true);

  isObject = computed(() => {
    const val = this.value();
    return val !== null && typeof val === "object";
  });

  isArray = computed(() => Array.isArray(this.value()));

  valueType = computed(() => typeof this.value());

  toggle() {
    this.isExpanded.update((v) => !v);
  }
}
