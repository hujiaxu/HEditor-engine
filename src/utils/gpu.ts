export const isSuppotedGPU = async () => {
  try {
    if (!navigator.gpu) {
      throw Error('WebGPU not supported.')
    }
    const adapter = await navigator.gpu.requestAdapter()
    return adapter
  } catch (error) {
    return false
  }
}
