import { inject, Injectable } from "@angular/core";
import { DocumentService } from "../../../../services/document/document.service";
import { DocumentAbstract } from "../../../../store/document/document.model";

@Injectable({ providedIn: "root" })
export class TagsService {
  private documentService = inject(DocumentService);

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

  /*
   * We handle the "internet"-type as null-value, which is the default value and to be consistent
   */
  private updatePublicationType(
    id: number,
    newTag: string,
    forAddress: boolean,
  ) {
    const values = ["intranet", "amtsintern"];
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
