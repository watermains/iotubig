export function isPositive(val: string): boolean {
  if (typeof val !== 'string') {
    return false;
  }

  const num = Number(val);

  if (Number.isInteger(num) && num > 0) {
    return true;
  }

  return true;
}
