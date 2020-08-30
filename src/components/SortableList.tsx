import * as React from 'react'
import cx from 'classnames'
import {
  useTable,
  useResizeColumns,
  useFlexLayout,
  // useRowSelect,
  useSortBy
} from 'react-table'

import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { SortableListItem } from './SortableListItem'


// const headerProps = (props: any, { column }: any) => getStyles(props, column.align)
// const cellProps = (props: any, { cell }: any) => getStyles(props, cell.column.align)
// const getStyles = (props: any, align = 'left') => [
//   props,
//   {
//     style: {
//       justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
//       alignItems: 'flex-start',
//       display: 'flex',
//     },
//   },
// ]





export function SortableList({ columns, data, onRemoveItem, onReorder }:{ columns: any, data: any, onRemoveItem: (item: any) => void, onReorder: (prev: number, next: number) => void }) {
  
  // const moveRow = (dragIndex: any, hoverIndex: any) => {
    
  // }

  const defaultColumn = React.useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      maxWidth: 200, // maxWidth is only used as a limit for resizing
    }),
    []
  )

  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useResizeColumns,
    useFlexLayout,
    hooks => {
      hooks.columns.push(columns => [
        ...columns,
        {
          id: 'remove',
          // width: 32,
          maxWidth: 24,
          minWidth: 24,
          Cell: ({ row }) => {
            return (
              <div className={'popper-dropdown__list-item-actions'}>
                <button 
                  tabIndex={-1}
                  className={cx('popper-dropdown__list-item-action')} 
                  type="button" 
                  onClick={() => onRemoveItem(row.original)}
                >
                  ✕
                </button>
              </div>
            )
          }
        },
      ])
    },
    useSortBy,
  )
  

  return (
    <DndProvider backend={HTML5Backend}>
      <div {...getTableProps()} className="">
        {headerGroups.map(headerGroup => (
          <div className={'popper-dropdown__list-header'} 
            {...headerGroup.getHeaderGroupProps()}
          >
            {headerGroup.headers.map(column => (
              <div 
                {...column.getHeaderProps()}
                {...column.getHeaderProps(column.getSortByToggleProps())}
              >
                {column.render('Header')}
                <span style={{ fontSize: 10 }}>
                  {column.isSorted
                    ? column.isSortedDesc
                      ? ' ▼'
                      : ' ▲'
                    : ''}
                </span>
              </div>
            ))}
          </div>
        ))}
        {rows.map((row,index) => {
          // @ts-ignore
          return prepareRow(row) || (
            <SortableListItem
              index={index}
              row={row}
              moveRow={onReorder}
              {...row.getRowProps()}
            />
          )
        })}
      </div>
    </DndProvider>
  )
}


export default SortableList