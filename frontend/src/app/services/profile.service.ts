import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {ConfigService} from './config/config.service';
import {Profile} from './formular/profile';
import {ModalService} from './modal/modal.service';
import {ProfileStore} from '../store/profile/profile.store';
import {ProfileAbstract} from '../store/profile/profile.model';
import {IgeDocument} from '../models/ige-document';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profiles: Profile[] = [];

  constructor(private resolver: ComponentFactoryResolver,
              configService: ConfigService,
              private profileStore: ProfileStore,
              errorService: ModalService) {

    configService.$userInfo.subscribe(info => {
      if (info.assignedCatalogs.length > 0) {

        const profile = info.currentCatalog.type;

        import( '../../profiles/pack-' + profile ).then(({ProfilePack}) => {
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

  getProfiles(): Profile[] {
    return this.profiles;
  }

  getProfileIcon(doc: IgeDocument): string {
    const iconClass = this.profiles
      .filter(profile => profile.id === doc._profile)
      .map(profile => (profile.getIconClass && profile.getIconClass(doc)) || profile.iconClass);

    if (!iconClass || iconClass.length === 0 || !iconClass[0]) {
      console.log('Unknown profile or iconClass for: ', doc);
      return null;
    }

    return iconClass[0];
  }

  private mapProfiles(profiles: Profile[]) {

    return profiles.map(profile => {
      return {
        id: profile.id,
        label: profile.label,
        iconClass: profile.iconClass,
        isAddressProfile: profile.isAddressProfile
      } as ProfileAbstract;
    });

  }

  registerProfiles(profiles: Profile[]) {

    console.log('Registering profile');
    this.profiles = profiles;
    this.profileStore.set(this.mapProfiles(this.profiles));

  }

}
