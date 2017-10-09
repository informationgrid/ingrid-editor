import {InjectionToken} from '@angular/core';


export interface Profile {
  id: string;
  label: string;
  profile: any[];
  getTitle: (doc: any) => string;
  getTitleFields: () => string[];

  treeIconClass?: string;
}

export const PROFILES = new InjectionToken<Profile>( 'profiles' );
