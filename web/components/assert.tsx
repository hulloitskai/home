export const assertPresent = <T,>(
  value: T | null | undefined,
  message?: string,
): T => {
  if (value === null || value === undefined) {
    throw new Error(
      `[Assert] ${
        message || `Expected a non-nullish value, but got ${value}.`
      }`,
    );
  }
  return value;
};
