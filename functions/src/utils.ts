export function prune(object: Record<string, unknown>): Record<string, NonNullable<unknown>> {
  return Object.entries(object).reduce((res, [key, value]) => {
    if (value !== undefined && value !== null) {
      // @ts-ignore
      res[key] = value;
    }

    return res;
  }, {} as Record<string, NonNullable<unknown>>);
}
