export interface DeferResult {
  promise: Promise<any>
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}
