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
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
} from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { ReactiveFormsModule, UntypedFormGroup } from "@angular/forms";
import { DoctypeAbstract } from "../../../../store/doctype/doctype.model";
import { ProfileService } from "../../../../services/profile.service";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { MatError, MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FocusDirective } from "../../../../directives/focus.directive";
import { DocumentListItemComponent } from "../../../../shared/document-list-item/document-list-item.component";
import { DoctypeStore } from "../../../../store/doctype/doctype.store";

@Component({
  selector: "ige-document-template",
  templateUrl: "./document-template.component.html",
  styleUrls: ["./document-template.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoDirective,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    FocusDirective,
    MatError,
    DocumentListItemComponent,
  ],
})
export class DocumentTemplateComponent implements OnInit {
  form = input.required<UntypedFormGroup>();
  isFolder = input<boolean>(true);

  create = output<void>();

  private translocoService = inject(TranslocoService);
  private doctypeStore = inject(DoctypeStore);
  private profileService = inject(ProfileService);

  documentTypes: DocumentAbstract[];
  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(
    null,
  );

  ngOnInit(): void {
    if (this.isFolder()) {
      this.setDocType({ id: "FOLDER" } as DocumentAbstract);
    } else {
      this.initializeDocumentTypes(this.doctypeStore.dataDoctypes());
    }
  }

  private initializeDocumentTypes(doctypes: DoctypeAbstract[]) {
    const types = this.prepareDocumentTypes(doctypes);
    const defaultDocId = this.profileService.getDefaultDataDoctype()?.id;
    const initialType = types.find((t) => t.id == defaultDocId) || types[0];
    this.setDocType(initialType);
    this.initialActiveDocumentType.next(initialType);
    this.documentTypes = types;
  }

  private prepareDocumentTypes(result: DoctypeAbstract[]): DocumentAbstract[] {
    return result
      .map((doctype) => {
        return {
          id: doctype.id,
          title: this.translocoService.translate(`docType.${doctype.id}`),
          icon: doctype.iconClass,
          _type: doctype.id,
          _state: "P",
        } as DocumentAbstract;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  setDocType(docType: DocumentAbstract) {
    this.form().get("choice").setValue(docType.id);
  }
}
