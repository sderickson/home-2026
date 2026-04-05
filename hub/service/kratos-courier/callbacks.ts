import { getEmailClient } from "@sderickson/recipes-service-common";
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
  log.info(`Verification code email for ${user.id}: ${verificationUrl}`);
  await getEmailClient().sendEmail({
    to: user.email,
    from: `noreply@scotterickson.info`,
    subject: "Verification code",
    text: `To verify your email, go to ${verificationUrl}`,
  });
}

async function onRecoveryCodeValid(payload: RecoveryCodeValidPayload) {
  const { log } = getSafReporters();
  const { user, recoveryCode } = payload;
  log.info(`Recovery code email for ${user.id}: ${recoveryCode}`);
  await getEmailClient().sendEmail({
    to: user.email,
    from: `noreply@scotterickson.info`,
    subject: "Recovery code",
    text: `Your recovery code is ${recoveryCode}`,
  });
}

async function onRecoveryValid(payload: RecoveryValidPayload) {
  const { log } = getSafReporters();
  const { user, recoveryUrl } = payload;
  log.info(`Recovery email for ${user.id}: ${recoveryUrl}`);
  await getEmailClient().sendEmail({
    to: user.email,
    from: `noreply@scotterickson.info`,
    subject: "Recovery",
    text: `To recover your account, go to ${recoveryUrl}`,
  });
}

export const callbacks: KratosCourierCallbacks = {
  onVerificationCodeValid,
  onRecoveryCodeValid,
  onRecoveryValid,
};
