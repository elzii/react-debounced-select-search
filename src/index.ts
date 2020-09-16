// import { ComponentType } from 'react'
// export { Select }  from './Select'
import { IconLoading } from './icons/Loading.svg'
import { IconSearch } from './icons/Search.svg'
import { IconDelete } from './icons/Delete.svg'
import { Select } from './Select'
export { createCSSTheme } from './Styles'
import {
  IChipCurrent,
} from './components/Chips'

export {
  Select,
  IconLoading,
  IconSearch,
  IconDelete,
}

export default Select



// export interface OptionTypeBase {
//   [key: string]: any
// }
// export type OptionType = { [key: string]: any }
// export type OptionsType<OptionType extends OptionTypeBase> = ReadonlyArray<OptionType>
// export interface GroupType<OptionType extends OptionTypeBase> {
//   options: OptionsType<OptionType>
//   [key: string]: any
// }
// export type ValueType<OptionType extends OptionTypeBase> = OptionType | OptionsType<OptionType> | null | undefined
// export type ComponentsProps = { [key in string]: any }
// export type SelectComponentsConfig<OptionType extends OptionTypeBase> = Partial<SelectComponents<OptionType>>
// export interface SelectComponents<OptionType extends OptionTypeBase> {
//   Options?: ComponentType<OptionType>
//   Option?: ComponentType<OptionType>
//   IconLoading?: ComponentType<OptionType>
//   IconSearch?: ComponentType<OptionType>
// }

export interface IComponents {
  Options?: (props: any) => React.ReactElement
  Option?: (props: any) => React.ReactElement
  IconLoading?: (props: any) => React.ReactElement
  IconSearch?: (props: any) => React.ReactElement
}

export type StatusIdle = 'IDLE'
export type StatusLoading = 'LOADING'
export type StatusError = 'ERROR'
export type StatusType = StatusIdle | StatusLoading | StatusError | string

export interface IOption {
  name: string,
  value: any,
  id: string | number,
  [key: string]: any
}

export interface SelectProps {
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  getOptions: (query: string) => Promise<any>
  onInputChange?: (value: string) => void
  onSelectedChange?: (value: string) => void
  onOptionsChange?: (options: IOption[]) => void
  onSelect?: (item: any, selected: any[]) => void
  onFocus?: (event: any) => void
  onBlur?: (event: any) => void
  components?: IComponents
  autoFocus?: boolean
  debounce?: boolean
  debounceTimeout?: number
  cycleOptions?: boolean
  selected?: IOption[]
  inlineChips?: boolean
  tabBehavior?: TabBehavior | TabBehavior[]
  deleteBehavior?: DeleteBehavior | DeleteBehavior[]
  showSuggestion?: boolean
  width?: number
  debugPortal?: boolean
  focusInputAfterRemovingSelectedItem?: boolean
  hideOptionsAfterSelection?: boolean
  alwaysShowOptionsOnFocus?: boolean
  chipsOffset?: number
  isMulti?: boolean
  initialValue?: string
  chip?: IOption
  onRemoveChip?: (chip: any) => void
}


export type TabBehavior =
  | 'SELECT_SUGGESTED'
  | 'SEARCH_SUGGESTED'
  | 'SELECT_FIRST_OPTION'
  | 'SELECT_HIGHLIGHTED_OPTION'

export type DeleteBehavior =
  | 'REMOVE_LAST_SELECTED_ON_EMPTY'
  | null

export type NavigationDirection = 'down' | 'up' | 'left' | 'right'