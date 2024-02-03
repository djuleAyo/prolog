import { ZodAny, ZodSchema, z } from 'zod'

type Curry <A, R> =
  <T extends Partial<A>>(a: T) => T extends A ? R : Curry<Omit<A, keyof T>, R>

export function toCurry<A, R> (fn: (a: A) => R, schema: ZodSchema): Curry<A, R>  {
  let acc = {}

  return function stepper<T extends Partial<A>>(a: Partial<A>) {
    acc = {
      ...acc,
      ...a
    }
    const isReady = schema.safeParse(acc as any).success
    console.log(isReady, acc)

    return isReady ? fn(acc as A) : stepper as Curry<Omit<A, keyof T>, R>
  } as Curry<A, R>
}