/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
  Input,
  OnInit,
  output,
  signal,
} from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DocumentAbstract } from "../../../../store/document/document.model";
import {
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ProfileAbstract } from "../../../../store/profile/profile.model";
import { filter, map, tap } from "rxjs/operators";
import { ProfileQuery } from "../../../../store/profile/profile.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DocBehavioursService } from "../../../../services/event/doc-behaviours.service";
import { ProfileService } from "../../../../services/profile.service";
import { TranslocoService } from "@ngneat/transloco";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FocusDirective } from "../../../../directives/focus.directive";
import { DocumentListItemComponent } from "../../../../shared/document-list-item/document-list-item.component";

interface AddressDocumentAbstract extends DocumentAbstract {
  addressType: "person" | "organization";
}

@UntilDestroy()
@Component({
  selector: "ige-address-template",
  templateUrl: "./address-template.component.html",
  styleUrls: ["./address-template.component.scss"],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    FocusDirective,
    DocumentListItemComponent,
  ],
})
export class AddressTemplateComponent implements OnInit {
  @Input() form: UntypedFormGroup;
  parent = input<number>();

  create = output<void>();

  isPerson = signal<boolean>(false);

  private translocoService = inject(TranslocoService);

  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(
    null,
  );

  documentTypes = signal<AddressDocumentAbstract[]>([]);

  constructor(
    private profileQuery: ProfileQuery,
    private docBehaviours: DocBehavioursService,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.initializeDocumentTypes(
      this.profileQuery.addressProfiles,
      this.parent(),
    ).subscribe((value) => this.documentTypes.set(value));
  }

  private initializeDocumentTypes(
    profiles: Observable<ProfileAbstract[]>,
    parent: number,
  ) {
    return profiles.pipe(
      untilDestroyed(this),
      filter((types) => types.length > 0),
      map((types) => this.filterDocTypesByParent(types, parent)),
      map((types) => this.prepareDocumentTypes(types)),
      tap((types) => this.setInitialTypeFirstTime(types)),
      filter((types) => this.skipIfSame(types)),
    );
  }

  private setInitialTypeFirstTime(types: AddressDocumentAbstract[]) {
    // only set it first time
    if (!this.form.get("choice").value) {
      const initialType =
        types.find(
          (t) => t.id == this.profileService.getDefaultAddressType()?.id,
        ) || types[0];
      this.setDocType(initialType);
      this.initialActiveDocumentType.next(initialType);
    }
  }

  private skipIfSame(types: DocumentAbstract[]) {
    return (
      types.map((item) => item.id).join() !==
      this.documentTypes()
        ?.map((item) => item.id)
        .join()
    );
  }

  private prepareDocumentTypes(
    result: ProfileAbstract[],
  ): AddressDocumentAbstract[] {
    return result
      .map((profile) => {
        return {
          id: profile.id,
          title: this.translocoService.translate(`docType.${profile.id}`),
          icon: profile.iconClass,
          _type: profile.id,
          addressType: profile.addressType,
          _state: "P",
        } as AddressDocumentAbstract;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  setDocType(docType: AddressDocumentAbstract) {
    this.form.get("choice").setValue(docType.id);
    this.isPerson.set(docType.addressType !== "organization");
    const firstName = this.form.get("firstName");
    const lastName = this.form.get("lastName");
    const organization = this.form.get("organization");

    if (this.isPerson()) {
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
    parent: number,
  ): ProfileAbstract[] {
    return this.docBehaviours.filterDocTypesByParent(types, parent);
  }
}
