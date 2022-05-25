import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { FormGroup } from "@angular/forms";
import { ProfileAbstract } from "../../../../store/profile/profile.model";
import { filter, map, take, tap } from "rxjs/operators";
import { ProfileQuery } from "../../../../store/profile/profile.query";
import { types } from "util";

@Component({
  selector: "ige-document-template",
  templateUrl: "./document-template.component.html",
  styleUrls: ["./document-template.component.scss"],
})
export class DocumentTemplateComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() isFolder = true;

  @Output() create = new EventEmitter();
  documentTypes: DocumentAbstract[];
  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(
    null
  );

  constructor(private profileQuery: ProfileQuery) {}

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
        tap((types) =>
          this.setDocType(this.selectDocType("Zulassungsverfahren", types))
        ),
        tap((types) =>
          this.initialActiveDocumentType.next(
            this.selectDocType("Zulassungsverfahren", types)
          )
        ),
        take(1)
      )
      .subscribe((result) => (this.documentTypes = result));
  }

  private prepareDocumentTypes(result: ProfileAbstract[]): DocumentAbstract[] {
    return result
      .map((profile) => {
        return {
          id: profile.id,
          title: profile.label,
          icon: profile.iconClass,
          _type: profile.addressType,
          _state: "P",
        } as DocumentAbstract;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  selectDocType(name: string, docTypes: DocumentAbstract[]) {
    return (
      docTypes.find((t) => t.title == "Zulassungsverfahren") || docTypes[0]
    );
  }
  setDocType(docType: DocumentAbstract) {
    this.form.get("choice").setValue(docType.id);
  }
}
