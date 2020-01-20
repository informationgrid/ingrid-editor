import {Injectable} from '@angular/core';
import {ConfigService} from './config/config.service';
import {Profile} from './formular/profile';
import {CodelistService} from './codelist/codelist.service';
import {HttpClient} from '@angular/common/http';
import {SessionStore} from '../store/session.store';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profiles: Profile[] = [];

  constructor(private sessionStore: SessionStore,
              private http: HttpClient, configService: ConfigService,
              codelistService: CodelistService) {

    configService.$userInfo.subscribe(info => {
      if (info.assignedCatalogs.length > 0) {

        import( '../../profiles/pack-mcloud' ).then(module => {
          console.log('Loaded module: ', module);
          this.profiles = module.profiles
            .map(ProfileClass => new ProfileClass(null, codelistService));

          this.sessionStore.update({profilesInitialized: true});

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

}
