import { EServicePolicyType, EServiceType } from "common/general";

export interface Create {
  serviceId: number;
  serviceType: EServiceType;
  policyType: EServicePolicyType;
  dayRange: number;
  moneyRate: number;
}

export interface Update {
  policyType: EServicePolicyType;
  dayRange: number;
  moneyRate: number;
}