import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { ConfigService } from "./config/config.service";
import { Doctype } from "./formular/doctype";
import { ModalService } from "./modal/modal.service";
import { ProfileStore } from "../store/profile/profile.store";
import { ProfileAbstract } from "../store/profile/profile.model";
import { IgeDocument } from "../models/ige-document";
import { ContextHelpService } from "./context-help/context-help.service";
import { ContextHelpQuery } from "../store/context-help/context-help.query";
import { forkJoin } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private doctypes: Doctype[] = [];

  constructor(
    private resolver: ComponentFactoryResolver,
    private configService: ConfigService,
    private profileStore: ProfileStore,
    private contextHelpService: ContextHelpService,
    errorService: ModalService
  ) {
    configService.$userInfo.subscribe((info) => {
      if (info.assignedCatalogs.length > 0 && info.currentCatalog?.type) {
        const profile = info.currentCatalog.type;

        import("../../profiles/profile-" + profile)
          .then(({ ProfilePack }) => {
            console.log("Loaded module: ", ProfilePack);

            const MyComponent = ProfilePack.getMyComponent();
            const factory = this.resolver.resolveComponentFactory(MyComponent);
            // @ts-ignore
            factory.create(factory.ngModule.injector);
          })
          .catch((e) => {
            errorService.showJavascriptError(e.message, e.stack);
          });
      }
    });
  }

  getProfiles(): Doctype[] {
    return this.doctypes;
  }

  getDocumentIcon(doc: IgeDocument): string {
    const iconClass = this.doctypes
      .filter((doctype) => doctype.id === doc._type)
      .map(
        (doctype) =>
          (doctype.getIconClass && doctype.getIconClass(doc)) ||
          doctype.iconClass
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
      this.contextHelpService.getAvailableHelpFieldIds(profile, type.id)
    );
    forkJoin(helpIdsObservables)
      .pipe(
        tap((results) => this.initDocumentTypes(results)),
        tap(() => this.finishProfileInitialization())
      )
      .subscribe();
  }

  private initDocumentTypes(results: string[][]) {
    results.forEach((result, index) => this.doctypes[index].init(result));
  }

  private finishProfileInitialization() {
    this.profileStore.set(this.mapDocumentTypes(this.doctypes));
  }
}
