import * as React from 'react'
import cx from 'classnames'
import { usePopper } from 'react-popper'
import { useOnClickOutside } from '../hooks/useOnClickOutside'
import { Popover } from './Popover'
import { IOption } from '../index'
// import { SortableTable } from './SortableTable'
import { SortableList } from './SortableList'



// const SortableList = React.lazy(() => import('./SortableList'))



interface ChipProps {
  removeClassName?: string
}
export const Chip: React.SFC<ChipProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const classNames = cx('select-input-chip', props.className)
  const removeClassNames = cx('select-input-chip__remove', props.removeClassName)
  return <div className={classNames} style={props.style}>
    <span>{props.children}</span>
    <button 
      tabIndex={-1}
      className={removeClassNames} 
      type="button" 
      // @ts-ignore
      onClick={props.onClick}
    >
      ✕
    </button>
  </div>
}



export type ChipTypeRollup = 'rollup'
export type ChipTypeCurrent = 'current'

export interface IChipRollup {
  type: ChipTypeRollup
  count: number
  items: any[]
}

export interface IChip {
  type: ChipTypeRollup | ChipTypeCurrent
  [key: string]: any
}

export interface IChipCurrent {
  type: ChipTypeCurrent
  [key: string]: any
}
export type IChips = (IChipRollup | IChipCurrent)[]



export function InlineChips({ 
  chips,
  onRemove
}: {
  chips: any[],
  // onRemove: (index: number) => void
  onRemove: ({ id }:IOption) => void
}) {
  return <React.Fragment>
    {
      chips.map((item: any, i: any) => {
        return <Chip 
          key={`selected-${i}`}
          onClick={() => onRemove(i)}
        >
          {item.name}
        </Chip>
      })
    }
  </React.Fragment>
}

export interface ChipRollupProps {
  items: any[],
  allItems: any[]
  includeCurrentItemInList?: boolean
  onRemove: (s: any) => void
  onReorder: (prev: number, next: number) => void
}




export const ChipRollup: React.SFC<ChipRollupProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [visible, setVisibility] = React.useState<boolean>(false)

  const referenceRef = React.useRef<any>(null)
  const popperRef = React.useRef<any>(null)

  useOnClickOutside(popperRef, () => setVisibility(false))

  const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
    placement: "bottom",
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [64, 10],
        },
      },
      {
        name: 'computeStyles',
        options: {
          gpuAcceleration: false,
        },
      },
    ]
  })


  function handleToggle(event: any) {
    setVisibility((prev) => !prev)
  }

  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name',
      },
    ]
  }, [])


  const data = React.useMemo(() => {
    if ( props.includeCurrentItemInList ) {
      return props.allItems.reverse()
    }
    return props.items.reverse()
    
  }, [props.items, props.allItems])

  return <React.Fragment>
    <div 
      ref={referenceRef}
      className={cx('select-input-chip', 'select-input-chip--rollup', props.className)} 
      style={props.style}
      onClick={handleToggle}
    >
      <span>{props.children}</span>
    </div>

    <Popover styles={styles} attributes={attributes} ref={popperRef} visible={visible}>
      {
        <React.Suspense fallback={<div></div>}>
          <SortableList 
            columns={columns} 
            data={data} 
            onRemoveItem={props.onRemove} 
            onReorder={props.onReorder}
          />
        </React.Suspense>
      }
    </Popover>

    {
      // <Popover styles={styles} attributes={attributes} ref={popperRef} visible={visible}>
      //   {
      //     props.items.map((item: any,i) => {
      //       return (
      //         <div key={`popper-dropdown-item-${i}`} className={'popper-dropdown__list-item'}>
      //           <div className={'popper-dropdown__list-item-content'}>
      //             {item.name}
      //           </div>
      //           <div className={'popper-dropdown__list-item-actions'}>
      //             <button 
      //               tabIndex={-1}
      //               className={cx('popper-dropdown__list-item-action')} 
      //               type="button" 
      //               onClick={() => {
      //                 props.onRemove(i)
      //               }}
      //             >
      //               ✕
      //             </button>
      //           </div>
      //         </div>
      //       )
      //     })
      //   }
      // </Popover>
    }
  </React.Fragment>

}



export function InlineChipsWithRollup({ 
  chips,
  onRemove,
  onReorder
}: {
  chips: IChips,
  selected: any[],
  // onRemove: (index: number) => void,
  onRemove: ({ id }:IOption) => void,
  onReorder: (prev: number, next: number) => void,
}) {
  
  const allItems = React.useMemo(() => {
    return [].concat(...chips.map(({ items }: IChip) => items))
  }, [chips])

  return <React.Fragment>
    {
      chips.map((group: IChip, i: any) => {
        if ( group.type === 'rollup' ) {
          return <ChipRollup 
            key={`chip-rollup-${i}`}
            items={group.items}
            allItems={allItems}
            includeCurrentItemInList={true}
            onRemove={onRemove}
            onReorder={onReorder}
          >
            +{group.count}
          </ChipRollup>
          // return group.items.map((c: any, i: number) => {})
        } else if ( group.type === 'current' ) {
          return group.items.map((c: any, i: number) => {
            return <Chip 
              key={`chip-current-${i}`}
              onClick={() => {
                console.log('Remove this one?', i, c)
                onRemove(c)
              }}
            >
              {c.name}
            </Chip>
          })
        } else {
          return null
        }
      })
    }
  </React.Fragment>
}