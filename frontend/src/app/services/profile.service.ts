import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {ConfigService} from './config/config.service';
import {Doctype} from './formular/doctype';
import {ModalService} from './modal/modal.service';
import {ProfileStore} from '../store/profile/profile.store';
import {ProfileAbstract} from '../store/profile/profile.model';
import {IgeDocument} from '../models/ige-document';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private doctypes: Doctype[] = [];

  constructor(private resolver: ComponentFactoryResolver,
              configService: ConfigService,
              private profileStore: ProfileStore,
              errorService: ModalService) {

    configService.$userInfo.subscribe(info => {
      if (info.assignedCatalogs.length > 0) {

        const profile = info.currentCatalog.type;

        import( '../../profiles/profile-' + profile ).then(({ProfilePack}) => {
          console.log('Loaded module: ', ProfilePack);

          const MyComponent = ProfilePack.getMyComponent();
          const factory = this.resolver.resolveComponentFactory(MyComponent);
          // @ts-ignore
          factory.create(factory.ngModule.injector);

        }).catch(e => {
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
      .filter(doctype => doctype.id === doc._type)
      .map(doctype => (doctype.getIconClass && doctype.getIconClass(doc)) || doctype.iconClass);

    if (!iconClass || iconClass.length === 0 || !iconClass[0]) {
      console.log('Unknown document type or iconClass for: ', doc);
      return null;
    }

    return iconClass[0];
  }

  private mapDocumentTypes(doctypes: Doctype[]) {

    return doctypes.map(doctype => {
      return {
        id: doctype.id,
        label: doctype.label,
        iconClass: doctype.iconClass,
        isAddressProfile: doctype.isAddressType
      } as ProfileAbstract;
    });

  }

  registerProfiles(doctypes: Doctype[]) {

    console.log('Registering profile');
    this.doctypes = doctypes;
    this.profileStore.set(this.mapDocumentTypes(this.doctypes));

  }

}
