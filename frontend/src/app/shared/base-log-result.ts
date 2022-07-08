export interface BaseLogResult {
  startTime: Date;
  endTime: Date;
  message: string;
  errors: string[];
  report: any[];
}
