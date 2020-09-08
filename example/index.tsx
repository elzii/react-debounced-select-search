// import 'react-app-polyfill/ie11';
import * as React from "react"
import * as ReactDOM from 'react-dom';
import Select, { IconLoading, IconSearch, createCSSTheme } from '../.';
import { css } from "emotion"
import cx from "classnames"
import * as querystring from "query-string"
import Fuse from "fuse.js"


import './index.css'


const getCountries = async (term) => {
  if (!term) return []

  const t = term.toLowerCase()

  const qs = querystring.stringify({
    view: "Grid view",
    maxRecords: 10,
    filterByFormula: `OR(
      FIND("${t}", LOWER({Country Name})),
      FIND("${t}", LOWER({Alpha 2}), 0), 
      FIND("${t}", LOWER({Alpha 3}), 0)
    )`
  })
  const response = await fetch(
    `https://api.airtable.com/v0/appkobV8QSd5TqnZN/ISO 3166-1 Countries?${qs}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_TOKEN}`
      }
    }
  )

  const { records = [] } = await response.json()

  const fuse = new Fuse(records, {
    includeScore: true,
    useExtendedSearch: true,
    shouldSort: true,
    keys: [
      ["fields", "Country Name"],
      ["fields", "Alpha 2"],
      ["fields", "Alpha 3"]
    ]
  })

  const res = fuse.search(t)

  // const data = records.map(({ id, fields = {} }) => {}

  const data = res
    .map(({ item }) => item)
    .map(({ id, fields = {} }) => {
      return {
        id,
        name: fields["Country Name"],
        value: fields["Country Name"],
        thumb: `https://svg-country-flags.s3.amazonaws.com/${fields["Alpha 2"]}.svg`,
        meta: [{ value: fields["Alpha 2"] }, { value: fields["Alpha 3"] }]
      }
    })

  return data
}

const getLanguages = async (term) => {
  if (!term || term === undefined) return []

  const t = term.toLowerCase()

  const table = `ISO 639-1 Languages`

  const qs = querystring.stringify({
    view: "Grid view",
    maxRecords: 10,
    filterByFormula: `OR(
      SEARCH("${t}", LOWER({Language Name})),
      SEARCH("${t}", LOWER({Native Name})), 
      FIND("${t}", LOWER({639-1 Code}), 0)
    )`
    // filterByFormula: `SEARCH("${t}", LOWER({Language Name}))`

    // "sort[0][field]": "Language Name",
    // "sort[0][direction]": "asc"
  })

  const response = await fetch(
    `https://api.airtable.com/v0/appkobV8QSd5TqnZN/${table}?${qs}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer keytZIj8N0NSWK371`
      }
    }
  )

  const { records = [] } = await response.json()

  // বাংলা
  const fuse = new Fuse(records, {
    includeScore: true,
    useExtendedSearch: true,
    shouldSort: true,
    keys: [
      ["fields", "Language Name"],
      ["fields", "Native Name"],
      ["fields", "639-1 Code"],
      ["fields", "Alpha 3"]
    ]
  })

  const res = fuse.search(t)

  // const data = records.map(({ id, fields = {} }) => {}
  const data = res
    .map(({ item }) => item)
    .map(({ id, fields = {} }) => {
      return {
        id,
        name: fields["Language Name"],
        value: fields["Language Name"],
        meta: [
          { id: "code", value: fields["639-1 Code"] },
          { id: "native", value: fields["Native Name"] }
        ]
      }
    })

  return data
}

const getCocktails = async (query) => {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`
  const response = await fetch(url, {
    method: "GET"
  })
  const data = await response.json()

  const { drinks } = data
  return drinks.map((item) => ({
    id: item.idDrink,
    name: item.strDrink,
    value: item.strDrink,
    thumb: item.strDrinkThumb,
    meta: [
      { id: "ingredient1", value: item.strIngredient1 },
      { id: "ingredient2", value: item.strIngredient2 },
      { id: "ingredient3", value: item.strIngredient3 }
    ].filter(({ value }) => !!value)
  }))
}

const CustomIconSearch = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 7.3L9.85 9.15C10.05 9.35 10.05 9.65 9.85 9.85C9.75 9.95 9.6 10 9.5 10C9.4 10 9.25 9.95 9.15 9.85L7.3 8C6.55 8.65 5.55 9 4.5 9C2 9 0 7 0 4.5C0 2 2 0 4.5 0C7 0 9 2 9 4.5C9 5.55 8.6 6.55 8 7.3ZM4.50083 1.00005C2.55083 1.00005 1.00083 2.55005 1.00083 4.50005C1.00083 6.45005 2.55083 8.00005 4.55083 7.95005C5.50083 7.95005 6.35083 7.60005 7.00083 6.95005C7.60083 6.35005 8.00083 5.45005 8.00083 4.50005C8.00083 2.55005 6.45083 1.00005 4.50083 1.00005Z"
        fill="black"
      />
    </svg>
  )
}



const CountrySelect = () => {
  const [selected, setSelected] = React.useState<any>([])

  const onSelectedChange = (s) => {
    console.log('onSelectedChange', s)
    setSelected(s)
  }

  return (
    <div>
      <p>
        Try <code>USA</code> or <code>United</code>
      </p>
      <Select
        className={"CustomSelect CustomSelectCountry"}
        style={{ marginBottom: "2rem" }}
        getOptions={getCountries}
        selected={selected}
        placeholder={"Search countries"}
        onSelectedChange={onSelectedChange}
        showSuggestion={false}
        tabBehavior={"SELECT_HIGHLIGHTED_OPTION"}
        debounceTimeout={200}
        isMulti={false}
        autoFocus={true}
        components={{
          IconSearch: ({ selected }) => {
            if ( selected.length ) {
              const { thumb } = selected[0]
              return <img src={thumb} alt="" className={css`
                width: 20px;
                height: 20px;
                border-radius: 50%;
                left: 40%;
              `} />
            } else {
              return (
                <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 7.3L9.85 9.15C10.05 9.35 10.05 9.65 9.85 9.85C9.75 9.95 9.6 10 9.5 10C9.4 10 9.25 9.95 9.15 9.85L7.3 8C6.55 8.65 5.55 9 4.5 9C2 9 0 7 0 4.5C0 2 2 0 4.5 0C7 0 9 2 9 4.5C9 5.55 8.6 6.55 8 7.3ZM4.50083 1.00005C2.55083 1.00005 1.00083 2.55005 1.00083 4.50005C1.00083 6.45005 2.55083 8.00005 4.55083 7.95005C5.50083 7.95005 6.35083 7.60005 7.00083 6.95005C7.60083 6.35005 8.00083 5.45005 8.00083 4.50005C8.00083 2.55005 6.45083 1.00005 4.50083 1.00005Z"
                    fill="black"
                  />
                </svg>
              )
            }
          },
        }}
      />
    </div>
  )
}

const LanguageSelect = () => {
  const [selected, setSelected] = React.useState<any>([])

  const onSelectedChange = (s) => {
    setSelected(s)
  }

  return (
    <div>
      <p>
        Try <code>Spanish</code>, <code>en</code>, or <code>বাংলা</code>
      </p>
      <Select
        className={"CustomSelect"}
        style={{ marginBottom: "2rem" }}
        getOptions={getLanguages}
        selected={selected}
        placeholder={"Search languages"}
        onSelectedChange={onSelectedChange}
        showSuggestion={false}
        tabBehavior={"SELECT_HIGHLIGHTED_OPTION"}
        debounceTimeout={200}
        isMulti={false}
        autoFocus={true}
        components={{
          IconSearch: ({ selected }) => {

            if ( selected.length > 0 ) {
              const code = (selected[0].meta.find(({ id }) => id === "code") || {}).value
              return <div
                className=""
                style={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  backgroundImage: "none",
                  backgroundColor: "#3A3A3A",
                  borderRadius: '50%',
                  width: 20,
                  height: 20
                }}
              >
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 500 }}>
                  {code.toUpperCase()}
                </span>
              </div>
            } else {
              return (
                <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 7.3L9.85 9.15C10.05 9.35 10.05 9.65 9.85 9.85C9.75 9.95 9.6 10 9.5 10C9.4 10 9.25 9.95 9.15 9.85L7.3 8C6.55 8.65 5.55 9 4.5 9C2 9 0 7 0 4.5C0 2 2 0 4.5 0C7 0 9 2 9 4.5C9 5.55 8.6 6.55 8 7.3ZM4.50083 1.00005C2.55083 1.00005 1.00083 2.55005 1.00083 4.50005C1.00083 6.45005 2.55083 8.00005 4.55083 7.95005C5.50083 7.95005 6.35083 7.60005 7.00083 6.95005C7.60083 6.35005 8.00083 5.45005 8.00083 4.50005C8.00083 2.55005 6.45083 1.00005 4.50083 1.00005Z"
                    fill="black"
                  />
                </svg>
              )
            }
          },
          Option: ({ item, className, style, onClick,...props }) => {

             const classNames = cx('select-option', className)
             return <div className={classNames} onClick={onClick}>
               <div className="select-option__thumb-container" style={{ 
                  backgroundImage: 'none',
                  backgroundColor: '#3A3A3A',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
               }}>
                 <span>{item.meta[0].value.toUpperCase()}</span>
               </div>
               <div>
                 <div>
                   <div style={{ marginBottom: 2 }}>{item.name}</div>
                 </div>
                 <div style={{ fontSize: 12, opacity: 0.75, margin: '2px -4px' }}>
                     {
                       item.meta && (item.meta as any[]).map(({ value }, m) => {
                         return <span key={`meta-${m}`} style={{ margin: '0px 4px', padding: '1px 4px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>{value}</span>
                       })
                     }                  
                 </div>
               </div>
             </div>
           }
            
          
        }}
      />
    </div>
  )
}


const App = () => {
  const onSelectedChange = (x) => console.log("onSelectedChange", x)
  const onInputChange = (x) => console.log("onInputChange", x)

  return (
    <div className="App">
      <div
        className={css`
          margin-top: 5rem;
          .CustomSelect {
            width: 460px;
            --select-input-max-width: none;
            --select-input-padding: 0.6rem;
            --select-input-icon-container-width: 40px;
            --select-input-font-size: 0.9rem;
            --select-input-font-color: rgba(15, 15, 15, 0.8);
            --select-input-border-color: rgba(152, 152, 152, 0.35);

            --select-input-icon-color: rgba(15, 15, 15, 0.8);
            --select-input-icon-size: 14px;

            --select-input-placeholder-font-size: 0.9rem;
            --select-input-focus-border-color: rgba(63, 160, 251, 1);
            --select-input-option-background-color: #f3f3f3;
            --select-input-option-background-color-hover: rgba(63, 160, 251, 1);
            --select-input-option-active-background-color-hover: rgba(
              63,
              160,
              251,
              0.5
            );
            --select-input-option-color: inherit;
            --select-input-option-color-hover: white;
            --select-input-chip-font-size: 0.7rem;
            --select-input-chip-font-color: rgba(106, 106, 106, 1);
            --select-input-chip-background-color: rgba(239, 239, 239, 1);
            --select-input-chip-border-color: transparent;
          }
          .CustomSelect .select-input-container {
            z-index: initial;
          }
          .CustomSelect .select-input-chip {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .CustomSelect input {
            width: 100%;
          }

          .CustomSelect .select-input-chip__remove {
            border-left: none;
            margin-left: 0;
            background-color: inherit;
            padding: 0 4px;
          }
          .CustomSelect .select-input-chip > span {
            padding: 0.15rem 0.5rem;
          }

          .CustomSelectCountry .select-option__thumb {
            width: 32px;
            height: 32px;
          }
        `}
      >
        <div>
          <p>
            Try <code>Bloody</code> or <code>cai</code>
          </p>
          <Select
            className={"CustomSelect"}
            style={{ marginBottom: "2rem" }}
            getOptions={getCocktails}
            placeholder={"Search cocktails"}
            selected={[]}
            showSuggestion={true}
            onSelectedChange={onSelectedChange}
            onInputChange={onInputChange}
            tabBehavior={"SELECT_SUGGESTED"}
            debounceTimeout={200}
            components={{
              IconSearch: CustomIconSearch
            }}
            autoFocus={false}
          />
        </div>

        <CountrySelect />

        <LanguageSelect />
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
