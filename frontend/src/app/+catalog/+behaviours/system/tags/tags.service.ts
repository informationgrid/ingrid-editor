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
import { inject, Injectable } from "@angular/core";
import { DocumentService } from "../../../../services/document/document.service";
import { DocumentAbstract } from "../../../../store/document/document.model";

@Injectable({ providedIn: "root" })
export class TagsService {
  private documentService = inject(DocumentService);

  private additionalTags: string[] = [];

  updateTagForDocument(
    doc: DocumentAbstract,
    newTag: string,
    forAddress = false,
  ) {
    this.updatePublicationType(doc.id as number, newTag, forAddress).subscribe(
      () => {
        this.documentService.reload$.next({
          uuid: doc._uuid,
          forAddress: forAddress,
        });
      },
    );
  }

  addAdditionalTags(tags: string[]) {
    this.additionalTags.push(...tags);
  }

  /*
   * We handle the "internet"-type as null-value, which is the default value and to be consistent
   */
  private updatePublicationType(
    id: number,
    newTag: string,
    forAddress: boolean,
  ) {
    const values = ["intranet", "amtsintern", ...this.additionalTags];
    let tagToAdd = [newTag];
    if (newTag === "internet") {
      tagToAdd = [];
    }

    return this.documentService.updateTags(
      id,
      {
        add: tagToAdd,
        remove: values.filter((item) => item !== newTag),
      },
      forAddress,
    );
  }
}
