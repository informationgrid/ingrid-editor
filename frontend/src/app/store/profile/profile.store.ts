import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { ProfileAbstract } from "./profile.model";

type FormHeaderInfoField = "status" | "type" | "created" | "modified";

export interface ProfileState extends EntityState<ProfileAbstract> {
  isInitialized: boolean;
  ui: {
    hideFormHeaderInfos: FormHeaderInfoField[];
  };
}

export function createProfile(params: Partial<ProfileAbstract>) {
  return (<Partial<ProfileAbstract>>{
    isInitialized: false,
    ui: {
      hideFormHeaderInfos: null,
    },
  }) as ProfileAbstract;
}

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "profile" })
export class ProfileStore extends EntityStore<ProfileState, ProfileAbstract> {
  constructor() {
    super(createProfile(null));
  }
}
