import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DocumentAbstract } from "../store/document/document.model";
import { Doctype } from "../services/formular/doctype";
import { ProfileService } from "../services/profile.service";
import { DocumentService } from "../services/document/document.service";
import { TreeQuery } from "../store/tree/tree.query";
import { TreeStore } from "../store/tree/tree.store";
import { SessionStore } from "../store/session.store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormMessageService } from "../services/form-message.service";
import { ProfileQuery } from "../store/profile/profile.query";
import { BehaviorSubject, of } from "rxjs";
import { filter, map, mergeMap, toArray } from "rxjs/operators";
import { DocEventsService } from "../services/event/doc-events.service";
import { IgeDocument } from "../models/ige-document";
import { ConfigService } from "../services/config/config.service";
import { AddressTreeQuery } from "../store/address-tree/address-tree.query";

export interface FormularMenuItem {
  name: string;
  title: string;
  action: () => void;
  disabled?: boolean;
}

@Injectable()
export class FormularService {
  data = {};

  currentProfile: string;

  profileDefinitions: Doctype[];

  sections$ = new BehaviorSubject<string[]>([]);
  private profileSections: string[] = [];

  private datasetsOptions: FormularMenuItem[] = [];
  private addressOptions: FormularMenuItem[] = [];

  constructor(
    private dialog: MatDialog,
    private profiles: ProfileService,
    private configService: ConfigService,
    private documentService: DocumentService,
    private docEventsService: DocEventsService,
    private formMessageService: FormMessageService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private treeStore: TreeStore,
    private sessionStore: SessionStore,
    private profileQuery: ProfileQuery
  ) {
    // create profiles after we have logged in
    console.log("init profiles");
    this.profileQuery.selectLoading().subscribe((isLoading) => {
      if (!isLoading) {
        this.profileDefinitions = this.profiles.getProfiles();
      }
    });
  }

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

  getHeaderMenuOptions(
    doc: IgeDocument,
    isAddress: boolean
  ): HeaderMenuOption[] {
    const moreOptions = isAddress
      ? [...this.addressOptions]
      : [...this.datasetsOptions];

    const isFolder = doc._type === "FOLDER";
    const query = isAddress ? this.addressTreeQuery : this.treeQuery;
    const parent = query.getEntity(doc._parent);

    if (isAddress && !isFolder) {
      moreOptions.push({
        title: "Kontaktangaben der übergeordneten Adresse übernehmen",
        name: "inherit-contact-data",
        disabled: !parent || parent._type === "FOLDER",
        action: () =>
          this.docEventsService.sendEvent({
            type: "INHERIT_CONTACT_DATA",
            data: { docId: doc._id, parentId: parent.id },
          }),
      });

      if (this.isUserPrivileged())
        moreOptions.push({
          title: "Adresse ersetzen",
          name: "replace-address",
          action: () =>
            this.docEventsService.sendEvent({
              type: "REPLACE_ADDRESS",
              data: { uuid: doc._uuid },
            }),
        });
    }

    if (this.isUserPrivileged()) {
      moreOptions.push({
        title: "Berechtigungen anzeigen",
        name: "show-document-permissions",
        action: () =>
          this.docEventsService.sendEvent({
            type: "SHOW_DOCUMENT_PERMISSIONS",
            data: { id: doc._id },
          }),
      });
    }

    return moreOptions;
  }

  private isUserPrivileged() {
    const role = this.configService.$userInfo.value.role;
    return role === "ige-super-admin" || role === "cat-admin";
  }

  private getProfile(id: string): Doctype {
    if (this.profileDefinitions) {
      const profile = this.profileDefinitions.find((p) => p.id === id);
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

  setSelectedDocuments(docs: DocumentAbstract[]) {
    this.treeStore.setActive(docs.map((d) => d.id));
  }

  updateSidebarWidth(size: number) {
    this.sessionStore.update((state) => ({
      ui: {
        ...state.ui,
        sidebarWidth: size,
      },
    }));
  }

  getSectionsFromProfile(profile: FormlyFieldConfig[]): void {
    const getSectionItem = (item: FormlyFieldConfig) => {
      return item?.wrappers?.indexOf("section") >= 0
        ? [item]
        : item.fieldGroup ?? [];
    };

    of(profile)
      .pipe(
        mergeMap((items) => items),
        mergeMap((item) => getSectionItem(item)),
        filter((item) => item?.wrappers?.indexOf("section") >= 0),
        map((item) => item.props.label),
        toArray()
      )
      .subscribe((sections) => {
        this.profileSections = sections;
        this.sections$.next(sections);
      });
  }

  setAdditionalSections(sections: string[]) {
    // prevent ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() =>
      this.sections$.next([...this.profileSections, ...sections])
    );
  }

  addExtraOption(option: FormularMenuItem, forAddress: boolean) {
    forAddress
      ? this.addressOptions.push(option)
      : this.datasetsOptions.push(option);
  }

  removeExtraOption(id: string, forAddress: boolean) {
    forAddress
      ? (this.addressOptions = this.addressOptions.filter(
          (option) => option.name !== id
        ))
      : (this.datasetsOptions = this.datasetsOptions.filter(
          (option) => option.name !== id
        ));
  }
}

export class HeaderMenuOption {
  title: string;
  name: string;
  disabled?: boolean;
  action: () => void;
}
