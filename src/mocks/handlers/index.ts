import { authHandlers } from './auth.handlers';
import { policyHandlers } from './policy.handlers';
import { insuredPersonHandlers } from './insured-person.handlers';
import { premiumPaymentHandlers } from './premium-payment.handlers';
import { agentHandlers } from './agent.handlers';
import { fileUploadHandlers } from './file-upload.handlers';

export const handlers = [
  ...authHandlers,
  ...policyHandlers,
  ...insuredPersonHandlers,
  ...premiumPaymentHandlers,
  ...agentHandlers,
  ...fileUploadHandlers,
];
