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
