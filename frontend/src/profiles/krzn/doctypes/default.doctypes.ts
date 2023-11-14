import { Injectable } from "@angular/core";
import { DataCollectionDoctype } from "../../ingrid/doctypes/data-collection.doctype";
import { GeoServiceDoctype } from "../../ingrid/doctypes/geo-service.doctype";
import { LiteratureDoctype } from "../../ingrid/doctypes/literature.doctype";
import { ProjectDoctype } from "../../ingrid/doctypes/project.doctype";
import { SpecialisedTaskDoctype } from "../../ingrid/doctypes/specialisedTask.doctype";

@Injectable({
  providedIn: "root",
})
export class DataCollectionDoctypeKrzn extends DataCollectionDoctype {
  id = "InGridDataCollectionKrzn";
}
@Injectable({
  providedIn: "root",
})
export class GeoServiceDoctypeKrzn extends GeoServiceDoctype {
  id = "InGridGeoServiceKrzn";
}
@Injectable({
  providedIn: "root",
})
export class LiteratureDoctypeKrzn extends LiteratureDoctype {
  id = "InGridLiteratureKrzn";
}
@Injectable({
  providedIn: "root",
})
export class ProjectDoctypeKrzn extends ProjectDoctype {
  id = "InGridProjectKrzn";
}
@Injectable({
  providedIn: "root",
})
export class SpecialisedTaskDoctypeKrzn extends SpecialisedTaskDoctype {
  id = "InGridSpecialisedTaskKrzn";
}
