import { Injectable } from "@angular/core";
import { OrganisationDoctype } from "../address/organisation.doctype";

@Injectable({ providedIn: "root" })
export class SampleOrganisationDoctype extends OrganisationDoctype {
  id = "SampleOrganisationDoc";
}
