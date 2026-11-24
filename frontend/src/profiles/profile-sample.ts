import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";
import { GeoDatasetDoctypeSample } from "./sample/doctypes/geo-dataset.doctype";

@Component({
  template: "",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class SampleProfileComponent extends InGridComponent {
  geoDataset = inject(GeoDatasetDoctypeSample);
}

export class ProfilePack {
  static getMyComponent() {
    return SampleProfileComponent;
  }
}
