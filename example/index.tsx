import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Select,  createCSSTheme } from '../.';
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
          --select-input-option-background-color: #f3f3f3;
          --select-input-option-background-color-hover: #ff0000;
          --select-input-option-active-background-color-hover: #ffff00;
        }
      `}>
        <Select
          getOptions={getCocktails}
          className={'CustomSelect'}
          placeholder={'Search cocktails'}
          selected={[]}
          showSuggestion={true}
          onSelectedChange={onSelectedChange}
          onInputChange={onInputChange}
          tabBehavior={'SELECT_HIGHLIGHTED_OPTION'}
          debounceTimeout={0}
          deleteBehavior={'REMOVE_LAST_SELECTED_ON_EMPTY'}
          // components={{
          //   Option: CustomOption
          // }}
        />
      </div>
    </div>
  )
}




ReactDOM.render(<App />, document.getElementById('root'));
