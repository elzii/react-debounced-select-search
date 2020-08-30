import * as React from 'react'
import cx from 'classnames'
import computeScrollIntoView from 'compute-scroll-into-view'
import { useDebounce } from './hooks/useDebounce'
import update from 'immutability-helper'

// import { useRect } from './hooks/useRect'

import {
  IChip,
  IChipRollup,
  IChips,
  IChipCurrent,
} from './components/Chips'

import { components } from './components'
import { IOption, StatusIdle, StatusLoading, StatusError, SelectProps } from './index'

import log from './util/pretty-console-logger'
import { escapeRegExp } from './util/misc'

// import './variables.css'
import Styled from './Styles'

export const KEY_CODES = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  ENTER: 13,
  ESCAPE: 91,
  TAB: 9,
  BACKSPACE: 8,
  META: 91,
  ALT: 18,
  CTRL: 17,
  SHIFT: 16,
}

export const STATUS_TYPES = {
  IDLE: 'IDLE' as StatusIdle,
  LOADING: 'LOADING' as StatusLoading,
  ERROR: 'ERROR' as StatusError,
}


export const Select: React.FC<SelectProps> = (props) => {

  const { onInputChange, onSelectedChange } = props

  const [value, setValue] = React.useState<string>('')
  const [displayValue, setDisplayValue] = React.useState<string>('')
  const [ghostValue, setGhostValue] = React.useState<string>('')
  const [options, setOptions] = React.useState<IOption[]>([])
  const [selected, setSelected] = React.useState<any>(props.selected || [])
  const [highlighted, setHighlighted] = React.useState<number | null>(0)
  const [status, setStatus] = React.useState<string>('IDLE')

  const debouncedValue = useDebounce(value, props.debounceTimeout || 200)

  let inputRef = React.createRef<HTMLInputElement>()
  let optionsContainerRef = React.createRef<HTMLInputElement>()

  let chipsRef = React.createRef<HTMLDivElement>()
  const [chipsWidth, setChipsWidth] = React.useState<number>(0)

  // const selectedOptionNames = selected.map((s: any) => s.name.toLowerCase())
  const selectedOptionNames = React.useMemo(() => {
    return selected.map((s: any) => s.name.toLowerCase())
  }, [selected])

  React.useEffect(() => {
    log('⚛️ EFFECT', 'effect')('Mounted', props)
  }, [])

  const chips = React.useMemo(() => {
    // Rollup if more than 1
    if (selected.length > 1) {
      const others: IChip[] = selected.slice(0, selected.length - 1)
      const rollup: IChipRollup = {
        type: 'rollup',
        count: others.length,
        items: others,
      }
      const current: IChipCurrent = {
        type: 'current',
        items: selected.slice(-1),
      }

      const summary: IChips = [rollup, current]

      return summary
    }
    // Show as normal inline if only one
    if (selected.length === 1) {
      const current: IChipCurrent = {
        type: 'current',
        items: selected.slice(-1),
      }
      return [current]
    }

    // Return empty by default
    return [] as IChips
  }, [selected])


  const setFilteredOptions = React.useCallback((opts: any[]) => {
    const filteredOptions = opts.filter(({ name }) => {
      return !selectedOptionNames.includes(name.toLowerCase())
    })
    setOptions(filteredOptions)

    return () => setOptions
  },[selectedOptionNames])

  // Only used for dumping state
  // React.useEffect(() => {
  //   log('⚛️ EFFECT', 'effect')('selected', JSON.stringify(selected, null, 2))
  // }, [selected])

  React.useEffect(() => {
    if (props.width) {
      log('FIXME', 'warning')('Set CSS width from props')
      document.documentElement.style.setProperty(
        '--select-input-max-width',
        `${props.width}px`
      )
    }
  }, [props.width])

  React.useLayoutEffect(() => {
    const { current } = chipsRef
    if (!current) return

    let parentRect = (current.parentNode as HTMLDivElement).getBoundingClientRect()
    let rect = current.getBoundingClientRect()

    let xOffset = rect.x - parentRect.x

    setChipsWidth(rect.width + (xOffset - 10))
  }, [selected, chipsRef])

  const getSuggestedValue = React.useCallback(() => {
    // console.count('getSuggestedValue')
    
    let v = value.toLowerCase()
    const selected_names = (selected as IOption[]).map(({ name }) =>
      name.toLowerCase()
    )
    const opts = options
      .map(({ name }) => name.toLowerCase())
      .filter((name) => selected_names.indexOf(name) !== 0)

    const match = opts.find((name) =>
      new RegExp(`^${escapeRegExp(v)}`, 'i').test(name)
    )
    const matchIndex = opts.findIndex((name) =>
      new RegExp(`^${escapeRegExp(v)}`, 'i').test(name)
    )

    return !!match
      ? [
          match.replace(new RegExp(`^${escapeRegExp(v)}`, 'i'), value),
          matchIndex,
        ]
      : ['', null]
  }, [options, selected, value])

  const scrollOptionIntoViewAsNeeded = React.useCallback(() => {
    if (optionsContainerRef.current) {
      if (highlighted !== null) {
        let nextNode = (optionsContainerRef.current as Node).childNodes[
          highlighted
        ] as Element

        if (nextNode) {
          const actions = computeScrollIntoView(nextNode, {
            scrollMode: 'if-needed',
            block: 'nearest',
            inline: 'nearest',
          })

          if (actions.length) {
            log('🖱️ SCROLL INTO VIEW', 'scroll')(actions)
          }

          actions.forEach(({ el, top, left }) => {
            el.scrollTop = top
            el.scrollLeft = left
          })
        }
      }
    } else {
      // Shouldnt hit this block
    }
  }, [highlighted, optionsContainerRef])

  // Fetch our options on the debounced value
  React.useEffect(() => {
    // TODO: Do we need this?
    setHighlighted(null)

    if (debouncedValue) {
      
      const setOpts = async (cb?: () => void) => {
        log('🌐 REQUEST: getOptions', 'request')(`"${value}"`)

        setStatus(STATUS_TYPES.LOADING)
        try {
          const opts = await props.getOptions(value)
          setFilteredOptions(opts)
          setStatus(STATUS_TYPES.IDLE)
        } catch (ex) {
          setStatus(STATUS_TYPES.ERROR)
          console.log('ex', ex)
        }

        cb && cb()
      }
      setOpts(() => {
        setHighlighted(0)
      })

    } else {
      log('⚛️ EFFECT', 'effect')('No input value, clear options')
      setOptions([])
    }
  }, [debouncedValue])

  // React.useEffect(() => {
  //   if ( (props.selected as any[]).length ) {
  //     setSelected(props.selected)  
  //     log('⚛️ EFFECT', 'effect')('Set selected from props', props.selected)
  //   }
  // }, [props.selected])

  React.useEffect(() => {
    log('⚛️ EFFECT', 'effect')('onSelectedChange', selected)
    onSelectedChange && onSelectedChange(selected)
  }, [selected, onSelectedChange])

  // Generate our ghost suggestion value
  React.useEffect(() => {
    if (props.showSuggestion) {
      if (value === '') {
        setGhostValue('')
      } else {
        const [gv] = getSuggestedValue()
        setGhostValue(gv as string)
      }
    }
  }, [value, options, getSuggestedValue, props.showSuggestion])

  React.useEffect(() => {
    scrollOptionIntoViewAsNeeded()
  }, [highlighted, scrollOptionIntoViewAsNeeded])

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value
      onInputChange && onInputChange(value)
      setValue(value)
      setDisplayValue(value)
    },
    [onInputChange]
  )

  const onRemoveSelectedOptionByIndex = (index: number) => {
    // console.log('onRemoveSelectedOptionByIndex', index, selected)
    setSelected((prev: any) => prev.filter((_: any, i: number) => i !== index))
  }

  const onRemoveSelectedOptionByItemId = ({ id }:IOption) => {
    // console.log('onRemoveSelectedOptionByItemId', id, selected)
    setSelected((prev: any) => prev.filter((item: any) => item.id !== id))

    // Focus after
    if ( props.focusInputAfterRemovingSelectedItem ) {
      inputRef.current?.focus()
    }
  }

  const onReorderSelected = React.useCallback((prev: number, next: number) => {
    // Make sure to reverse order back
    // const dragIndex = prev
    // const hoverIndex = next

    const dragIndex = (selected.length-1) - prev
    const hoverIndex = (selected.length-1) - next
    
    const dragCard = selected[dragIndex]

    const nextSelected = update(selected, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragCard],
      ],
    })

    setSelected(nextSelected)
    
  }, [selected, options])

  const onClickOption = (item: any, index: number) => {
    setOptions((prev) => prev.filter(({ name }) => item.name !== name))
    setSelected((prev: any) => [...prev, options[index]])
  }

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      let value = (event.target as any).value

      switch (event.which) {
        case KEY_CODES.UP: {
          event.preventDefault()

          if (props.cycleOptions) {
            setHighlighted((prev) => {
              let nextIndex =
                prev === 0
                  ? options.length - 1
                  : prev !== null
                  ? prev - 1
                  : prev
              
              log('⬆ UP  ', 'key')('Prev:', prev, 'Next:', `${nextIndex}/${options.length - 1}`)

              return nextIndex
            })
          } else {
            setHighlighted((prev) =>
              prev === 0 ? null : prev !== null ? prev - 1 : prev
            )
          }

          break
        }
        case KEY_CODES.DOWN: {
          event.preventDefault()

          if (props.cycleOptions) {
            setHighlighted((prev) => {
              // let nextIndex = prev !== null
              //   ? prev === options.length - 1 ? 0 : prev + 1
              //   : 0

              let nextIndex
              if (prev === null) nextIndex = 0
              else if (prev === 0) nextIndex = 1
              else if (prev === options.length - 1) nextIndex = 0
              else nextIndex = prev + 1

              log('⬇ DOWN', 'key')('Prev:', prev, 'Next:', `${nextIndex}/${options.length - 1}`)

              return nextIndex
            })

            // @TODO: Option to fill display value with highighted option
          } else {
            setHighlighted((prev) =>
              prev === null ? 0 : prev < options.length - 1 ? prev + 1 : prev
            )
          }

          break
        }
        case KEY_CODES.ENTER: {
          event.preventDefault()

          let index = highlighted as number

          if (index !== null) {
            setSelected((prev: any) => [...prev, options[index]])
            setValue('')
            setDisplayValue('')
          }

          break
        }
        case KEY_CODES.BACKSPACE: {
          // If we're on the input, and the value is empty, delete the previous chip
          if (props.deleteBehavior === 'REMOVE_LAST_SELECTED_ON_EMPTY') {
            if (highlighted === null && value === '') {
              setSelected((prev: any) => prev.slice(0, prev.length - 1))
              log('⌫ DELETE', 'key')(`REMOVE_LAST_SELECTED_ON_EMPTY`)
            }
          }

          break
        }
        case KEY_CODES.TAB: {


          if (!!value) {
            if (highlighted === null) {
              console.log('TABBED IN THE INPUT, IGNORE')
            } else {
              // Only block event if we have results up
              event.preventDefault()

              const [suggestedValue, suggestedIndex] = getSuggestedValue()

              if (suggestedIndex !== null) {
                if (props.tabBehavior) {
                  if (props.tabBehavior === 'SEARCH_SUGGESTED') {

                    log('▷ TAB', 'key')('SEARCH_SUGGESTED', `Suggested Value:`, suggestedValue, `Suggested Index:`, suggestedIndex)

                    if (!!suggestedValue) {
                      setValue(suggestedValue as string)
                      setDisplayValue(suggestedValue as string)
                    }
                  }

                  if (
                    props.tabBehavior === 'SELECT_SUGGESTED' &&
                    props.showSuggestion
                  ) {

                    log('▷ TAB', 'key')('SELECT_SUGGESTED', 
                      `Suggested Value:`, suggestedValue, 
                      `Suggested Index:`, suggestedIndex
                    )

                    setSelected((prev: any) => [
                      ...prev,
                      options[suggestedIndex as number],
                    ])

                    setValue('')
                    setDisplayValue('')
                  }

                  if (props.tabBehavior === 'SELECT_FIRST_OPTION') {

                    log('▷ TAB', 'key')('SELECT_FIRST_OPTION', options[0])

                    setSelected((prev: any) => [...prev, options[0]])

                    setValue('')
                    setDisplayValue('')
                  }

                  if (props.tabBehavior === 'SELECT_HIGHLIGHTED_OPTION') {

                    log('▷ TAB', 'key')('SELECT_HIGHLIGHTED_OPTION', highlighted, options[highlighted])

                    setSelected((prev: any) => [...prev, options[highlighted]])

                    setValue('')
                    setDisplayValue('')
                  }
                }
              }
            }

            // Double tap TAB completes like ENTER
            if (value === ghostValue) {
              console.log('DOUBLE TAP!')
            }
          }
          break
        }

        case KEY_CODES.LEFT: {
          break;
        }
        case KEY_CODES.RIGHT: {
          break;
        }

        default: {
          // console.log(event.key, event.which)
          break
        }
      }
    },
    [options, highlighted, setSelected, value, ghostValue]
  )


  const Components = React.useMemo(() => ({
    ...components,
    ...props.components
  }), [])

  // console.count('Rendered')

  // RENDER
  return (
    <Styled>
    <div className={cx('select', props.className)} style={{}}>
      <div className="select-input-container">
        <div ref={chipsRef} className="select-input-chips">
          {
            // <InlineChips chips={selected} onRemove={onRemoveSelectedOptionByIndex} />
          }
          {
            <Components.Chips
              chips={chips}
              // onRemove={onRemoveSelectedOptionByIndex}
              onRemove={onRemoveSelectedOptionByItemId}
              onReorder={onReorderSelected}
              selected={selected}
            />
          }
        </div>

        <div className="select-icon-container">
          <div
            className="select-icon"
            style={{ opacity: status === 'LOADING' ? 1 : 0 }}
          >
            <Components.IconLoading />
          </div>
          <div
            className="select-icon"
            style={{ opacity: status === 'LOADING' ? 0 : 1 }}
          >
            <Components.IconSearch />
          </div>
        </div>
        <input
          className="select-input--ghost"
          type="text"
          disabled={true}
          tabIndex={-1}
          value={ghostValue}
          onChange={() => null}
          autoComplete="off"
          spellCheck={false}
          style={{
            paddingLeft: chipsWidth,
          }}
        />
        <input
          ref={inputRef}
          className={cx('select-input', {
            'select-input--hide-placeholder': selected.length >= 1,
          })}
          type="text"
          placeholder={props.placeholder}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          autoFocus={props.autoFocus}
          value={displayValue}
          autoComplete="off"
          spellCheck={false}
          style={{
            paddingLeft: chipsWidth,
          }}
        />
      </div>
      <Components.Options
        ref={optionsContainerRef}
        style={{ opacity: options.length ? 1 : 0 }}
      >
        {options.map((option: IOption, i) => {
          const highlight = highlighted === i
          const className = cx('select-option-container', {
            'select-option-container--highlighted': highlight,
          })
          const props = {
            item: option,
            highlight,
            index: i,
            className,
          }
          return (
            <Components.Option
              key={`option-${i}`}
              onClick={() => {
                onClickOption(option, i)
              }}
              {...props}
            />
          )
        })}
      </Components.Options>
    </div>
    </Styled>
  )
}

Select.defaultProps = {
  autoFocus: true,
  debounce: true,
  debounceTimeout: 200,
  cycleOptions: true,
  inlineChips: true,
  tabBehavior: 'SELECT_SUGGESTED',
  deleteBehavior: 'REMOVE_LAST_SELECTED_ON_EMPTY',
  showSuggestion: true,
  width: 500,
  debugPortal: false,
  focusInputAfterRemovingSelectedItem: true,
  className: ''
}
