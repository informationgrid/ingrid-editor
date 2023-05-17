import { Component, Input, OnInit } from "@angular/core";

interface Legend {
  icon?: String;
  svgIcon?: String;
  text: String;
}

@Component({
  selector: "permission-legends",
  templateUrl: "./permission-legends.component.html",
  styleUrls: ["./permission-legends.component.scss"],
})
export class PermissionLegendsComponent implements OnInit {
  @Input() showReadLegend = true;
  @Input() showWriteLegend = true;
  @Input() showSubdirectoryLegend = true;

  legends: Legend[] = [];

  ngOnInit() {
    if (this.showReadLegend) this.legends.push(this.readLegend);
    if (this.showSubdirectoryLegend) this.legends.push(this.subdirectoryLegend);
    if (this.showWriteLegend) this.legends.push(this.writeLegend);
  }

  get readLegend(): Legend {
    return {
      icon: "visibility",
      text: "Leserecht",
    };
  }

  get writeLegend(): Legend {
    return {
      icon: "edit",
      text: "Schreibrecht",
    };
  }

  get subdirectoryLegend(): Legend {
    return {
      svgIcon: "edit-lock-folder",
      text: "Nur Unterordner",
    };
  }
}
