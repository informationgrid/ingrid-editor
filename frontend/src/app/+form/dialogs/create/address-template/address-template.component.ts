import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { FormGroup, Validators } from "@angular/forms";
import { ProfileAbstract } from "../../../../store/profile/profile.model";
import { filter, map, tap } from "rxjs/operators";
import { ProfileQuery } from "../../../../store/profile/profile.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DocBehavioursService } from "../../../../services/event/doc-behaviours.service";

@UntilDestroy()
@Component({
  selector: "ige-address-template",
  templateUrl: "./address-template.component.html",
  styleUrls: ["./address-template.component.scss"],
})
export class AddressTemplateComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() isPerson: boolean;

  @Input() set parent(value: string) {
    this.initializeDocumentTypes(this.profileQuery.addressProfiles, value);
  }

  @Output() create = new EventEmitter();

  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(
    null
  );

  documentTypes: DocumentAbstract[];

  constructor(
    private profileQuery: ProfileQuery,
    private docBehaviours: DocBehavioursService
  ) {}

  ngOnInit(): void {}

  private initializeDocumentTypes(
    profiles: Observable<ProfileAbstract[]>,
    parent: string
  ) {
    profiles
      .pipe(
        untilDestroyed(this),
        filter((types) => types.length > 0),
        map((types) => this.filterDocTypesByParent(types, parent)),
        map((types) => this.prepareDocumentTypes(types)),
        tap((types) => this.setDocType(types[0])),
        tap((types) => this.initialActiveDocumentType.next(types[0]))
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

  setDocType(docType: DocumentAbstract) {
    this.form.get("choice").setValue(docType.id);
    this.isPerson = docType._type !== "organization";
    const firstName = this.form.get("firstName");
    const lastName = this.form.get("lastName");
    const organization = this.form.get("organization");

    if (this.isPerson) {
      organization.clearValidators();
      organization.reset();
      organization.updateValueAndValidity();
      lastName.setValidators(Validators.required);
    } else {
      lastName.clearValidators();
      lastName.reset();
      lastName.updateValueAndValidity();
      firstName.reset();
      organization.setValidators(Validators.required);
    }
  }

  private filterDocTypesByParent(
    types: ProfileAbstract[],
    parent: string
  ): ProfileAbstract[] {
    return this.docBehaviours.filterDocTypesByParent(types, parent);
  }
}
