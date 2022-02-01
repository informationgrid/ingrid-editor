import { FacetGroup, Facets } from "./research.service";

export class BackendQuery {
  private readonly term: string;
  private clauses: any;
  private orderByField = "title";
  private orderByDirection = "ASC";
  private pagination: any;

  constructor(
    term: string,
    model: any,
    fieldsWithParameters: { [p: string]: any[] },
    filters: Facets,
    orderByField = "title",
    orderByDirection = "ASC",
    pagination?: {
      page: number;
      pageSize: number;
    }
  ) {
    this.term = term;
    this.orderByField = orderByField;
    this.orderByDirection = orderByDirection;
    this.pagination = pagination;

    const allFacetGroups = filters?.documents?.concat(filters?.addresses);
    this.convert(model, fieldsWithParameters, allFacetGroups);
  }

  private convert(
    model: any,
    fieldsWithParameters: { [p: string]: any[] },
    allFacetGroups: FacetGroup[]
  ) {
    let activeFilterIds = { op: "AND", clauses: [] };

    Object.keys(model).map((groupKey) => {
      let groupValue = model[groupKey];
      let groupOperator =
        allFacetGroups?.find((fg) => fg.id === groupKey)?.combine ?? "OR";
      if (groupValue instanceof Object) {
        let activeItemsFromGroup = Object.keys(groupValue).filter(
          (groupId) => groupValue[groupId]
        );
        if (activeItemsFromGroup.length > 0) {
          if (fieldsWithParameters.hasOwnProperty(activeItemsFromGroup[0])) {
            activeFilterIds.clauses.push({
              op: groupOperator,
              value: [...activeItemsFromGroup],
              parameter: fieldsWithParameters[activeItemsFromGroup[0]],
            });
          } else {
            activeFilterIds.clauses.push({
              op: groupOperator,
              value: [...activeItemsFromGroup],
            });
          }
        }
      } else {
        activeFilterIds.clauses.push({
          op: groupOperator,
          value: [groupValue],
        });
      }
    });

    this.clauses = activeFilterIds;
  }

  get() {
    return {
      term: this.term,
      clauses: this.clauses,
      orderByField: this.orderByField,
      orderByDirection: this.orderByDirection,
      pagination: this.pagination,
    };
  }
}
