declare var __DEV__: boolean

declare module '*.css' {
  const content: {[className: string]: string}
  export default content
}
