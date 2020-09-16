import * as React from 'react'
import cx from 'classnames'

import { IOption } from '../index'

export interface OptionProps {
  item: IOption,
  onClick?: () => void
  [key: string]: any
}


export const Option: React.FC<OptionProps> = ({ item, className, style, onClick,...props }: OptionProps) => {
    const classNames = cx('select-option', className)
    return <div className={classNames} onClick={onClick}>
      <div className="select-option__thumb-container">
        <img className="select-option__thumb" src={item.thumb} alt="" />
      </div>
      <div>
        <div>
          <div style={{ marginBottom: 2 }}>{item.name}</div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, margin: '2px -4px' }}>
          {
            item.meta && (item.meta as any[]).map(({ value }, m) => {
              return <span key={`meta-${m}`} style={{ margin: '0px 4px', padding: '1px 4px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>{value}</span>
            })
          }
        </div>
      </div>
    </div>
  }

export interface OptionsProps {
  [key: string]: any
}

export const Options = React.forwardRef<HTMLDivElement, OptionsProps>((props, forwardedRef) => {
  const classNames = cx('select-options-container', props.className)
  return <div ref={forwardedRef} className={classNames} style={props.style}>
    {props.children}
  </div>
})