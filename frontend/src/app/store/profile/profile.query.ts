/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { ProfileState, ProfileStore } from "./profile.store";
import { ProfileAbstract } from "./profile.model";

@Injectable({
  providedIn: "root",
})
export class ProfileQuery extends QueryEntity<ProfileState, ProfileAbstract> {
  isInitialized$ = this.select((store) => store.isInitialized);
  documentProfiles = this.selectAll({
    filterBy: (entity) => !entity.isAddressProfile && entity.id !== "FOLDER",
  });
  addressProfiles = this.selectAll({
    filterBy: (entity) => entity.isAddressProfile && entity.id !== "FOLDER",
  });

  constructor(protected store: ProfileStore) {
    super(store);
  }

  getIconClass(id: string) {
    return this.getEntity(id).iconClass;
  }

  getProfile(id: string): ProfileAbstract {
    return this.getEntity(id);
  }
}
