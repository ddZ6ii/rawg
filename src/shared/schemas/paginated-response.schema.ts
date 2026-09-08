import * as z from 'zod/mini'

const PaginatedResponseSchema = <TSchema extends z.core.SomeType>(
  resultSchema: TSchema,
) =>
  z.object({
    count: z.number(),
    previous: z.nullable(z.string()),
    next: z.nullable(z.string()),
    results: z.array(resultSchema),
  })

type PaginatedResponse<TSchema extends z.core.SomeType> = z.infer<
  ReturnType<typeof PaginatedResponseSchema<TSchema>>
>

export { PaginatedResponseSchema, type PaginatedResponse }
