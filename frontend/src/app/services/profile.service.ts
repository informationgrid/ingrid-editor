import {Injectable} from '@angular/core';
import {ConfigService} from './config/config.service';
import {Profile} from './formular/profile';
import {CodelistService} from './codelist/codelist.service';
import {HttpClient} from '@angular/common/http';
import {SessionStore} from '../store/session.store';
import {ModalService} from './modal/modal.service';
import {ProfileStore} from '../store/profile/profile.store';
import {ProfileAbstract} from '../store/profile/profile.model';
import {CodelistQuery} from '../store/codelist/codelist.query';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profiles: Profile[] = [];

  constructor(private sessionStore: SessionStore,
              private http: HttpClient, configService: ConfigService,
              private profileStore: ProfileStore,
              private codelistQuery: CodelistQuery,
              errorService: ModalService,
              codelistService: CodelistService) {

    configService.$userInfo.subscribe(info => {
      if (info.assignedCatalogs.length > 0) {

        const profile = info.currentCatalog.type;

        import( '../../profiles/pack-' + profile ).then(module => {
          console.log('Loaded module: ', module);
          this.profiles = module.profiles
            .map(ProfileClass => new ProfileClass(null, codelistService, codelistQuery));

          this.sessionStore.update({profilesInitialized: true});
          this.profileStore.set(this.mapProfiles(this.profiles));

        }).catch(e => {
          errorService.showJavascriptError(e.message, e.stack);
        });
      }
    });
  }

  getProfiles(): Profile[] {
    return this.profiles;
  }

  getProfileIcon(profileId: string): string {
    const iconClass = this.profiles
      .filter(profile => profile.id === profileId)
      .map(profile => profile.iconClass);

    if (!iconClass || iconClass.length === 0 || !iconClass[0]) {
      console.debug('Unknown profile or iconClass');
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
}
