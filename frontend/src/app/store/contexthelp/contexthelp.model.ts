export interface ContexthelpAbstract {
  fakeId: string;
  fieldId: string;
  profile: string;
  docType: string;
  helptext?: string;
  isInitialized?: boolean;
}

/**
 * A factory function that creates Contexthelp
 */
export function createContexthelp(params: Partial<ContexthelpAbstract>) {
  return {
    isInitialized: false
  } as ContexthelpAbstract;
}
