/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
import { Component, computed, inject, input } from "@angular/core";
import { CodelistPipe } from "../../../../app/directives/codelist.pipe";
import { AsyncPipe } from "@angular/common";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Router } from "@angular/router";

interface ReferenceItem {
  type: any;
  title: string;
  referenceType: any;
  explanation: string;
}

interface ReferenceItemUrl extends ReferenceItem {
  url: string;
  urlDataType: any;
}

interface ReferenceItemInternal extends ReferenceItem {
  uuidRef: string;
}

@Component({
    selector: "ige-reference-view",
    imports: [CodelistPipe, AsyncPipe],
    templateUrl: "./reference-view.component.html",
    styleUrl: "./reference-view.component.scss"
})
export class ReferenceViewComponent {
  item = input<ReferenceItemUrl | ReferenceItemInternal>();

  private router = inject(Router);

  urlItem = computed<ReferenceItemUrl>(() => {
    if (this.item().referenceType !== "url") return null;
    return this.item() as ReferenceItemUrl;
  });

  internalItem = computed<ReferenceItemInternal>(() => {
    if (this.item().referenceType === "url") return null;
    return this.item() as ReferenceItemInternal;
  });

  async navigate(item: ReferenceItemInternal) {
    return this.router.navigate([
      `${ConfigService.catalogId}/form`,
      { id: item.uuidRef },
    ]);
  }
}
