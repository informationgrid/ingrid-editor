/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { UntypedFormGroup } from "@angular/forms";
import { ProfileAbstract } from "../../../../store/profile/profile.model";
import { filter, map, take, tap } from "rxjs/operators";
import { ProfileQuery } from "../../../../store/profile/profile.query";
import { ProfileService } from "../../../../services/profile.service";

@Component({
  selector: "ige-document-template",
  templateUrl: "./document-template.component.html",
  styleUrls: ["./document-template.component.scss"],
})
export class DocumentTemplateComponent implements OnInit {
  @Input() form: UntypedFormGroup;
  @Input() isFolder = true;

  @Output() create = new EventEmitter<void>();
  documentTypes: DocumentAbstract[];
  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(
    null,
  );

  constructor(
    private profileQuery: ProfileQuery,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    if (this.isFolder) {
      this.setDocType({ id: "FOLDER" } as DocumentAbstract);
    } else {
      this.initializeDocumentTypes(this.profileQuery.documentProfiles);
    }
  }

  private initializeDocumentTypes(profiles: Observable<ProfileAbstract[]>) {
    profiles
      .pipe(
        filter((types) => types.length > 0),
        map((types) => this.prepareDocumentTypes(types)),
        tap((types) => {
          const initialType =
            types.find(
              (t) => t.id == this.profileService.getDefaultDataDoctype()?.id,
            ) || types[0];
          this.setDocType(initialType);
          this.initialActiveDocumentType.next(initialType);
        }),
        take(1),
      )
      .subscribe((result) => {
        this.documentTypes = result;
      });
  }

  private prepareDocumentTypes(result: ProfileAbstract[]): DocumentAbstract[] {
    return result
      .map((profile) => {
        return {
          id: profile.id,
          title: profile.label,
          icon: profile.iconClass,
          _type: profile.id,
          _state: "P",
        } as DocumentAbstract;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  setDocType(docType: DocumentAbstract) {
    this.form.get("choice").setValue(docType.id);
  }
}
