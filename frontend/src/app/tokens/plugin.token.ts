import { InjectionToken } from "@angular/core";
import { Plugin } from "../+catalog/+behaviours/plugin";

export const PluginToken = new InjectionToken<Plugin>("Plugin");
export const FormPluginToken = new InjectionToken<Plugin>("Plugin");
