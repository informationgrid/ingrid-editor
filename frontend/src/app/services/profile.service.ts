import { Injectable, Type } from "@angular/core";
import { ConfigService, UserInfo } from "./config/config.service";
import { Doctype } from "./formular/doctype";
import { ModalService } from "./modal/modal.service";
import { ProfileStore } from "../store/profile/profile.store";
import { ProfileAbstract } from "../store/profile/profile.model";
import { IgeDocument } from "../models/ige-document";
import { ContextHelpService } from "./context-help/context-help.service";
import { forkJoin, from, Observable } from "rxjs";
import { catchError, filter, map, switchMap, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private doctypes: Doctype[] = [];
  private defaultDataDocType?: Doctype = null;
  private defaultAddressType?: Doctype = null;

  constructor(
    private configService: ConfigService,
    private profileStore: ProfileStore,
    private contextHelpService: ContextHelpService,
    private errorService: ModalService,
  ) {}

  initProfile(): Observable<Type<any>> {
    return this.configService.$userInfo.pipe(
      filter((info) => ProfileService.userHasAnyCatalog(info)),
      switchMap((info) => ProfileService.importProfile(info)),
      map(({ ProfilePack }) => ProfileService.getComponent(ProfilePack)),
      catchError((error) => {
        this.errorService.showJavascriptError(error.message, error.stack);
        throw error;
      }),
    );
  }

  private static getComponent(ProfilePack) {
    console.log("Loaded module: ", ProfilePack);
    return ProfilePack.getMyComponent() as Type<any>;
  }

  private static importProfile(info: UserInfo) {
    return from(import("../../profiles/profile-" + info.currentCatalog.type));
  }

  private static userHasAnyCatalog(info: UserInfo) {
    return (
      info?.assignedCatalogs?.length > 0 &&
      info?.currentCatalog?.type !== undefined &&
      info?.currentCatalog?.type !== null
    );
  }

  getProfiles(): Doctype[] {
    return this.doctypes;
  }

  getProfile(id: string): Doctype {
    return this.getProfiles().find((profile) => profile.id === id);
  }

  getDocumentIcon(doc: IgeDocument): string {
    const iconClass = this.doctypes
      .filter((doctype) => doctype.id === doc._type)
      .map(
        (doctype) =>
          (doctype.getIconClass && doctype.getIconClass(doc)) ||
          doctype.iconClass,
      );

    if (!iconClass || iconClass.length === 0 || !iconClass[0]) {
      console.warn("Unknown document type or iconClass for: ", doc);
      return null;
    }

    return iconClass[0];
  }

  private mapDocumentTypes(doctypes: Doctype[]): ProfileAbstract[] {
    return doctypes.map((doctype) => {
      return <ProfileAbstract>{
        id: doctype.id,
        label: doctype.label,
        iconClass: doctype.iconClass,
        isAddressProfile: doctype.isAddressType,
        addressType: doctype.addressType,
        hasOptionalFields: doctype.hasOptionalFields,
      };
    });
  }

  registerProfiles(doctypes: Doctype[]) {
    console.log("Registering profile");
    this.doctypes = doctypes;

    // TODO: get ContextHelpIDs of all document types at once to improve speed
    const profile = this.configService.$userInfo.value.currentCatalog.type;
    const helpIdsObservables = this.doctypes.map((type) =>
      this.contextHelpService.getAvailableHelpFieldIds(profile, type.id),
    );
    forkJoin(helpIdsObservables)
      .pipe(
        tap((results) => this.initDocumentTypes(results)),
        tap(() => this.finishProfileInitialization()),
      )
      .subscribe();
  }

  setDefaultDataDoctype(doctype: Doctype) {
    this.defaultDataDocType = doctype;
  }

  getDefaultDataDoctype() {
    return this.defaultDataDocType;
  }

  setDefaultAddressType(doctype: Doctype) {
    this.defaultAddressType = doctype;
  }

  getDefaultAddressType() {
    return this.defaultAddressType;
  }

  private initDocumentTypes(results: string[][]) {
    results.forEach((result, index) => this.doctypes[index].init(result));
  }

  private finishProfileInitialization() {
    this.profileStore.set(this.mapDocumentTypes(this.doctypes));
  }

  updateUIProfileStore(data: any) {
    this.profileStore.update(() => ({
      ui: {
        ...data,
      },
    }));
  }
}
