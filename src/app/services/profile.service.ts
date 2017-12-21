import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import $script from 'scriptjs';
import { ConfigService, Configuration } from './config.service';
import { Profile } from './formular/profile';
import { StorageService } from './storage/storage.service';
import { CodelistService } from '../+form/services/codelist.service';

declare const webpackJsonp: any;

@Injectable()
export class ProfileService {
  private configuration: Configuration;

  private profiles: Profile[] = [];

  initialized: Promise<Profile[]>;

  constructor(configService: ConfigService, storageService: StorageService, codelistService: CodelistService) {
    this.configuration = configService.getConfiguration();

    this.initialized = new Promise((resolve, reject) => {
      if (environment.profileFromServer) {
        console.log('Requesting URL: ' + this.configuration.backendUrl + 'profiles');
        $script(this.configuration.backendUrl + 'profiles', () => {
          try {
            const dynModule: any[] = webpackJsonp([], null, ['_profile_']);
            dynModule['profiles'].forEach(ProfileClass => this.profiles.push(new ProfileClass(storageService, codelistService)));
          } catch {
            console.error('Could not load profiles from backend');
          }
          resolve(this.profiles);
        });
      } else {
        import( '../../profiles/pack-lgv' ).then(module => {
          console.log('Loaded module: ', module);
          // TODO: use map instead of multiple parameters in case we want to add another dependency
          module.profiles.forEach(ProfileClass => this.profiles.push(new ProfileClass(storageService, codelistService)));
          resolve(this.profiles);
        });
      }
    });
  }

  getProfiles(): Promise<Profile[]> {
    return this.initialized;
  }

}
