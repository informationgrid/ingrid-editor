
export interface ProfileAbstract {
  id: string;
  label: string;
  isInitialized?: boolean;
  iconClass: string;
  isAddressProfile?: boolean;
  hasOptionalFields?: boolean;
}

/**
 * A factory function that creates Profile
 */
export function createProfile(params: Partial<ProfileAbstract>) {
  return {
    isInitialized: false
  } as ProfileAbstract;
}
