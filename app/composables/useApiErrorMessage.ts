type StrapiError = {
  data?: {
    error?: {
      name?: string;
      message?: string;
      details?: any;
    };
  };
  error?: {
    name?: string;
    message?: string;
    details?: any;
    status?: number;
  };
  message?: string;
};

const extractMessages = (error: unknown): string[] => {
  const messages: string[] = [];
  const err = error as StrapiError | undefined;

  const main =
    err?.data?.error?.message ||
    err?.error?.message ||
    err?.message;
  if (typeof main === "string" && main.trim()) messages.push(main);

  const details = err?.data?.error?.details || err?.error?.details;
  const detailErrors = details?.errors;
  if (Array.isArray(detailErrors)) {
    for (const e of detailErrors) {
      if (typeof e?.message === "string" && e.message.trim()) messages.push(e.message);
    }
  }

  return messages;
};

export const getApiErrorI18nKey = (error: unknown): string => {
  const messages = extractMessages(error).map((m) => m.toLowerCase());
  const joined = messages.join(" ");

  if (
    joined.includes("invalid identifier") ||
    joined.includes("invalid credentials") ||
    joined.includes("invalid password") ||
    joined.includes("wrong password")
  ) {
    return "notification.invalidCredentials";
  }

  if (joined.includes("email") && (joined.includes("unique") || joined.includes("already"))) {
    return "notification.emailTaken";
  }

  if (
    joined.includes("username") &&
    (joined.includes("unique") || joined.includes("already") || joined.includes("taken"))
  ) {
    return "notification.usernameTaken";
  }

  if (joined.includes("unique")) {
    return "notification.uniqueConstraint";
  }

  if (joined.includes("validation")) {
    return "notification.validationFailed";
  }

  return "notification.error";
};
