export class BackendStoreQuery {

  readonly term: string;
  model: any;
  parameters: any;

  constructor(term: string, model: any, fieldsWithParameters: { [p: string]: any[] }) {
    this.term = term;
    this.model = model;
    this.parameters = fieldsWithParameters;
  }

  get() {
    return {
      term: this.term,
      model: this.model,
      parameters: this.parameters
    };
  }
}
