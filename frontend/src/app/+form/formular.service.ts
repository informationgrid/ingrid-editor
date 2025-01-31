/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { inject, Injectable, Signal } from "@angular/core";
import { DocumentAbstract } from "../store/document/document.model";
import { Doctype } from "../services/formular/doctype";
import { ProfileService } from "../services/profile.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { BehaviorSubject, of } from "rxjs";
import { filter, map, mergeMap, toArray } from "rxjs/operators";
import { GeneralStore } from "../store/general.store";
import { UiStore } from "../store/ui.store";

@Injectable({
  providedIn: "root",
})
export class FormularService {
  private generalStore = inject(GeneralStore);
  private uiStore = inject(UiStore);

  data = {};

  currentProfile: string;

  private profileDefinitions: Signal<Doctype[]> = this.profiles.getProfiles();

  sections$ = new BehaviorSubject<string[]>([]);
  private profileSections: string[] = [];

  constructor(private profiles: ProfileService) {}

  getFields(profile: string): FormlyFieldConfig[] {
    let fields: FormlyFieldConfig[];

    const nextProfile = this.getProfile(profile);

    if (nextProfile) {
      fields = nextProfile.getFields().slice(0);

      this.currentProfile = profile;

      // return a copy of our fields (immutable data!)
      return fields; // .sort((a, b) => a.order - b.order);
    } else {
      throw new Error("Document type not found: " + profile);
    }
  }

  private getProfile(id: string): Doctype {
    if (this.profileDefinitions()) {
      const profile = this.profileDefinitions().find((p) => p.id === id);
      if (!profile) {
        // throw Error('Unknown profile: ' + id);
        console.error("Unknown profile: " + id);
        return null;
      }
      return profile;
    } else {
      return null;
    }
  }

  setSelectedDocuments(docs: DocumentAbstract[], isAddress: boolean) {
    this.generalStore.setActiveTreeNodes(
      docs.map((d) => d.id as number),
      isAddress,
    );
  }

  updateSidebarWidth(size: number) {
    this.uiStore.setSidebarWidth(size);
  }

  getSectionsFromProfile(profile: FormlyFieldConfig[]): void {
    const getSectionItem = (item: FormlyFieldConfig) => {
      return item?.wrappers?.indexOf("section") >= 0
        ? [item]
        : (item.fieldGroup ?? []);
    };

    of(profile)
      .pipe(
        mergeMap((items) => items),
        mergeMap((item) => getSectionItem(item)),
        filter((item) => item?.wrappers?.indexOf("section") >= 0),
        map((item) =>
          item.className === "hide" ? "_" + item.props.label : item.props.label,
        ),
        toArray(),
      )
      .subscribe((sections) => {
        this.profileSections = sections;
        this.sections$.next(sections);
      });
  }

  setAdditionalSections(sections: string[]) {
    // prevent ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() =>
      this.sections$.next([...this.profileSections, ...sections]),
    );
  }
}
