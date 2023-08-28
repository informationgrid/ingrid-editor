import { FacetGroup, Facets } from "./research.service";

const almost24hours = 24 * 60 * 60 * 1000 - 1;

export class BackendQuery {
  private readonly term: string;
  private clauses: any;
  private orderByField = "title";
  private orderByDirection = "ASC";
  private pagination: any;

  constructor(
    term: string,
    model: any,
    filters: Facets,
    orderByField = "title",
    orderByDirection = "ASC",
    pagination?: {
      page: number;
      pageSize: number;
    },
    isNotFacetKeys = []
  ) {
    this.term = term;
    this.orderByField = orderByField;
    this.orderByDirection = orderByDirection;
    this.pagination = pagination;

    const allFacetGroups = filters?.documents?.concat(filters?.addresses);
    this.convert(model, allFacetGroups, isNotFacetKeys);
  }

  private convert(
    model: any,
    allFacetGroups: FacetGroup[],
    isNotFacetKeys: string[]
  ) {
    let activeFilterIds = { op: "AND", clauses: [] };

    Object.keys(model).map((groupKey) => {
      let groupValue = model[groupKey];
      const facetGroup = allFacetGroups?.find((fg) => fg.id === groupKey);
      let groupOperator = facetGroup?.combine ?? "OR";
      if (groupValue instanceof Object) {
        let activeItemsFromGroup = Object.keys(groupValue).filter(
          (groupId) => groupValue[groupId]
        );
        if (activeItemsFromGroup.length > 0) {
          if (facetGroup?.filter[0].parameters) {
            activeFilterIds.clauses.push({
              op: groupOperator,
              value: [
                ...BackendQuery.prepareValues(facetGroup, activeItemsFromGroup),
              ],
              parameter: BackendQuery.prepareParameters(
                facetGroup,
                groupValue,
                activeItemsFromGroup
              ),
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
          isFacet: isNotFacetKeys.indexOf(groupKey) === -1,
        });
      }
    });

    this.clauses = activeFilterIds;
  }

  private static prepareParameters(
    facetGroup: FacetGroup,
    groupValue,
    activeItemsFromGroup: string[]
  ) {
    switch (facetGroup.viewComponent) {
      case "TIMESPAN":
        return [
          groupValue.start,
          BackendQuery.modifyToEndOfDay(groupValue.end),
        ];
      case "SPATIAL":
        const spatial = groupValue[facetGroup.filter[0].id].value;
        return [spatial.lat1, spatial.lon1, spatial.lat2, spatial.lon2];
      case "SELECT":
        return [groupValue[activeItemsFromGroup[0]]];
      default:
        return groupValue[activeItemsFromGroup[0]].value;
    }
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

  private static prepareValues(
    facetGroup: FacetGroup,
    activeItemsFromGroup: string[]
  ): string[] {
    if (facetGroup.viewComponent === "TIMESPAN") {
      return [facetGroup.filter[0].id];
    } else {
      return activeItemsFromGroup;
    }
  }

  /**
   * When setting the end date, then add almost a whole day to search till the end of the day
   * @param endDate
   */
  private static modifyToEndOfDay(endDate) {
    if (endDate) {
      return new Date(new Date(endDate).getTime() + almost24hours);
    }
    return endDate;
  }
}
