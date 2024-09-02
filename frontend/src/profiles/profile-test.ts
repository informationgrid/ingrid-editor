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
import { McloudDoctype } from "./mcloud/mcloud.doctype";
import { FolderDoctype } from "./folder/folder.doctype";
import { TestDoctype } from "./test/test.doctype";
import { Component, NgModule } from "@angular/core";
import { ProfileService } from "../app/services/profile.service";
import { ContextHelpService } from "../app/services/context-help/context-help.service";
import { TestAddressDoctype } from "./test/test-address.doctype";
import { TestOrganisationDoctype } from "./test/test-organisation.doctype";

@Component({
  template: "",
})
class TestComponent {
  constructor(
    service: ProfileService,
    contextHelpService: ContextHelpService,
    mcloud: McloudDoctype,
    folder: FolderDoctype,
    test: TestDoctype,
    address: TestAddressDoctype,
    organisation: TestOrganisationDoctype,
  ) {
    const types = [mcloud, folder, test, address, organisation];

    service.registerProfiles(types);
  }
}

@NgModule({
  declarations: [TestComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return TestComponent;
  }
}
