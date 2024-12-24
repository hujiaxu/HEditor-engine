export default function Defined<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null
}
