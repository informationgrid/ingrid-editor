// when adding a new plugin then it must be loaded from the PluginManager by import statement
// then this plugin can be listed and activated
// - what is the difference to a bahaviour?
//   - plugins are pre-configured and cannot be changed
//   - maybe it's possible to change a few settings
//   - they're also defined for all catalogs
//   - they can change the behaviour system wide
//   - a behaviour can be created by the user dynamically and is valid for a catalog
//   - these only change the behaviour of the formular(?)
//     - might not be flexible enough, see UVP example!!!
//     - or should it be realised as a plugin?

export abstract class Plugin {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  defaultActive: boolean;

  register(): void {
    this.isActive = true;
  }

  unregister(): void {
    this.isActive = false;
  }
}
