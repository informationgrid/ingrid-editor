import { Injectable } from "@angular/core";
import { DocumentAbstract } from "../store/document/document.model";
import { Doctype } from "../services/formular/doctype";
import { ProfileService } from "../services/profile.service";
import { TreeQuery } from "../store/tree/tree.query";
import { TreeStore } from "../store/tree/tree.store";
import { SessionStore } from "../store/session.store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ProfileQuery } from "../store/profile/profile.query";
import { BehaviorSubject, of } from "rxjs";
import { filter, map, mergeMap, toArray } from "rxjs/operators";
import { DocEventsService } from "../services/event/doc-events.service";
import { ConfigService } from "../services/config/config.service";
import { AddressTreeQuery } from "../store/address-tree/address-tree.query";
import { FormularMenuItem } from "./form-menu.service";

@Injectable({
  providedIn: "root",
})
export class FormularService {
  data = {};

  currentProfile: string;

  profileDefinitions: Doctype[];

  sections$ = new BehaviorSubject<string[]>([]);
  private profileSections: string[] = [];

  private datasetsOptions: FormularMenuItem[] = [];
  private addressOptions: FormularMenuItem[] = [];

  constructor(
    private profiles: ProfileService,
    private configService: ConfigService,
    private docEventsService: DocEventsService,
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
}
