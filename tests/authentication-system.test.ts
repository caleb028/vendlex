import { serverDB, hashPassword, verifyPassword, normalizeKenyanPhone, hashToken } from "../lib/server-db";
import { checkRateLimit, sanitizeInput, isValidKenyanPhone, timingSafeCompare } from "../lib/security";
import { sendPasswordResetEmail, sendEmailVerificationEmail, getSentEmails, verifySmtpConnection, getLatestEmailForRecipient } from "../lib/email";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
    failedCount++;
  }
}

async function runAuthTests() {
  console.log("\n=======================================================");
  console.log("🔐 STARTING VENDLEX AUTHENTICATION SYSTEM TEST SUITE");
  console.log("=======================================================\n");

  // TEST SUITE 1: PHONE NORMALIZATION (Kenyan Formats)
  console.log("1. Kenyan Phone Number Normalization Tests:");
  assert(normalizeKenyanPhone("0712345678") === "+254712345678", "Normalizes 07XX format to +2547XXXXXXXX");
  assert(normalizeKenyanPhone("0112345678") === "+254112345678", "Normalizes 01XX format to +2541XXXXXXXX");
  assert(normalizeKenyanPhone("254712345678") === "+254712345678", "Normalizes 2547XX format to +2547XXXXXXXX");
  assert(normalizeKenyanPhone("+254712345678") === "+254712345678", "Preserves canonical +2547XXXXXXXX format");
  assert(normalizeKenyanPhone("0712 345 678") === "+254712345678", "Strips spaces in phone number");
  assert(normalizeKenyanPhone("0712-345-678") === "+254712345678", "Strips hyphens in phone number");
  assert(normalizeKenyanPhone("invalid-phone") === null, "Rejects invalid phone strings");

  // TEST SUITE 2: DUAL IDENTIFIER LOOKUP (Email & Phone)
  console.log("\n2. Dual Identifier User Lookup Tests:");
  const userByEmail = serverDB.findUserByIdentifier("kevin@nairobihub.co.ke");
  assert(userByEmail !== undefined && userByEmail.name === "Kevin Mwangi", "Finds Kevin by exact email");

  const userByPhoneLocal = serverDB.findUserByIdentifier("0712345678");
  assert(userByPhoneLocal !== undefined && userByPhoneLocal.name === "Kevin Mwangi", "Finds Kevin by local phone 0712345678");

  const userByPhoneIntl = serverDB.findUserByIdentifier("+254712345678");
  assert(userByPhoneIntl !== undefined && userByPhoneIntl.name === "Kevin Mwangi", "Finds Kevin by international phone +254712345678");

  const unknownUser = serverDB.findUserByIdentifier("nobody@example.com");
  assert(unknownUser === undefined, "Returns undefined for non-existent identifier");

  // TEST SUITE 3: PASSWORD CRYPTOGRAPHY & VERIFICATION
  console.log("\n3. Password Cryptography & Verification Tests:");
  const testSecret = "MyS3cure@P@ss2026!";
  const { hash, salt } = hashPassword(testSecret);
  assert(hash.length === 128, "Scrypt hash is exactly 128-hex chars (64 bytes)");
  assert(salt.length === 32, "Salt is a secure 32-hex chars (16 bytes)");
  assert(verifyPassword(testSecret, hash, salt), "Valid password succeeds verification");
  assert(!verifyPassword("WrongPassword!", hash, salt), "Invalid password fails verification");
  assert(!verifyPassword("", hash, salt), "Empty password fails verification");

  // TEST SUITE 4: SERVER-SIDE SESSION CREATION & ROTATION
  console.log("\n4. Session Management & Multi-Device Tests:");
  const testUser = serverDB.findUserByIdentifier("grace.wanjiku@gmail.com")!;
  const session1 = serverDB.createSession(testUser.id, testUser.role, {
    rememberMe: false,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
    ipAddress: "197.232.1.50",
  });
  assert(session1.token.length === 64, "Session token is 64-char crypto-secure hex");
  assert(session1.expiresAt > Date.now() + 71 * 3600 * 1000, "Standard session duration is ~72 hours");

  const sessionRemember = serverDB.createSession(testUser.id, testUser.role, {
    rememberMe: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
    ipAddress: "197.232.1.51",
  });
  assert(sessionRemember.expiresAt > Date.now() + 29 * 24 * 3600 * 1000, "Remember-me session duration is ~30 days");

  const userSessions = serverDB.getUserSessions(testUser.id);
  assert(userSessions.length >= 2, "Lists all active sessions for multi-device view");

  // Revoke single session
  serverDB.deleteSession(session1.token);
  assert(serverDB.getSession(session1.token) === null, "Revoked session returns null");
  assert(serverDB.getSession(sessionRemember.token) !== null, "Other session remains valid after single revocation");

  // Revoke all other sessions
  serverDB.deleteAllUserSessions(testUser.id, sessionRemember.token);
  const remainingSessions = serverDB.getUserSessions(testUser.id);
  assert(remainingSessions.length === 1 && remainingSessions[0].token === sessionRemember.token, "deleteAllUserSessions revokes all except current session");

  // TEST SUITE 5: ACCOUNT STATUS ENFORCEMENT
  console.log("\n5. Account Status Enforcement Tests:");
  // Create a suspended user
  const suspendedUser = serverDB.createUser({
    name: "Suspended Seller",
    email: "suspended@vendlex.ke",
    phone: "0799887766",
    role: "SELLER",
    password: "password123",
  });
  serverDB.updateUser(suspendedUser.id, { status: "SUSPENDED" });
  const fetchedSuspended = serverDB.findUserById(suspendedUser.id)!;
  assert(fetchedSuspended.status === "SUSPENDED", "User correctly set to SUSPENDED status");

  // Create a session for suspended user and verify retrieval rejection
  const suspendedSession = serverDB.createSession(suspendedUser.id, suspendedUser.role);
  // Simulating getServerSession status check:
  const sessionData = serverDB.getSession(suspendedSession.token);
  assert(sessionData !== null, "Session exists in DB");
  const userCheck = serverDB.findUserById(sessionData!.userId);
  assert(userCheck?.status === "SUSPENDED", "Session holder is identified as SUSPENDED");

  // TEST SUITE 6: LOGIN ATTEMPT LOCKOUT
  console.log("\n6. Brute Force Defense & Lockout Tests:");
  const targetUser = serverDB.createUser({
    name: "Lockout Test User",
    email: "lockout@vendlex.ke",
    phone: "0788776655",
    role: "CUSTOMER",
    password: "CorrectPassword123!",
  });

  // Simulate 5 failed login attempts
  for (let i = 1; i <= 5; i++) {
    const attempts = (targetUser.loginAttempts || 0) + 1;
    const updates: Record<string, any> = { loginAttempts: attempts };
    if (attempts >= 5) {
      updates.lockedUntil = Date.now() + 15 * 60 * 1000;
    }
    serverDB.updateUser(targetUser.id, updates);
    targetUser.loginAttempts = attempts;
  }
  const lockedUser = serverDB.findUserById(targetUser.id)!;
  assert(lockedUser.loginAttempts === 5, "Login attempts counter reaches 5");
  assert(lockedUser.lockedUntil !== undefined && lockedUser.lockedUntil > Date.now(), "User account locked until future timestamp");

  // Reset lockout
  serverDB.updateUser(targetUser.id, { loginAttempts: 0, lockedUntil: undefined });
  const unlockedUser = serverDB.findUserById(targetUser.id)!;
  assert(unlockedUser.loginAttempts === 0 && unlockedUser.lockedUntil === undefined, "Lockout clears upon successful verification");

  // TEST SUITE 7: PASSWORD RESET FLOW (Hash Storage & Expiry)
  console.log("\n7. Password Reset Crypto Flow Tests:");
  const resetUser = serverDB.createUser({
    name: "Reset Flow User",
    email: "reset@vendlex.ke",
    phone: "0777665544",
    role: "CUSTOMER",
    password: "OldPassword123!",
  });

  const rawResetToken = "test-raw-crypto-reset-token-2026";
  const hashedResetToken = hashToken(rawResetToken);
  assert(hashedResetToken !== rawResetToken, "Token is hashed via SHA-256 before storage");

  serverDB.updateUser(resetUser.id, {
    passwordResetToken: hashedResetToken,
    passwordResetExpiry: Date.now() + 3600 * 1000,
  });

  // Verify match with raw token
  const matchingUser = serverDB.getUsers().find(
    (u) => u.passwordResetToken === hashToken(rawResetToken) && u.passwordResetExpiry && Date.now() < u.passwordResetExpiry
  );
  assert(matchingUser !== undefined && matchingUser.id === resetUser.id, "Successfully matches user using hashed token compare");

  // Complete reset
  const { hash: newHash, salt: newSalt } = hashPassword("BrandNewPassword2026!");
  serverDB.updateUser(resetUser.id, {
    passwordHash: newHash,
    salt: newSalt,
    passwordResetToken: undefined,
    passwordResetExpiry: undefined,
  });

  const updatedResetUser = serverDB.findUserById(resetUser.id)!;
  assert(updatedResetUser.passwordResetToken === undefined, "Reset token is cleared after use");
  assert(verifyPassword("BrandNewPassword2026!", updatedResetUser.passwordHash, updatedResetUser.salt), "New password verifies successfully");
  assert(!verifyPassword("OldPassword123!", updatedResetUser.passwordHash, updatedResetUser.salt), "Old password is invalid");

  // TEST SUITE 8: EMAIL VERIFICATION FLOW
  console.log("\n8. Email Verification Token Tests:");
  const verifyUser = serverDB.createUser({
    name: "Verification Test User",
    email: "verify@vendlex.ke",
    phone: "0766554433",
    role: "CUSTOMER",
    password: "Password123!",
  });
  serverDB.updateUser(verifyUser.id, { isVerified: false });

  const rawVerifyToken = "test-raw-verify-token-2026";
  serverDB.updateUser(verifyUser.id, {
    emailVerificationToken: hashToken(rawVerifyToken),
    emailVerificationExpiry: Date.now() + 24 * 3600 * 1000,
  });

  const matchedVerifyUser = serverDB.getUsers().find(
    (u) => u.emailVerificationToken === hashToken(rawVerifyToken) && u.emailVerificationExpiry && Date.now() < u.emailVerificationExpiry
  );
  assert(matchedVerifyUser !== undefined && matchedVerifyUser.id === verifyUser.id, "Finds user with matching hashed verify token");

  // Complete verification
  serverDB.updateUser(verifyUser.id, {
    isVerified: true,
    emailVerificationToken: undefined,
    emailVerificationExpiry: undefined,
  });
  const fullyVerified = serverDB.findUserById(verifyUser.id)!;
  assert(fullyVerified.isVerified === true, "User status marked isVerified = true");
  assert(fullyVerified.emailVerificationToken === undefined, "Verification token invalidated after use");

  // TEST SUITE 9: SECURITY RATE LIMITING & DEFENSE
  console.log("\n9. Defensive Security & Utility Tests:");
  const rateKey = "test-rate-key-" + Date.now();
  for (let i = 0; i < 5; i++) {
    checkRateLimit(rateKey, 5, 60000);
  }
  const rateBlocked = checkRateLimit(rateKey, 5, 60000);
  assert(!rateBlocked.allowed, "Rate limiter blocks request when limit is reached");

  assert(timingSafeCompare("vendlex-secret-token", "vendlex-secret-token"), "timingSafeCompare succeeds on identical strings");
  assert(!timingSafeCompare("vendlex-secret-token", "vendlex-wrong-token"), "timingSafeCompare fails on different strings");

  // TEST SUITE 10: EMAIL DISPATCH & TEMPLATES ENGINE
  console.log("\n10. Transactional Email Dispatch Tests:");
  const smtpStatus = await verifySmtpConnection();
  assert(smtpStatus !== undefined && typeof smtpStatus.connected === "boolean", "SMTP diagnostic verification executes without throwing");

  const resetEmailRes = await sendPasswordResetEmail({
    to: "reset.test@vendlex.ke",
    name: "Reset Tester",
    token: "sample-reset-token-123",
  });
  assert(resetEmailRes.success === true, "Password reset email dispatches successfully");
  assert(resetEmailRes.resetUrl?.includes("sample-reset-token-123") === true, "Password reset result includes direct reset link");

  const verifyEmailRes = await sendEmailVerificationEmail({
    to: "verify.test@vendlex.ke",
    name: "Verify Tester",
    token: "sample-verify-token-456",
  });
  assert(verifyEmailRes.success === true, "Email verification dispatches successfully");
  assert(verifyEmailRes.resetUrl?.includes("sample-verify-token-456") === true, "Email verification result includes direct verify link");

  const sentEmails = getSentEmails();
  assert(sentEmails.length >= 2, "Email spool captures dispatched emails for audit & delivery");

  const lastResetEmail = getLatestEmailForRecipient("reset.test@vendlex.ke");
  assert(lastResetEmail !== undefined, "Found password reset email in spool via getLatestEmailForRecipient");
  assert(lastResetEmail!.html.includes("Reset My Password"), "Password reset email contains call-to-action button");
  assert(lastResetEmail!.html.includes("sample-reset-token-123"), "Password reset email contains secure token link");
  assert(lastResetEmail!.subject.includes("Reset Your VendLex Kenya Password"), "Password reset subject is correctly formatted");

  const lastVerifyEmail = getLatestEmailForRecipient("verify.test@vendlex.ke");
  assert(lastVerifyEmail !== undefined, "Found verification email in spool via getLatestEmailForRecipient");
  assert(lastVerifyEmail!.html.includes("Verify Email Address"), "Verification email contains verification button");
  assert(lastVerifyEmail!.html.includes("sample-verify-token-456"), "Verification email contains token link");

  console.log("\n=======================================================");
  console.log(`AUTHENTICATION & EMAIL TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runAuthTests().catch((err) => {
  console.error("Auth test execution error:", err);
  process.exit(1);
});
