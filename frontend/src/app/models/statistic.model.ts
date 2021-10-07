export interface StatisticResponse {
  totalNum: number;
  numPublished: number;
  numDrafts: number;
  statsPerType: Map<string, StatisticResponse>;
}
