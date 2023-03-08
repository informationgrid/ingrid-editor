import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DocumentAbstract } from "../../../../store/document/document.model";
import { UntypedFormGroup, Validators } from "@angular/forms";
import { ProfileAbstract } from "../../../../store/profile/profile.model";
import { filter, map, tap } from "rxjs/operators";
import { ProfileQuery } from "../../../../store/profile/profile.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DocBehavioursService } from "../../../../services/event/doc-behaviours.service";
import { ProfileService } from "../../../../services/profile.service";

@UntilDestroy()
@Component({
  selector: "ige-address-template",
  templateUrl: "./address-template.component.html",
  styleUrls: ["./address-template.component.scss"],
})
export class AddressTemplateComponent implements OnInit {
  @Input() form: UntypedFormGroup;
  @Input() isPerson: boolean;

  @Input() set parent(value: number) {
    this.initializeDocumentTypes(this.profileQuery.addressProfiles, value);
  }

  @Output() create = new EventEmitter();

  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(
    null
  );

  documentTypes: DocumentAbstract[];

  constructor(
    private profileQuery: ProfileQuery,
    private docBehaviours: DocBehavioursService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {}

  private initializeDocumentTypes(
    profiles: Observable<ProfileAbstract[]>,
    parent: number
  ) {
    profiles
      .pipe(
        untilDestroyed(this),
        filter((types) => types.length > 0),
        map((types) => this.filterDocTypesByParent(types, parent)),
        map((types) => this.prepareDocumentTypes(types)),
        tap((types) => this.setInitialTypeFirstTime(types)),
        filter((types) => this.skipIfSame(types))
      )
      .subscribe((result) => (this.documentTypes = result));
  }

  private setInitialTypeFirstTime(types: DocumentAbstract[]) {
    // only set it first time
    if (!this.form.get("choice").value) {
      const initialType =
        types.find(
          (t) => t.id == this.profileService.getDefaultAddressType()?.id
        ) || types[0];
      this.setDocType(initialType);
      this.initialActiveDocumentType.next(initialType);
    }
  }

  private skipIfSame(types: DocumentAbstract[]) {
    return (
      types.map((item) => item.id).join() !==
      this.documentTypes?.map((item) => item.id).join()
    );
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
    parent: number
  ): ProfileAbstract[] {
    return this.docBehaviours.filterDocTypesByParent(types, parent);
  }
}
