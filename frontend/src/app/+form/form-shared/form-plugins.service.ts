/*@Injectable({
  providedIn: "root",
})*/
export class FormPluginsService {
  /*plugins: Plugin[] = [];
  initWithAddress: boolean = null;

  constructor(private behaviourService: BehaviourService) {
    /!*behaviourService.registerState$.subscribe((value) =>
      value.register
        ? this.init(this.plugins, value.address)
        : this.unregisterAll()
    );*!/
  }

  registerPlugin(plugin: Plugin) {
    this.plugins.push(plugin);

    // register late plugins, which were not ready during initialization
    if (this.initWithAddress !== null) {
      this.init([plugin], this.initWithAddress);
    }
  }

  private init(plugins: Plugin[], forAddress: boolean) {
    this.initWithAddress = forAddress;
    this.behaviourService.applyActiveStates(plugins);

    plugins.forEach((p) => p.setForAddress(forAddress));

    plugins
      .filter((p) => p.isActive)
      .filter((p) => !forAddress || (forAddress && !p.hideInAddress))
      .forEach((p) => p.register());
  }

  // on destroy must be called manually from provided component since it may not be
  // called always
  onDestroy(): void {
    this.unregisterAll();
  }

  private unregisterAll() {
    this.plugins.filter((p) => p.isActive).forEach((p) => p.unregister());
  }*/
}
