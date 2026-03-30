import { mockingOn } from "@saflib/email";
import { getSafReporters } from "@saflib/node";
import type {
  KratosCourierCallbacks,
  RecoveryCodeValidPayload,
  VerificationCodeValidPayload,
} from "@saflib/ory-kratos";
import { emailClient } from "@saflib/email";

async function onVerificationCodeValid(payload: VerificationCodeValidPayload) {
  const { log } = getSafReporters();
  const { user, verificationUrl } = payload;
  log.info(`Verification code email for ${user.id}`);
  if (mockingOn && verificationUrl) {
    log.info(`Link: ${verificationUrl}`);
  }
  await emailClient.sendEmail({
    to: user.email,
    from: `noreply@scotterickson.info`,
    subject: "Verification code",
    text: `To verify your email, go to ${verificationUrl}`,
  });
}

async function onRecoveryCodeValid(payload: RecoveryCodeValidPayload) {
  const { log } = getSafReporters();
  const { user, recoveryCode } = payload;
  log.info(`Recovery code email for ${user.id}`);
  if (mockingOn) {
    log.info(`Code: ${recoveryCode}`);
  }
  await emailClient.sendEmail({
    to: user.email,
    from: `noreply@scotterickson.info`,
    subject: "Recovery code",
    text: `Your recovery code is ${recoveryCode}`,
  });
}

export const callbacks: KratosCourierCallbacks = {
  onVerificationCodeValid,
  onRecoveryCodeValid,
};
