import * as React from 'react'
import cx from 'classnames'
// import s from '../styles.module.css'

interface Props {
  // [key: string]: any
  children: any
  styles: {
    [key: string]: React.CSSProperties
  }
  attributes: {
    [key: string]: {
      [key: string]: string
    }
  },
  visible: boolean,
}


export const Popover = React.forwardRef<HTMLDivElement, Props>((props, forwardedRef) => {  

  return <div 
    className={cx('popper-dropdown')}
    ref={forwardedRef} 
    style={{
      ...props.styles.popper,
      visibility: props.visible ? 'visible' : 'hidden'
    }} 
    {...props.attributes.popper}
  >
    <div className={cx('popper-dropdown__list')}>
      {
        props.children
      }
    </div>
  </div>
})