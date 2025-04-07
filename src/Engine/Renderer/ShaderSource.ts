export default class ShaderSource {
  static replaceMain: (source: string, renamedMain: string) => string
}

ShaderSource.replaceMain = function (source: string, renamedMain: string) {
  renamedMain = `void ${renamedMain}()`
  return source.replace(/void\s+main\s*\(\s*(?:void)?\s*\)/g, renamedMain)
}
