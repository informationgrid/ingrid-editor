/** Flat node with expandable and level information */

export class DynamicFlatNode {
  constructor(
    public id: string,
    public label: string,
    public profile: string,
    public state: string,
    public level: number = 1,
    public expandable: boolean = false,
    public icon: string,
    public isLoading: boolean = false) {
  }
}
