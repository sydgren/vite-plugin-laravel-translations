type Mergeable = Record<string, unknown>;

const isObject = (value: unknown): value is Mergeable => !!value && typeof value === "object";

/**
 *
 * Deep merge two objects together.
 *
 * @param target - Target object to merge into
 * @param source - Source object to merge from
 * @returns unknown
 */
export const mergeDeep = (target: unknown, source: unknown): unknown => {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep({ ...targetValue }, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
};
