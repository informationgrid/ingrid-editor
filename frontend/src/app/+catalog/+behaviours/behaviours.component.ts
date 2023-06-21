import { Component, OnInit } from "@angular/core";
import {
  BehaviourFormatBackend,
  BehaviourService,
} from "../../services/behavior/behaviour.service";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Plugin } from "./plugin";
import { FormlyFormBuilder } from "@ngx-formly/core";
import { ActivatedRoute } from "@angular/router";
import { FormPluginsService } from "../../+form/form-shared/form-plugins.service";

@UntilDestroy()
@Component({
  selector: "ige-behaviours",
  templateUrl: "./behaviours.component.html",
  styleUrls: ["./behaviours.component.scss"],
})
export class BehavioursComponent implements OnInit {
  type: string;

  private readonly formPlugins: Plugin[];
  plugins: any;
  // plugins: { [x: string]: Plugin[] };

  expanded: any = {};

  fields: any = {};
  title: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private builder: FormlyFormBuilder,
    private route: ActivatedRoute,
    private behaviourService: BehaviourService,
    private formPluginsService: FormPluginsService
  ) {
    this.formPlugins = formPluginsService.plugins.filter(
      (plugin) => !plugin.hide
    );
  }

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get("type");

    if (this.type === "form") {
      this.title = "Formularkonfiguration";
      this.behaviourService.applyActiveStates(this.formPlugins);
      this.plugins = this.groupBy(
        this.formPlugins,
        (plugin: Plugin) => plugin.group || "Andere"
      );
      this.fields = this.createModelFromPlugins(this.formPlugins);
    } else {
      this.title = "Katalogverhalten";
      this.behaviourService.theSystemBehaviours$
        .pipe(
          untilDestroyed(this),
          tap((systemPlugins) => {
            this.fields = this.createModelFromPlugins(systemPlugins);
            this.plugins = this.groupBy(
              systemPlugins,
              (plugin: Plugin) => plugin.group || "Andere"
            );
          })
        )
        .subscribe();
    }
  }

  private groupBy(array: any[], callback: (x: any) => any) {
    return array.reduce(
      (previous, current, index, a, field = callback(current)) => (
        (previous[field] || (previous[field] = [])).push(current), previous
      ),
      {}
    );
  }

  save() {
    // TODO: improve by saving only modified behaviours states
    const behaviours =
      this.type === "form"
        ? this.formPlugins
        : this.behaviourService.theSystemBehaviours$.value;
    const updatedBehaviours = behaviours.map((item) =>
      this.mapBehaviourForBackend(item)
    );

    this.behaviourService.saveBehaviours(updatedBehaviours);
  }

  private mapBehaviourForBackend(item: Plugin): BehaviourFormatBackend {
    return {
      _id: item.id,
      active: this.fields[item.id]?.active.value,
      data: this.fields[item.id]?.form.value,
    };
  }

  hasInvalidForm() {
    return Object.keys(this.fields).some(
      (key) => this.fields[key].form.invalid
    );
  }

  hasDirtyForm() {
    return Object.keys(this.fields).some(
      (key) => this.fields[key].active.dirty || this.fields[key].form.dirty
    );
  }

  private createModelFromPlugins(items: Plugin[]) {
    return items.reduce((acc: any, plugin: Plugin) => {
      const formGroup = new UntypedFormGroup({});

      // initially set disabled state for fields
      if (plugin.fields.length > 0 && !plugin.isActive) {
        // we need to build form when we want to set it disabled initialially
        this.builder.buildForm(
          formGroup,
          plugin.fields,
          plugin.data ? plugin.data : {},
          {}
        );
        formGroup.disable();
      }

      acc[plugin.id] = {
        form: formGroup,
        active: new UntypedFormControl(plugin.isActive),
        modified: plugin.isActive !== plugin.defaultActive,
        fields: plugin.fields,
        data: plugin.data ? plugin.data : {},
      };
      return acc;
    }, {});
  }
}
