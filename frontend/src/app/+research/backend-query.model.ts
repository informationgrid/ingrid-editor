export class BackendQuery {
  private readonly term: string;
  private clauses: any;

  constructor(
    term: string,
    model: any,
    fieldsWithParameters: { [p: string]: any[] }
  ) {
    this.term = term;
    this.convert(model, fieldsWithParameters);
  }

  private convert(model: any, fieldsWithParameters: { [x: string]: any[] }) {
    let activeFilterIds = { op: "AND", clauses: [] };

    Object.keys(model).map((groupKey) => {
      let groupValue = model[groupKey];
      if (groupValue instanceof Object) {
        let activeItemsFromGroup = Object.keys(groupValue).filter(
          (groupId) => groupValue[groupId]
        );
        if (activeItemsFromGroup.length > 0) {
          if (fieldsWithParameters.hasOwnProperty(activeItemsFromGroup[0])) {
            activeFilterIds.clauses.push({
              op: "OR",
              value: [...activeItemsFromGroup],
              parameter: fieldsWithParameters[activeItemsFromGroup[0]],
            });
          } else {
            activeFilterIds.clauses.push({
              op: "OR",
              value: [...activeItemsFromGroup],
            });
          }
        }
      } else {
        activeFilterIds.clauses.push({ op: "OR", value: [groupValue] });
      }
    });

    this.clauses = activeFilterIds;
  }

  get() {
    return {
      term: this.term,
      clauses: this.clauses,
    };
  }
}
