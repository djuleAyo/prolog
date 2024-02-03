/** Error expressions to keep declarative syntax */
export const Err = (msg: string) => {throw new Error(msg)}
export const cl = console.log;
export const cw = console.warn;

/** Useful to do conforming checks IE file exists if fstat doesn't throw*/
export const noThrow = async (fn: Function) => {
  try           { return await fn() && true }
  catch (error) { return false }
}

/** # Pipeline
 * This is for regular function what method chaining is for methods.
 * 
 * It supports both synchronous and asynchronous functions.
 * 
 * ❗Left most function is the first to be executed.
*/
export const $ = (...fns: Function[]) => async (x: any) => {
  let result = x;

  for (const fn of fns) {
    result = await fn(result);
  }

  return result;
};

