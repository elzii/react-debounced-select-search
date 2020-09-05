import * as React from 'react'
import cx from 'classnames'

export interface ClearSelectionProps {
  children?: React.ReactNode
  onClick?: () => void
  [key: string]: any
}


export function ClearSelection ({ item, className, style, onClick,...props }: ClearSelectionProps) {
  const classNames = cx('select-clear-selection', className)
  return <div className={classNames} style={style}>
    <button 
      onClick={onClick}
    >✕</button>
  </div>
}
