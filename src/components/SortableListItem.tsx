import * as React from 'react'
import cx from 'classnames'
import { Row as RowType } from 'react-table/index'
import { DragCard } from './DragCard'

interface SortableListItemProps {
  row: RowType
  index: number
  moveRow: any
}

export function SortableListItem({ row, index, moveRow, ...props }:SortableListItemProps) {

  const item: any = row.original

  return (
  <DragCard 
    key={row.id}
    index={index}
    id={row.id}
    moveCard={moveRow}
    className={'popper-dropdown__list-item'}
    {...props}
  >
    <div className={cx('popper-dropdown__list-item-drag-handle')}>☰</div>
    {row.cells.map((cell: any) => {
      return (
        <div className={'popper-dropdown__list-item-content'} {...cell.getCellProps()} >
          {
            cell.render('Cell')
          }
        </div>
      )
    })}
  </DragCard>
  )
}