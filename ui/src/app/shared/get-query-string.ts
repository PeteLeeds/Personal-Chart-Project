export function getQueryString(params: Record<string, string>) {
    let queryString = ''
    Object.entries(params).forEach(([key, value]) => {
      console.log('keys', key, value)
      queryString += queryString.length !== 0 ? '&' : ''
      queryString += `${key}=${value}`
    });
    return queryString
  }