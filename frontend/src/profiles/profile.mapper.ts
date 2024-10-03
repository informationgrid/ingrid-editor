/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { from } from "rxjs";

export function ProfileMapper(profileId: string) {
  switch (profileId) {
    case "ingrid":
      return from(import("./profile-ingrid"));
    case "uvp":
      return from(import("./profile-uvp"));
    case "bmi":
      return from(import("./profile-bmi"));
    case "ingrid-bast":
      return from(import("./profile-ingrid-bast"));
    case "ingrid-bkg":
      return from(import("./profile-ingrid-bkg"));
    case "ingrid-hmdk":
      return from(import("./profile-ingrid-hmdk"));
    case "ingrid-kommunal-st":
      return from(import("./profile-ingrid-kommunal-st"));
    case "ingrid-krzn":
      return from(import("./profile-ingrid-krzn"));
    case "ingrid-lfubayern":
      return from(import("./profile-ingrid-lfubayern"));
    case "ingrid-lubw":
      return from(import("./profile-ingrid-lubw"));
    case "ingrid-up-sh":
      return from(import("./profile-ingrid-up-sh"));
    case "ingrid-wsv":
      return from(import("./profile-ingrid-wsv"));
    case "mcloud":
      return from(import("./profile-mcloud"));
    case "opendata":
      return from(import("./profile-opendata"));
    case "test":
      return from(import("./profile-test"));
  }
}
