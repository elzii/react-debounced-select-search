import * as React from 'react'
import cx from 'classnames'
import computeScrollIntoView from 'compute-scroll-into-view'
import { useDebounce } from './hooks/useDebounce'
import { useOnClickOutside } from './hooks/useOnClickOutside'
import update from 'immutability-helper'

// import { useRect } from './hooks/useRect'

import {
  IChip,
  IChipRollup,
  IChips,
  IChipCurrent,
} from './components/Chips'

import { components } from './components'
import { IOption, StatusIdle, StatusLoading, StatusError, SelectProps, NavigationDirection } from './index'

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
  ESCAPE: 27,
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


function SearchSelect({
  initialValue = '',
  autoFocus = false,
  debounceTimeout = 200,
  debounce = true,
  onSelectedChange,
  onInputChange,
  onOptionsChange,
  
  onBlur,
  onFocus,
  
  cycleOptions = true,
  inlineChips = true,
  tabBehavior = 'SELECT_SUGGESTED',
  deleteBehavior = 'REMOVE_LAST_SELECTED_ON_EMPTY',
  showSuggestion = true,
  width = 500,
  debugPortal = false,
  focusInputAfterRemovingSelectedItem = true,
  hideOptionsAfterSelection = false,
  className = '',
  chipsOffset = 8,
  isMulti = true,
  placeholder = '',
  selected = [],
  chip,

  ...props
}: SelectProps) {

  const [value, setValue] = React.useState<string>(initialValue)
  const [displayValue, setDisplayValue] = React.useState<string>(initialValue)
  const [suggestedValue, setSuggestedValue] = React.useState<string>('')
  const [options, setOptions] = React.useState<IOption[]>([])
  const [focused, setFocused] = React.useState<boolean>(autoFocus)
  const [optionsVisible, setOptionsVisible] = React.useState<boolean>(false)
  const [selectedOptions, setSelectedOptions] = React.useState<any>(selected)
  const [highlighted, setHighlighted] = React.useState<number | null>(0)
  const [status, setStatus] = React.useState<string>('IDLE')

  const debouncedValue = useDebounce(value, debounceTimeout)

  let inputRef = React.createRef<HTMLInputElement>()
  let optionsContainerRef = React.createRef<HTMLInputElement>()

  useOnClickOutside(optionsContainerRef, () => {
    // Do nothing
  })

  let chipsRef = React.createRef<HTMLDivElement>()
  const [chipsWidth, setChipsWidth] = React.useState<number>(0)

  

  React.useEffect(() => {
    log('⚛️ EFFECT', 'effect')('Mounted', props)
  }, [])

  const Components = React.useMemo(() => ({
    ...components,
    ...props.components
  }), [])

  const chips = React.useMemo(() => {
    
    // Rollup if more than 1
    if (selectedOptions.length > 1) {
      const others: IChip[] = selectedOptions.slice(0, selectedOptions.length - 1)
      const rollup: IChipRollup = {
        type: 'rollup',
        count: others.length,
        items: others,
      }
      const current: IChipCurrent = {
        type: 'current',
        items: selectedOptions.slice(-1),
      }

      const summary: IChips = [rollup, current]

      return summary
    }
    // Show as normal inline if only one
    if (selectedOptions.length === 1) {
      const current: IChipCurrent = {
        type: 'current',
        items: selectedOptions.slice(-1),
      }
      return [current]
    }

    // Return empty by default
    return [] as IChips
  }, [selectedOptions])


  // Only used for dumping state
  // React.useEffect(() => {
  //   log('⚛️ EFFECT', 'effect')('selected', JSON.stringify(selected, null, 2))
  // }, [selected])

  React.useEffect(() => {
    if (width) {
      log('FIXME', 'warning')('Set CSS width from props')
      document.documentElement.style.setProperty(
        '--select-input-max-width',
        `${width}px`
      )
    }
  }, [width])

  const selectedOptionValues = React.useMemo(() => {
    return selectedOptions.length > 0 ? selectedOptions.map((s: any) => s.value) : []
  }, [selectedOptions])

  const selectedOptionNames = React.useMemo(() => {
    return selectedOptions.length > 0 ? selectedOptions.map((s: any) => s.name) : []
  }, [selectedOptions])

  const filteredOptions = React.useMemo(() => {
    const filtered = isMulti
      ? options.filter(({ value }) => selectedOptionValues.indexOf(value) === -1)
      : options
    return filtered
  }, [options, selectedOptionValues, isMulti])

  // const filterOptionsByUnselectedNames = React.useMemo(() => {
  //   return options.filter(({ name }) => !selectedOptionNames.includes(name.toLowerCase()))
  // }, [options, selectedOptionNames])

  // const filteredOptions = options.filter(({ value }) => {
  //   return selectedOptions.map((s: any) => s.value).indexOf(value) === -1
  // })

  React.useLayoutEffect(() => {
    const { current } = chipsRef
    if (!current) return

    let parentRect = (current.parentNode as HTMLDivElement).getBoundingClientRect()
    let rect = current.getBoundingClientRect()

    let xOffset = rect.x - parentRect.x

    if ( Components.IconSearch !== null ) {
      setChipsWidth(rect.width + (xOffset - (chipsOffset ? chipsOffset : 0)))  
    } else {
      
    }
  }, [chipsRef])

  const getSuggestedValue = React.useCallback(() => {
    // console.count('getSuggestedValue')
    
    let v = value.toLowerCase()
    const selected_names = (selectedOptions as IOption[]).map(({ name }) =>
      name.toLowerCase()
    )
    const opts = filteredOptions
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
  }, [filteredOptions, selectedOptions, value])

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

  React.useEffect(() => {
    scrollOptionIntoViewAsNeeded()
  }, [highlighted, scrollOptionIntoViewAsNeeded])

  // Fetch our options on the debounced value
  React.useEffect(() => {
    // TODO: Do we need this?
    // setHighlighted(null)

    if (!!debouncedValue && (debouncedValue === displayValue) && focused) {

      log('getOptions', 'request')(`Fetching, term is ${debouncedValue}`)

      setStatus(STATUS_TYPES.LOADING)

      props.getOptions(debouncedValue)
        .then(res => setOptions(res))
        .then(() => setOptionsVisible(true))
        .then(() => setHighlighted(0))
        .then(() => setStatus(STATUS_TYPES.IDLE))
        .catch((ex) => {
          setStatus(STATUS_TYPES.ERROR)
          console.log('ex', ex)
        })

    } else {
      if (hideOptionsAfterSelection || !isMulti) {
        // setOptionsVisible(false)
        setOptions([])
        setHighlighted(null)
      } else {
        console.log('Keep the options open')
      }
    }
  }, [debouncedValue, displayValue, focused, props.getOptions])



  React.useEffect(() => {
    if ( filteredOptions.length ) {
      onOptionsChange && onOptionsChange(filteredOptions)
    }
  }, [filteredOptions])


  React.useEffect(() => {
    log('⚛️ EFFECT', 'effect')('onSelectedChange', selectedOptions)
    onSelectedChange && onSelectedChange(selectedOptions)
  }, [selectedOptionValues])

  // Generate our ghost suggestion value
  React.useEffect(() => {
    if (showSuggestion) {
      if (value === '') {
        setSuggestedValue('')
      } else {
        const [gv] = getSuggestedValue()
        setSuggestedValue(gv as string)
      }
    }
  }, [value, getSuggestedValue, showSuggestion])

  
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let val = event.target.value
      onInputChange && onInputChange(val)
      
      setDisplayValue(val)
      setValue(val)
      
      if ( val === '' && !isMulti ) {
        // setOptionsVisible(false)
        setOptions([])
        // TODO: Should only clear these if not have a value is a valid state...
        // setSelectedOptions([])
      }
    },
    [onInputChange, setValue, setDisplayValue, isMulti]
  )
  const handleFocus = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFocused(true)
      setOptionsVisible(true)

      onFocus && onFocus(event)
    },
    []
  )

  const handleBlur = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFocused(false)
      setOptionsVisible(false)

      // If we didnt change the selection, and its not a multiselect,
      // restore the last display value
      if ( !isMulti && displayValue !== selectedOptionNames ) {
        setDisplayValue(selectedOptionNames)
      }

      if ( isMulti ) {
        setOptions([])
      }

      onBlur && onBlur(event)
    },
    [displayValue, selectedOptionNames, isMulti]
  )

  // const onRemoveSelectedOptionByIndex = (index: number) => {
  //   // console.log('onRemoveSelectedOptionByIndex', index, selected)
  //   setSelected((prev: any) => prev.filter((_: any, i: number) => i !== index))
  // }

  const onRemoveSelectedOptionByItemId = ({ id }:IOption) => {
    // console.log('onRemoveSelectedOptionByItemId', id, selected)
    setSelectedOptions((prev: any) => prev.filter((item: any) => item.id !== id))

    // Focus after
    if ( focusInputAfterRemovingSelectedItem ) {
      inputRef.current?.focus()
    }
  }

  const onReorderSelected = React.useCallback((prev: number, next: number) => {
    // Make sure to reverse order back
    // const dragIndex = prev
    // const hoverIndex = next

    const dragIndex = (selectedOptions.length-1) - prev
    const hoverIndex = (selectedOptions.length-1) - next
    
    const dragCard = selectedOptions[dragIndex]

    const nextSelected = update(selectedOptions, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragCard],
      ],
    })

    setSelectedOptions(nextSelected)
    
  }, [selectedOptions])

  const onClickOption = React.useCallback((item: any, index: number) => {
    const selectedOption = filteredOptions[index]
    // setOptions((prev) => prev.filter(({ name }) => item.name !== name))
  
    setSelectedOptions((prev: any) => [...prev, selectedOption])
    setDisplayValue('')
    setSuggestedValue('')
      
    inputRef.current && inputRef.current.focus()

  }, [filteredOptions])
  
  
  const onClearSelection = React.useCallback(() => {
    setSelectedOptions([])
    setOptions([])
    setValue('')
    setDisplayValue('')

    inputRef.current?.focus()
  }, [])

  

  const navigateOptionsList = React.useCallback((direction: NavigationDirection) => {

    if ( filteredOptions.length === 1 ) {
      return 
    }

    switch(direction) {
      case 'up': {

        if (cycleOptions) {
          setHighlighted((prev) => {
            let nextIndex =
              prev === 0
                ? filteredOptions.length - 1
                : prev !== null
                ? prev - 1
                : prev
            
            log('⬆ UP  ', 'key')('Prev:', prev, 'Next:', `${nextIndex}/${filteredOptions.length - 1}`)

            return nextIndex
          })
        } else {
          setHighlighted((prev) =>
            prev === 0 ? null : prev !== null ? prev - 1 : prev
          )
        }

        break
      }
      case 'down': {
        if (cycleOptions) {
          setHighlighted((prev) => {
            // let nextIndex = prev !== null
            //   ? prev === filteredOptions.length - 1 ? 0 : prev + 1
            //   : 0

            let nextIndex
            if (prev === null) nextIndex = 0
            else if (prev === 0) nextIndex = 1
            else if (prev === filteredOptions.length - 1) nextIndex = 0
            else nextIndex = prev + 1

            log('⬇ DOWN', 'key')('Prev:', prev, 'Next:', `${nextIndex}/${filteredOptions.length - 1}`)

            return nextIndex
          })

          // @TODO: Option to fill display value with highighted option
        } else {
          setHighlighted((prev) =>
            prev === null ? 0 : prev < filteredOptions.length - 1 ? prev + 1 : prev
          )
        }
        break
      }
      default: {
        break
      }
    }
  }, [highlighted, filteredOptions])

  const onKeyDownSingle = React.useCallback((event: React.KeyboardEvent) => {
    let val = (event.target as any).value

    switch (event.keyCode) {
      case KEY_CODES.ESCAPE: {
        setOptionsVisible(false)
        break;
      }
      case KEY_CODES.UP: {
        event.preventDefault()
        navigateOptionsList('up')
        break
      }
      case KEY_CODES.DOWN: {
        event.preventDefault()
        navigateOptionsList('down')
        break
      }
      case KEY_CODES.ENTER: {
        event.preventDefault()

        let index = highlighted as number

        log('ENTER', 'key')(index, filteredOptions)

        if (index !== null && filteredOptions.length > 0) {
          setSelectedOptions(() => [filteredOptions[index]])
          setValue('')
          setDisplayValue(filteredOptions[index].name)

          if ( filteredOptions.length <= 2 ) {
            setHighlighted(0)
          }

        }

        break
      }
      case KEY_CODES.BACKSPACE: {
        log('⌫ DELETE', 'key')
        break
      }
      case KEY_CODES.TAB: {
        // event.preventDefault()

        if ( highlighted === null ) {
          log('▷ TAB', 'key')('Normal tab behavior')
        }
        break;
      }
      default: {
        log('KEY', 'key')(event.keyCode, event.key)
        return
      }
    }

  }, [highlighted, setSelectedOptions, suggestedValue, filteredOptions])

  const onKeyDownMulti = React.useCallback((event: React.KeyboardEvent) => {
    let val = (event.target as any).value

    switch (event.keyCode) {
      case KEY_CODES.ESCAPE: {
        setOptionsVisible(false)
        break;
      }

      case KEY_CODES.UP: {
        event.preventDefault()
        navigateOptionsList('up')
        break
      }
      case KEY_CODES.DOWN: {
        event.preventDefault()
        navigateOptionsList('down')
        break
      }
      case KEY_CODES.ENTER: {
        event.preventDefault()

        let index = highlighted as number

        if (index !== null && filteredOptions.length > 0) {
          setSelectedOptions((prev: any) => [...prev, filteredOptions[index]])
          setValue('')
          setDisplayValue('')
          if ( filteredOptions.length <= 2 ) {
            setHighlighted(0)
          }
        }

        break
      }
      case KEY_CODES.BACKSPACE: {
        // If we're on the input, and the value is empty, delete the previous chip
        
        if (deleteBehavior === 'REMOVE_LAST_SELECTED_ON_EMPTY') {
          if (val === '') {
            setSelectedOptions((prev: any) => prev.slice(0, prev.length - 1))
            log('⌫ DELETE', 'key')(`REMOVE_LAST_SELECTED_ON_EMPTY`)
          }
        }

        break
      }
      case KEY_CODES.TAB: {

        if (!!val) {
          if (highlighted === null) {
            console.log('TABBED IN THE INPUT, IGNORE')
          } else {
            // Only block event if we have results up
            event.preventDefault()

            const [suggestedValue, suggestedIndex] = getSuggestedValue()

            if (suggestedIndex !== null) {
              if (tabBehavior) {
                if (tabBehavior === 'SEARCH_SUGGESTED') {

                  log('▷ TAB', 'key')('SEARCH_SUGGESTED', `Suggested Value:`, suggestedValue, `Suggested Index:`, suggestedIndex)

                  if (!!suggestedValue) {
                    setValue(suggestedValue as string)
                    setDisplayValue(suggestedValue as string)
                  }
                }

                if (
                  tabBehavior === 'SELECT_SUGGESTED' &&
                  showSuggestion
                ) {

                  log('▷ TAB', 'key')('SELECT_SUGGESTED', 
                    `Suggested Value:`, suggestedValue, 
                    `Suggested Index:`, suggestedIndex
                  )

                  setSelectedOptions((prev: any) => [
                    ...prev,
                    filteredOptions[suggestedIndex as number],
                  ])

                  setValue('')
                  setDisplayValue('')
                }

                if (tabBehavior === 'SELECT_FIRST_OPTION') {

                  log('▷ TAB', 'key')('SELECT_FIRST_OPTION', filteredOptions[0])

                  setSelectedOptions((prev: any) => [...prev, filteredOptions[0]])

                  setValue('')
                  setDisplayValue('')
                }

                if (tabBehavior === 'SELECT_HIGHLIGHTED_OPTION') {

                  log('▷ TAB', 'key')('SELECT_HIGHLIGHTED_OPTION', highlighted, filteredOptions[highlighted])

                  setSelectedOptions((prev: any) => [...prev, filteredOptions[highlighted]])

                  setValue('')
                  setDisplayValue('')
                }

                
              }
            }
          }

          // Double tap TAB completes like ENTER
          if (val === suggestedValue) {
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
        return
      }
    }
  }, [highlighted, setSelectedOptions, suggestedValue, filteredOptions])


  

  // console.count('Rendered')

  // RENDER
  return (
    <Styled>
    <div className={cx('select', className)} style={{ ...props.style }}>

      <div className="select-input-container">
        <Components.ClearSelection 
          onClick={onClearSelection} 
          style={{ 
            opacity: selectedOptions.length ? 1 : 0
          }}
        />

        <div ref={chipsRef} className="select-input-chips">
          {
            // <InlineChips chips={selected} onRemove={onRemoveSelectedOptionByIndex} />
          }
          {
            isMulti && <>
              <Components.Chips
                chips={chips}
                // onRemove={onRemoveSelectedOptionByIndex}
                onRemove={onRemoveSelectedOptionByItemId}
                onReorder={onReorderSelected}
                selected={selectedOptions}
              />
            </>
          }
          {
            !!chip && <>
              <Components.Chips
                chips={[{
                  type: 'current',
                  items: [chip]
                }]}
                // onRemove={onRemoveSelectedOptionByIndex}
                onRemove={() => props.onRemoveChip && props.onRemoveChip(chip)}
                onReorder={() => null}
                selected={[]}
              />
            </>
          }
        </div>

        <div className="select-icon-container">
          <div
            className="select-icon"
            style={{ opacity: status === 'LOADING' ? 1 : 0 }}
          >
            {
              Components.IconLoading && <Components.IconLoading />
            }
          </div>
          <div
            className="select-icon"
            style={{ opacity: status === 'LOADING' ? 0 : 1 }}
          >
            {
              Components.IconSearch && <Components.IconSearch selected={selectedOptions} />
            }
          </div>
        </div>
        <input
          className="select-input--ghost"
          type="text"
          disabled={true}
          tabIndex={-1}
          value={suggestedValue}
          onChange={() => null}
          // autoComplete="off"
          // @ts-ignore
          autoComplete="disabled" // Chrome ignores "off" and false
          spellCheck={false}
          style={{
            ...(!!Components.IconSearch ? { paddingLeft: chipsWidth } : {}),
          }}
        />
        <input
          ref={inputRef}
          className={cx('select-input', {
            'select-input--hide-placeholder': selectedOptions.length >= 1,
          })}
          type="text"
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={isMulti ? onKeyDownMulti : onKeyDownSingle}
          autoFocus={autoFocus}
          value={displayValue}
          // autoComplete="off"
          // @ts-ignore
          autoComplete="disabled" // Chrome ignores "off" and false
          spellCheck={false}
          style={{
            ...(!!Components.IconSearch ? { paddingLeft: chipsWidth } : {})
          }}
        />
      </div>
      <Components.Options
        ref={optionsContainerRef}
        style={{ 
          display: optionsVisible ? 'block' : 'none',
          opacity: optionsVisible ? 1 : 0
        }}
      >
        {
          filteredOptions
            .map((option: IOption, i) => {
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
          }
        )}
      </Components.Options>
    </div>
    </Styled>
  )
}



export const Select = React.forwardRef(SearchSelect)