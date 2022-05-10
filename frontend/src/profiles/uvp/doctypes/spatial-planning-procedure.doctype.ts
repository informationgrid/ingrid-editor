import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { ConfigService } from "../../../app/services/config/config.service";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { LineAndSpatialShared } from "./line-and-spatial-shared";
import { BehaviourService } from "../../../app/services/behavior/behaviour.service";

@Injectable({
  providedIn: "root",
})
export class SpatialPlanningProcedureDoctype extends LineAndSpatialShared {
  id = "UvpSpatialPlanningProcedureDoc";

  label = "Raumordnungsverfahren";

  iconClass = "raumordnungsverfahren";

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    configService: ConfigService,
    uploadService: UploadService,
    behaviourService: BehaviourService
  ) {
    super(
      codelistService,
      codelistQuery,
      configService,
      uploadService,
      behaviourService
    );
  }
}
