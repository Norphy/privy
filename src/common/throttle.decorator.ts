/**
 * This decorator forces the method it decaorates to
 * return after a minimum duration which is passed
 * as an argument.
 * @param { number } delayMs - duration in milliseconds
 * before returning the value of the decorated method
 * @returns TypedPropertyDescriptor
 */
export function throttle<T = any>(
  delayMs: number,
): (
  target: any,
  property: keyof T,
  descriptor: TypedPropertyDescriptor<(...args: any) => any>,
) => TypedPropertyDescriptor<(...args: any) => any> {
  return (
    _: any,
    __: keyof T,
    descriptor: TypedPropertyDescriptor<(...args: any) => any>,
  ) => {
    const oriMethod = descriptor.value;
    descriptor.value = function (...args: []) {
      return new Promise(async (resolve) => {
        const date = new Date();
        const now = date.getTime();
        const result = oriMethod.apply(this, args);
        let future = date.getTime();
        while (future - now < delayMs) {
          future = new Date().getTime();
          await sleep(50);
        }
        resolve(result);
      });
    };

    return descriptor;
  };
}

function sleep(delayMs: number): Promise<void> {
  return new Promise((r) => {
    setTimeout(r, delayMs);
  });
}
