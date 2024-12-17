import { ModelOptions } from 'src/type'

export default class Model {
  public url: string
  constructor(options: ModelOptions) {
    this.url = options.url

    if (!this.url) {
      throw new Error('url is not exist')
    }
  }
}
