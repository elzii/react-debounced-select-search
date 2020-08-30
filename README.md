![Header](https://github.com/elzii/react-debounced-select-search/raw/master/media/Banner.png)

### Getting Started
`npm i @zizzo/react-debounced-select-search`

### Usage Example
```tsx
import { Select } from '@zizzo/react-debounced-select-search'

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
  }))
}

const CustomOption = ({ item, style, onClick, ...props }: any) => {
  return <div className="MyCustomOption" style={{ ...style }}>
    <pre>{JSON.stringify(item, null, 2)}</pre>
  </div>
})

return <Select
  getOptions={getOptions}
  placeholder={'Search cocktails'}
  tabBehavior={'SELECT_HIGHLIGHTED_OPTION'}
  debounceTimeout={200}
  components={{
    Option: CustomOption
  }}
/>
```


### Overriding CSS Theme

Theming is done with CSS variables. Example of overriding using [emotion](https://www.npmjs.com/package/emotion):

```tsx
// ...
import { css } from 'emotion'

return (
  <div className={css`
    .CustomSelect {
        --select-input-padding: 1rem;
        --select-input-border-radius: 4px;
        --select-input-font-size: 1.2rem;
        --select-input-border-color: rgba(0,0,0, 0.35);
        --select-input-focus-color: rgba(63,160,251,1);
        --select-input-icon-width: 56px;
        --select-input-max-width: 500px;
        --select-input-option-background-color: #f3f3f3;
        --select-input-option-background-color-hover: #ff0000;
        --select-input-option-active-background-color-hover: #ffff00;
        --select-input-option-color: inherit;
        --select-input-option-color-hover: white;
        --select-input-chip-background-color: rgba(0,0,0, 0.10);
    }
  `}>
    <Select 
      className="CustomSelect"
      // ...
    />
  </div>
)

```