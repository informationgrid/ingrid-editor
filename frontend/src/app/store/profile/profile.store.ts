/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { EntityState } from "@datorama/akita";
import { ProfileAbstract } from "./profile.model";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
} from "@ngrx/signals";
import {
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { Group } from "../../models/user-group";
import { computed } from "@angular/core";

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

export const ProfileStore = signalStore(
  { providedIn: "root" },
  withEntities<ProfileAbstract>(),
  withComputed((store) => ({
    addressProfiles: computed(() => {
      return store
        .entities()
        .filter((entity) => entity.isAddressProfile && entity.id !== "FOLDER");
    }),
  })),
  withMethods((store) => ({
    set(profiles: ProfileAbstract[]): void {
      patchState(store, setAllEntities(profiles));
    } /*
      update(profile: ProfileAbstract): void {
        patchState(store, updateEntity({ id: group.id, changes: profile }));
      }*/,
  })),
);
