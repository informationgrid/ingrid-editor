import { ID } from '@datorama/akita';

export interface ProfileAbstract {
  id: string;
  isInitialized?: boolean;
  iconClass: string;
}

/**
 * A factory function that creates Profile
 */
export function createProfile(params: Partial<ProfileAbstract>) {
  return {
    isInitialized: false
  } as ProfileAbstract;
}
