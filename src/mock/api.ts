interface MockAPIConfig {
  delay?: number,
  data?: any
}

interface MockFetchOptions {
  method?: string
}

type MockFetchResponse = {
  headers: any
  status: number
  json(): any
}


function search(data: any[], query: string) {
  return data.filter((item) => {
    return new RegExp(`${query}`, 'i').test(item.title)
  })
}

export class MockAPI {
  config: MockAPIConfig;

  constructor(config?: MockAPIConfig) {
    const defaultConfig = {
      delay: 400,
      data: JSON.stringify([])
    }
    this.config = {
      ...defaultConfig,
      ...config
    }
  }


  fetch(url: string, options: MockFetchOptions): Promise<MockFetchResponse> {
    const [ uri, qs ] = url.split('?')
    const query = new URLSearchParams(qs)

    const results = query.get('term')
      ? search(this.config.data, query.get('term') as string)
      : this.config.data

    const response = {
      headers: {},
      status: 200,
      json: (): Promise<any> => new Promise((resolve) => {
        resolve(results)
      })
    }


    return new Promise((resolve,reject) => {
      setTimeout(() => {
        resolve(response)
      }, this.config.delay)
    })
  }
}