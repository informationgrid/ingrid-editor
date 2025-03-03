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
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { DocumentService } from "../../../../app/services/document/document.service";
import { CodelistStore } from "../../../../app/store/codelist/codelist.store";
import { NgClass } from "@angular/common";

interface DataOriginItem {
  _type: "internalDataOrigin" | "freeDescription";
  value: any;
  date: any;
  dateType: any;
  uuidRef: any;
  title: string;
  identifier: string;
}

@Component({
  selector: "ige-data-origin-view",
  standalone: true,
  templateUrl: "./data-origin-view.component.html",
  styleUrl: "./data-origin-view.component.scss",
  imports: [NgClass],
})
export class DataOriginViewComponent {
  item = input<DataOriginItem>();

  private documentService = inject(DocumentService);
  private codelistStore = inject(CodelistStore);

  private router = inject(Router);
  type = computed<string>(() => {
    return this.item()._type === "internalDataOrigin"
      ? "Geodatensatz"
      : "Freie Beschreibung";
  });
  title = signal<string>("");
  resourceIdentifier = signal<string>(null);
  date = computed<string>(() => {
    let value: string = this.item().date
      ? new Date(this.item().date).toLocaleDateString("de-DE")
      : "";

    const codelistKey = this.item().dateType?.key ?? null;
    if (codelistKey != null) {
      const codelistValue = this.codelistStore.getCodelistEntryValueByKey(
        "502",
        codelistKey,
      );
      return `${value} - ${codelistValue}`;
    }
    return value;
  });
  description = computed<string>(() => this.item().value);
  state = signal<string>("");

  constructor() {
    effect(() => {
      if (this.item()._type == "internalDataOrigin") {
        return this.documentService
          .load(this.item().uuidRef, false, false, true)
          .subscribe((doc) => {
            this.title.set(doc.document.title);
            this.resourceIdentifier.set(doc.document.identifier);
            this.state.set(doc.metadata.state);
          });
      } else {
        this.title.set(this.item().title);
        this.resourceIdentifier.set(this.item().identifier);
      }
    });
  }
}
