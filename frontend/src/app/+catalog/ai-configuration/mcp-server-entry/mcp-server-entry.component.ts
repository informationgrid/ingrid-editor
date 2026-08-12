/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
import { Component, input } from "@angular/core";
import { MatDivider } from "@angular/material/list";

interface McpItem {
  name: string;
  url: string;
  apiKey?: any;
  customHeaders: any;
}

@Component({
  selector: "ige-mcp-server-entry",
  imports: [MatDivider],
  templateUrl: "./mcp-server-entry.component.html",
  styleUrl: "./mcp-server-entry.component.scss",
})
export class McpServerEntryComponent {
  item = input<McpItem>();
}
