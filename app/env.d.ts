type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [member: string]: JSONValue };
type JSONArray = JSONValue[];
type Timestamp = number;
type DatetimeString = `${number}-${number}-${number}T${number}:${number}:${number}`;

interface Navigator {
  readonly standalone: boolean; // supported in chromium browers
  readonly msMaxTouchPoints: number;
  readonly userAgent: string;
  readonly userAgentData?: {
    // Ref: https://github.com/lukewarlow/user-agent-data-types/blob/master/index.d.ts
    readonly brands: {
      readonly brand: string;
      readonly version: string;
    }[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace NodeJS {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ProcessEnv {
    readonly SESSION_COOKIE_SECRET: string;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SENTRY_DSN: string;
}

interface Window {
  ENV: {
    // SOME_VARIABLE: string;
  };
}

// Overwride return type of built-in methods to make them become "type guard" functions since we does not have any assert functions yet:
interface NumberConstructor {
  isInteger(number: unknown): number is number;
  isFinite(number: unknown): number is number;
}
