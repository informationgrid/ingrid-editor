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
import { Component, input, signal } from "@angular/core";
import { JsonNodeComponent } from "./json-node/json-node.component";
import { JsonPipe } from "@angular/common";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "ige-json-view",
  imports: [JsonNodeComponent, JsonPipe, MatButton],
  templateUrl: "./json-view.component.html",
  styleUrl: "./json-view.component.scss",
})
export class JsonViewComponent {
  data = input.required<any>();

  isTreeView = signal(true);

  toggleView() {
    this.isTreeView.update((v) => !v);
  }
}
