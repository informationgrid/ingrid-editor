// Needed for the new modules
import {Compiler, Injectable, Injector, NgModuleFactory} from '@angular/core';
import {environment} from '../../environments/environment';
import {ConfigService, Configuration} from './config/config.service';
import {Profile} from './formular/profile';
import {DocumentService} from './document/document.service';
import {CodelistService} from './codelist/codelist.service';
import {HttpClient} from "@angular/common/http";
import {ProfileStore} from "../store/profile/profile.store";

declare const $script: any;
declare const webpackJsonp: any;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private configuration: Configuration;

  private profiles: Profile[] = [];

  initialized: Promise<Profile[]>;

  constructor(public injector: Injector,
              private profileStore: ProfileStore,
              private http: HttpClient, configService: ConfigService,
              storageService: DocumentService, codelistService: CodelistService, private compiler: Compiler) {
    this.configuration = configService.getConfiguration();

    this.initialized = new Promise((resolve, reject) => {

      if (configService.getUserInfo().assignedCatalogs.length === 0) {
        resolve();
        return;
      }

      console.log('loading dynamic bundle');
      //$script('assets/uvp-profile.umd.js', () => {
      /*http.get('http://localhost:4300/assets/uvp-profile.umd.js', {responseType: 'text'})
        .pipe(
          map(source => {
            console.log('Loaded UMD project bundle dynamically');
            const exports = {}; // this will hold module exports
            const modules = {   // this is the list of modules accessible by plugins
              '@angular/core': AngularCore,
              '@angular/common': AngularCommon,
              'api': IgeApi
            };

            const require: any = (module) => modules[module];
            eval(source);

            compiler.compileModuleAndAllComponentsAsync(exports['UvpProfileModule']).then(compiled => {

              const moduleFactory: NgModuleFactory<any> = compiled.ngModuleFactory;
              const modRef = moduleFactory.create(this.injector);
              const componentFactory = modRef.componentFactoryResolver.resolveComponentFactory(this.getEntryComponent(moduleFactory));
              const component = componentFactory.create(modRef.injector);
              //const cmpRef = this.viewContainer.createComponent<any>(componentFactory);
              return exports;
            });
          })
        ).subscribe();
      */

      if (environment.profileFromServer) {
        // window['theProfile'].forEach(ProfileClass => this.profiles.push(new ProfileClass(storageService, codelistService)));
        // resolve(this.profiles);
        // /*console.log('Requesting URL: ' + this.configuration.backendUrl + 'profiles');
        //$script(this.configuration.backendUrl + 'profiles', () => {
        $script('assets/pack-bkg.bundle.js', () => {
          try {
            // const dynModule: any[] = webpackJsonp([], null, ['_profile_']);
            window['theProfile'].forEach(ProfileClass => this.profiles.push(new ProfileClass(storageService, codelistService)));
            this.setTitleFields(configService);
          } catch (ex) {
            console.error('Could not load profiles from backend', ex);
          }
          resolve(this.profiles);
          this.profileStore.update({isInitialized: true});
        });
      } else {
        // import( '../../profiles/pack-bkg' ).then(module => {
        import( '../../profiles/pack-lgv' ).then(module => {
          console.log('Loaded module: ', module);
          // TODO: use map instead of multiple parameters in case we want to add another dependency
          module.profiles.forEach(ProfileClass => this.profiles.push(new ProfileClass(storageService, codelistService)));

          this.setTitleFields(configService);

          this.profileStore.update({isInitialized: true});
          let profilesAbstract = this.profiles.map( p => {
            return {
              id: p.id,
              fields: p.fields,
              getTitle: p.getTitle
            }
          });

          setTimeout( () => {
            // @ts-ignore
            this.profileStore.add(profilesAbstract);
          }, 1000);
          resolve(this.profiles);
        });
      }
    });
    configService.setProfilePackagePromise(this.initialized);
  }

  private getEntryComponent(moduleFactory: NgModuleFactory<any>) {
    // search (<any>moduleFactory.moduleType).decorators[0].type.prototype.ngMetadataName === NgModule
    return (<any>moduleFactory.moduleType).decorators[0].args[0].entryComponents[0];
  }

  private setTitleFields(configService: ConfigService) {
    const fields: string[] = [];
    this.profiles.forEach(profile => fields.push(...profile.getTitleFields()));

    // return unique items in array
    const titleFields = fields.filter((x, i, a) => x && a.indexOf(x) === i);

    configService.setTitleFields(titleFields);
  }

  getProfiles(): Profile[] {
    return this.profiles;
  }

}
