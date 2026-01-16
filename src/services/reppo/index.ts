import type { ReppoService } from './types.js';
import { MockReppoService } from './mock.js';

let reppoService: ReppoService | null = null;

export function getReppoService(): ReppoService {
  if (!reppoService) {
    // TODO: When Reppo Exchange launches, add real client here
    // if (env.REPPO_API_URL) {
    //   reppoService = new ReppoClientService(env.REPPO_API_URL);
    // } else {
    reppoService = new MockReppoService();
    // }
  }
  return reppoService;
}

export type { ReppoService, RFDRequest, RFDResponse, RFDResult } from './types.js';
export { MockReppoService } from './mock.js';
