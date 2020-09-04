// import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Select, { IconLoading, IconSearch, createCSSTheme } from '../.';
import { css } from 'emotion'

import './index.css'



const getCocktails = async (query: string) => {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`
  const response = await fetch(url, {
    method: 'GET'
  })
  const data = await response.json()

  const { drinks } = data
  return drinks.map((item: any) => ({ 
    id: item.idDrink,
    name: item.strDrink, 
    value: item.strDrink,
    thumb: item.strDrinkThumb,
    meta: [
      { id: "ingredient1", value: item.strIngredient1 },
      { id: "ingredient2", value: item.strIngredient2 },
      { id: "ingredient3", value: item.strIngredient3 },
    ].filter(({ value })=> !!value)
  }))
}


const theme = createCSSTheme()


const CustomOption = ({ item, className, style, onClick, ...props }: any) => {
  return <div className={'select-option'} onClick={onClick} >
    <div className="select-option__thumb-container">
      <img className="select-option__thumb" src={item.thumb} alt="" />
    </div>
    <div>
      <div>
        <span>{item.name}</span>
      </div>
      <div style={{ fontSize: 12, opacity: 0.75, margin: '6px -5px 0 -5px' }}>
        {
          item.meta && (item.meta as any[]).map(({ value }, m) => {
            return <span key={`meta-${m}`} style={{ margin: '0px 4px', padding: '1px 4px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>{value}</span>
          })
        }               
      </div>
    </div>
  </div>
}






const App = () => {
  const [selected, setSelected] = React.useState<any>([])
  const selectRef = React.createRef<any>()

  const onSelectedChange = (x: any) => console.log('onSelectedChange', x)
  const onInputChange = (x: any) => console.log('onInputChange', x)

  React.useEffect(() => {
    console.log('theme', theme)
  }, [selectRef])

  return (
    <div className="App">
      <div className={css`
        .CustomSelect {
          width: 500px;
          --select-input-max-width: none;
          --select-input-padding: 0.60rem;
          --select-input-icon-container-width: 40px;
          --select-input-font-size: 0.90rem;
          --select-input-font-color: rgba(15,15,15, 0.80);
          // --select-input-font-color: rgb(106,106,106);
          --select-input-border-color: rgba(152,152,152, 0.35);
          
          --select-input-icon-color: rgba(15,15,15, 0.80);
          // --select-input-icon-color: rgb(106,106,106);

          --select-input-placeholder-font-size: 0.90rem;
          --select-input-focus-border-color: rgba(63,160,251,1);
          --select-input-option-background-color: #f3f3f3;
          --select-input-option-background-color-hover: rgba(63,160,251,1);
          --select-input-option-active-background-color-hover: rgba(63,160,251,0.50);
          --select-input-option-color: inherit;
          --select-input-option-color-hover: white;
          --select-input-chip-font-size: 0.70rem;
          --select-input-chip-font-color: rgba(106,106,106, 1.0);
          --select-input-chip-background-color: rgba(239,239,239, 1.0);
          --select-input-chip-border-color: transparent;
        }
        .CustomSelect .select-input-chip__remove {
          border-left: none;
          margin-left: 0;
          background-color: inherit;
          padding: 2px 4px;
        }
      `}>
        <Select
          getOptions={getCocktails}
          className={'CustomSelect'}
          placeholder={'Search cocktails'}
          selected={[]}
          
          onSelectedChange={onSelectedChange}
          onInputChange={onInputChange}
          tabBehavior={'SELECT_HIGHLIGHTED_OPTION'}
          showSuggestion={false}
          debounceTimeout={0}
          deleteBehavior={'REMOVE_LAST_SELECTED_ON_EMPTY'}
          chipsOffset={4}
          components={{
            IconSearch: () => <IconSearch fill={'rgb(106,106,106)'} width={14} height={14} style={{ position: 'relative', top: 1 }}/>,
            IconLoading: () => <IconLoading fill={'rgba(160,22,230,1)'} width={14} height={14} />
          }}
        />
      </div>
    </div>
  )
}




ReactDOM.render(<App />, document.getElementById('root'));
