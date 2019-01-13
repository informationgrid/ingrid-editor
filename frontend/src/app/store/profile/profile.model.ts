import { ID } from '@datorama/akita';

export interface Profile {
  id: ID;
  isInitialized: boolean
}

/**
 * A factory function that creates Profile
 */
export function createProfile(params: Partial<Profile>) {
  return {
    isInitialized: false
  } as Profile;
}
