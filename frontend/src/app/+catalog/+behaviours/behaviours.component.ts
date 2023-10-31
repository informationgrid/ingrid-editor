import { Component, OnInit } from "@angular/core";
import {
  BehaviourFormatBackend,
  BehaviourService,
} from "../../services/behavior/behaviour.service";
import { FormControl, FormGroup } from "@angular/forms";
import { UntilDestroy } from "@ngneat/until-destroy";
import { FormlyFormBuilder } from "@ngx-formly/core";
import { ActivatedRoute } from "@angular/router";
import { PluginService } from "../../services/plugin/plugin.service";
import { Plugin } from "./plugin";

@UntilDestroy()
@Component({
  selector: "ige-behaviours",
  templateUrl: "./behaviours.component.html",
  styleUrls: ["./behaviours.component.scss"],
})
export class BehavioursComponent implements OnInit {
  type: string;

  private readonly plugins: Plugin[];
  pluginsGrouped: any;

  expanded: any = {};

  fields: any = {};

  constructor(
    private builder: FormlyFormBuilder,
    private route: ActivatedRoute,
    private behaviourService: BehaviourService,
    pluginService: PluginService,
  ) {
    this.plugins = pluginService.plugins.filter((plugin) => !plugin.hide);
  }

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get("type");

    // this.behaviourService.applyActiveStates(this.plugins);
    this.pluginsGrouped = this.groupBy(
      this.plugins,
      (plugin: Plugin) => plugin.group || "Andere",
    );
    this.fields = this.createModelFromPlugins(this.plugins);
  }

  private groupBy(array: any[], callback: (x: any) => any) {
    return array.reduce(
      (previous, current, index, a, field = callback(current)) => (
        (previous[field] || (previous[field] = [])).push(current), previous
      ),
      {},
    );
  }

  save() {
    // TODO: improve by saving only modified behaviours states
    const updatedBehaviours = this.plugins.map((item) =>
      this.mapBehaviourForBackend(item),
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

  hasDirtyForm() {
    return Object.keys(this.fields).some(
      (key) => this.fields[key].active.dirty || this.fields[key].form.dirty,
    );
  }

  private createModelFromPlugins(items: Plugin[]) {
    return items.reduce((acc: any, plugin: Plugin) => {
      const formGroup = new FormGroup({});

      // initially set disabled state for fields
      if (plugin.fields.length > 0 && !plugin.isActive) {
        // we need to build form when we want to set it disabled initially
        this.builder.buildForm(
          formGroup,
          plugin.fields,
          plugin.data ? plugin.data : {},
          {},
        );
        formGroup.disable();
      }

      acc[plugin.id] = {
        form: formGroup,
        active: new FormControl<boolean>(plugin.isActive),
        modified: plugin.isActive !== plugin.defaultActive,
        fields: plugin.fields,
        data: plugin.data ? plugin.data : {},
      };
      return acc;
    }, {});
  }
}
