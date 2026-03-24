import { mockingOn } from "@saflib/email";
import { getSafReporters } from "@saflib/node";
import type {
  KratosCourierCallbacks,
  RecoveryCodeValidPayload,
  RecoveryValidPayload,
  VerificationCodeValidPayload,
} from "@saflib/ory-kratos";

async function onVerificationCodeValid(payload: VerificationCodeValidPayload) {
  const { log } = getSafReporters();
  const { user, verificationUrl } = payload;
  log.info(`Verification code email for ${user.id}`);
  if (mockingOn && verificationUrl) {
    log.info(`Link: ${verificationUrl}`);
  }
}

async function onRecoveryCodeValid(payload: RecoveryCodeValidPayload) {
  const { log } = getSafReporters();
  const { user, recoveryCode } = payload;
  log.info(`Recovery code email for ${user.id}`);
  if (mockingOn) {
    log.info(`Code: ${recoveryCode}`);
  }
}

async function onRecoveryValid(payload: RecoveryValidPayload) {
  const { log } = getSafReporters();
  const { user, recoveryUrl } = payload;
  log.info(`Recovery link email for ${user.id}`);
  if (mockingOn) {
    log.info(`Link: ${recoveryUrl}`);
  }
}

export const callbacks: KratosCourierCallbacks = {
  onVerificationCodeValid,
  onRecoveryCodeValid,
  onRecoveryValid,
};
