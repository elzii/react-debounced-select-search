const log = (label: string = '', styles: string | string[] = ['default']) => (...args: any) => {

  // if ( __DEV__ ) {
  //   return () => null;
  // }

  const getStyleString = (s: string) => {
    switch(s) {
      case 'warning': {
        return `color:white;background:#de7417;padding:4px 6px;border-radius:4px;`
      }
      case 'request': {
        return `color:white;background:#a132f5;padding:4px 6px;border-radius:4px;`
      }
      case 'pill': {
        return `color:#222222;background:#f3f3f3;padding:4px 6px;border-radius:4px;`
      }
      case 'scroll': {
        return `color:white;background:palevioletred;padding:4px 6px;border-radius:4px;`
      }
      case 'key': {
        return `color:white;background:#3fa0fb;padding:4px 6px;border-radius:4px;`
      }
      case 'tab': {
        return `color:#e1e1e1;background:#313131;padding:4px 6px;border-radius:4px;`
      }
      case 'effect': {
        return `color:#803594;background:#EEC4F9;padding:4px 6px;border-radius:4px;`
      }
      default: {
        return s
      }
    }
  }
  const styleStr = Array.isArray(styles) 
    ? styles.map(s => {
      return getStyleString(s)
    })
    : getStyleString(styles)

  return console.log(`%c${label}`, styleStr, ...args)
}

export default log