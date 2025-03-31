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
import { inject, Injectable } from "@angular/core";
import { DocumentService } from "../../../../services/document/document.service";
import { DocumentAbstract } from "../../../../store/document/document.model";

@Injectable({ providedIn: "root" })
export class TagsService {
  private documentService = inject(DocumentService);

  /**
   * @deprecated This method is deprecated and will be removed in future releases.
   */
  updateTagForDocument(
    doc: DocumentAbstract,
    newTag: string,
    forAddress: boolean,
  ) {
    this.addTags(doc.id as number, [newTag], forAddress).subscribe(() => {
      this.documentService.reload$.next({
        uuid: doc._uuid,
        forAddress: forAddress,
      });
    });
  }

  addTags(id: number, newTags: string[], forAddress: boolean) {
    const tagsToRemove = [];

    // handle publication tags
    if (newTags.indexOf("internet") !== -1) {
      newTags = newTags.filter((item) => item !== "internet");
      tagsToRemove.push(...["intranet", "amtsintern"]);
    } else if (newTags.indexOf("intranet") !== -1) {
      tagsToRemove.push("amtsintern");
    } else if (newTags.indexOf("amtsintern") !== -1) {
      tagsToRemove.push("intranet");
    }

    return this.documentService.updateTags(
      id,
      {
        add: newTags,
        remove: tagsToRemove,
      },
      forAddress,
    );
  }

  removeTags(id: number, tagsToRemove: string[], forAddress: boolean) {
    return this.documentService.updateTags(
      id,
      {
        remove: tagsToRemove,
      },
      forAddress,
    );
  }
}
