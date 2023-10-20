import { Component, inject, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { ConfigService } from "../../services/config/config.service";
import { PageTemplateModule } from "../../shared/page-template/page-template.module";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "ige-content-management",
  templateUrl: "./content-management.component.html",
  styleUrls: ["./content-management.component.scss"],
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    PageTemplateModule,
    MatButtonModule,
  ],
  standalone: true,
})
export class ContentManagementComponent implements OnInit {
  configService = inject(ConfigService);
  snackBar = inject(MatSnackBar);

  accessibility = new FormControl<string>("");

  ngOnInit(): void {
    this.configService.getCMSPages().subscribe((pages) => {
      const accessibility = pages.find(
        (item) => item.pageId === "accessibility",
      );
      this.accessibility.setValue(accessibility?.content ?? "");
    });
  }

  save() {
    this.configService
      .updateCMSPage([
        { pageId: "accessibility", content: this.accessibility.value },
      ])
      .subscribe(() => this.snackBar.open("Die Änderung wurde gespeichert"));
  }
}
