import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { GeoDatasetDoctypeUPSH } from "./ingrid-up-sh/doctypes/geo-dataset.doctype";

@Component({
  template: "",
})
class InGridUPSHComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeUPSH);
}

@NgModule({
  declarations: [InGridUPSHComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridUPSHComponent;
  }
}
