export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

export function safeId(val: any): number {
  const id = Number(val)
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Invalid ID parameter')
  return id
}
