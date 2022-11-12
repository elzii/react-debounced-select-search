// import 'react-app-polyfill/ie11';
import * as React from "react"
import * as ReactDOM from 'react-dom';
import Select, { IconLoading, IconSearch, createCSSTheme } from '../.';
import { css } from "emotion"
import cx from "classnames"
import * as querystring from "query-string"
import Fuse from "fuse.js"
import * as dotProp from 'dot-prop'


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
        Authorization: `Bearer <YOUR_AIRTABLE_ACCESS_TOKEN>`
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
        value: fields["Alpha 2"],
        thumb: `https://svg-country-flags.s3.amazonaws.com/${fields["Alpha 2"]}.svg`,
        meta: [{ value: fields["Alpha 2"] }, { value: fields["Alpha 3"] }]
      }
    })

  return data
}

const getProfilesByAccountEmail = async (term) => {
  if (!term) return []

  const t = term.toLowerCase()

  const qs = querystring.stringify({
    user: 'moriafigma',
    lookup_key: t
  })
  const response = await fetch(
    `https://argus.us-east-1.prod.netflix.com/WEB/customers/lookup?${qs}`,
    {
      method: "GET",
    }
  )
  type ProfileInfoMap = {
    [key: string]: any
  }
  interface ProfileMap {
    addlProfileIdToProfileInfoMap: ProfileInfoMap,
    customerId: string
    customerNotFound?: string | 'true' | 'false'
  }
  const res: ProfileMap = await response.json()

  if ( !res.customerNotFound ) {
    const cid = res.customerId
    let profileIcons: any[]

    try {
      const profileIconsResponse = await fetch(
        `http://api-staging-internal.netflix.com/xd/profileIcons?customerId=${cid}`,
        { method: 'GET' }
      )
      profileIcons = await profileIconsResponse.json()
    } catch (ex) {
      profileIcons = []
      console.log('Failed getting icons, we can still display the names.')
    }


    return Object.entries(res.addlProfileIdToProfileInfoMap)
      .map(([id, info]) => ({ id, ...info }))
      .map(info => {
        return {
          thumb: profileIcons[info.id].iconAvatarUrls[0],
          id: info.guid,
          value: info.guid,
          name: info.name,
          meta: []
        }
      })
  }
  

  return []
}


const getAccountByEmail = async (term) => {
  if (!term) return []

  const t = term.toLowerCase()

  const qs = querystring.stringify({
    user: 'moriafigma',
    lookup_key: t
  })
  const response = await fetch(
    `https://argus.us-east-1.prod.netflix.com/WEB/customers/lookup?${qs}`,
    {
      method: "GET",
    }
  )
  type ProfileInfoMap = {
    [key: string]: any
  }
  interface ProfileMap {
    addlProfileIdToProfileInfoMap: ProfileInfoMap,
    customerId: string
    customerNotFound?: string | 'true' | 'false',
    [key: string]: any
  }
  const res: ProfileMap = await response.json()

  if ( !res.customerNotFound ) {
    const account = res
    return [
      {
        id: account.guid,
        value: account.accountId,
        name: term,
        profileName: account.profileName,
        meta: [
          { id: account.profileName, value: account.profileName },
          { id: account.accountId, value: account.accountId },
        ]
      }
    ]

  }
  

  return []
}


const getProfiles = async (cid) => {
  if (!cid) return []

  try {
    const profileIconsResponse = await fetch(
      `http://api-staging-internal.netflix.com/xd/profileIcons?customerId=${cid}`,
      { method: 'GET' }
    )
    interface ProfileIcons {
      [key: string]: {
        "index": number,
        "profileName": string,
        "guid": string,
        "customerId": string,
        "isAccountOwner": boolean,
        "isFirstUse": boolean,
        "experience": string, // 'standard'
        "iconAvatar": string,
        "iconAvatarUrls": string[]
      }
    }
    const profileIcons: ProfileIcons = await profileIconsResponse.json()

    return Object.entries(profileIcons)
      .map(([id, profile]) => ({ ...profile, customerId: id }))
      .map(profile => {
        return {
          thumb: profile.iconAvatarUrls[0],
          id: profile.guid,
          value: profile.guid,
          name: profile.profileName,
          meta: []
        }
      })
  } catch (ex) {
    return []
  }

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

const getSelf = async (query) => {
  return [{
    value: query,
    name: query,
    id: query
  }]
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
const getWiki = async (term) => {
  const url = `https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${term}&utf8=&format=json`
  const response = await fetch(url, {
    method: "GET"
  })
  const data = await response.json()

  const { query } = data

  return query.search.map((item) => ({
    id: item.pageid,
    name: item.title,
    value: item.title,
    snippet: item.snippet
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




const ConfirmSelect = ({ ...props }:any) => {

  const [selected, setSelected] = React.useState<any>([])
  const onSelectedChange = (s) => {
    setSelected(s)
  }
  const initialValue = selected[0] ? selected[0].name : ''

  return <div>
    <p>
      Email address intermediate by using <code>getSelf</code>
    </p>

    <Select
      className={"CustomSelect"}
      style={{ marginBottom: '1rem' }}
      getOptions={getSelf}
      selected={selected}
      initialValue={initialValue}
      placeholder={"Account email address"}
      onSelectedChange={onSelectedChange}
      showSuggestion={false}
      tabBehavior={"SELECT_HIGHLIGHTED_OPTION"}
      debounceTimeout={100}
      isMulti={false}
      autoFocus={false}
      components={{
        IconSearch: ({ selected }: { selected: Array<any> }) => {
          return <svg width="28" height="24" viewBox="0 0 28 24" fill="none" style={{
            opacity: selected.length ? 1 : 0.35
          }}>
            <path d="M27 11H21.9C21.8 9.8 21.4 8.6 20.9 7.5C22.8 6 24 3.8 24 1.4V1C24 0.4 23.6 0 23 0C22.4 0 22 0.4 22 1V1.4C22 3.2 21.2 4.8 19.8 5.9C19.3 5.2 18.6 4.7 17.9 4.2C17.9 4.1 17.9 4.1 17.9 4C17.9 1.8 16.1 0 13.9 0C11.7 0 9.9 1.8 9.9 4C9.9 4.1 9.9 4.1 9.9 4.2C9.2 4.7 8.6 5.2 8 5.9C6.8 4.8 6 3.2 6 1.4V1C6 0.4 5.6 0 5 0C4.4 0 4 0.4 4 1V1.4C4 3.8 5.1 6.1 7.1 7.5C6.6 8.5 6.2 9.7 6.1 11H1C0.4 11 0 11.4 0 12C0 12.6 0.4 13 1 13H6.1C6.2 14.2 6.6 15.4 7.1 16.5C5.1 17.9 4 20.2 4 22.6V23C4 23.6 4.4 24 5 24C5.6 24 6 23.6 6 23V22.6C6 20.8 6.8 19.2 8.2 18.1C9.7 19.9 11.7 21 14 21C16.3 21 18.4 19.9 19.8 18.1C21.2 19.2 22 20.8 22 22.6V23C22 23.6 22.4 24 23 24C23.6 24 24 23.6 24 23V22.6C24 20.2 22.9 17.9 20.9 16.5C21.4 15.5 21.8 14.3 21.9 13H27C27.6 13 28 12.6 28 12C28 11.4 27.6 11 27 11Z" fill="black"/>
          </svg>
        },
        Option: ({ item, className, style, onClick,...props }) => {
           const classNames = cx('select-option', className)
           return <div className={cx(classNames, css`padding-left:0.25rem !important;padding-right: 0.25rem !important;`)} onClick={onClick}>
              <div className={css`
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
              `}>
                <div style={{ marginBottom: 2 }}>{item.name}</div>
                <div className={css`
                  background: white;
                  padding: 0.25rem 0.5rem;
                  border-radius: 4px;
                  font-size: 10px;
                  color: #222;
                `}>
                  SUBMIT
                </div>
              </div>
           </div>
         },
         // IconSearch: () => null,
         // IconLoading: () => null,
      }}
    />
  </div>
}


const ProfileSelectAccountSearchCombined = ({ ...props }:any) => {

  const [selected, setSelected] = React.useState<any>([])
  const [options, setOptions] = React.useState<any>([])
  const [emailAddress, setEmailAddress] = React.useState<string>('')
  const [chip, setChip] = React.useState<any>(null)
  const onSelectedChange = (s) => {
    setSelected(s)
  }
  const onInputChange = React.useCallback((value) => {
    if ( selected.length <= 0 ) {
      setEmailAddress(value)
    }
  }, [selected, emailAddress])

  const getProfiles = React.useCallback(async (value) => {
    if ( selected.length > 0 ) {
      console.log('Change to using options', selected, options)
      return options
    }
    return getProfilesByAccountEmail(value)
  }, [selected, options])

  React.useEffect(() => {
    if ( selected.length >= 1 ) {
      setChip({
        id: emailAddress,
        name: emailAddress,
        value: emailAddress
      })
    }
  }, [selected, emailAddress])

  const initialValue = selected[0] ? selected[0].name : ''

  // console.log('emailAddress', emailAddress)
  // console.log('selected', selected)
  // console.log('chip', chip)

  return <div>
    <p>
      Search by email (combined)
    </p>


    <Select
      className={"CustomSelect"}
      style={{ marginBottom: '1rem' }}
      getOptions={getProfiles}
      onOptionsChange={(opts) => setOptions(opts)}
      selected={selected}
      initialValue={initialValue}
      placeholder={"Account email address"}
      onInputChange={onInputChange}
      onSelectedChange={onSelectedChange}
      showSuggestion={false}
      tabBehavior={"SELECT_HIGHLIGHTED_OPTION"}
      debounceTimeout={100}
      isMulti={false}
      autoFocus={false}
      chip={chip}
      // onRemoveChip={() => setChip(null)}
      components={{
        IconSearch: ({ selected }: { selected: Array<any> }) => {
          const styles: React.CSSProperties = {
            width: 16,
            height: 17,
            position: 'relative',
            top: 1
          }
          return <svg viewBox="0 0 24 24" fill="none" style={{
            ...styles,
            // opacity: selected.length ? 1 : 0.35
            opacity: 1
          }}>
            <path fillRule="evenodd" clipRule="evenodd" d="M2 4V20H22V4H2ZM18.586 6L12 12.586L5.414 6H18.586ZM4 18V7.414L12 15.414L20 7.414V18H4Z" fill="black" fillOpacity="0.9"/>
          </svg>
        },
        Option: ({ item, className, style, onClick,...props }) => {
           const classNames = cx('select-option', className)
           return <div className={classNames} onClick={onClick}>
             <div className="select-option__thumb-container">
               <img className="select-option__thumb" src={item.thumb} alt="" />
             </div>
             <div>
               <div>
                 <div style={{ marginBottom: 2 }}>{item.name}</div>
               </div>
             </div>
           </div>
         },
         // IconSearch: () => null,
         // IconLoading: () => null,
      }}
    />
  </div>
}

const EmailSelect = ({ onSelect, ...props }:any) => {

  const [selected, setSelected] = React.useState<any>([])
  
  const onSelectedChange = (s) => {
    setSelected(s)
    onSelect && onSelect(s[0])
  }
  
  const initialValue = selected[0] ? selected[0].name : ''

  return <div>
    <p>
      Try, ex: <code>432539860306755280</code> or <code>test@netflix.com</code>
    </p>

    <Select
      className={"CustomSelect"}
      style={{ marginBottom: '1rem' }}
      getOptions={getAccountByEmail}
      selected={selected}
      initialValue={initialValue}
      placeholder={"Email Address or Customer ID"}
      onSelectedChange={onSelectedChange}
      showSuggestion={false}
      tabBehavior={"SELECT_HIGHLIGHTED_OPTION"}
      debounceTimeout={200}
      isMulti={false}
      autoFocus={false}
      components={{
        IconSearch: ({ selected }: { selected: Array<any> }) => {
          const styles: React.CSSProperties = {
            width: 16,
            height: 17,
            position: 'relative',
            top: 1
          }
          return <svg viewBox="0 0 24 24" fill="none" style={{
            ...styles,
            // opacity: selected.length ? 1 : 0.35
            opacity: 1
          }}>
            <path fillRule="evenodd" clipRule="evenodd" d="M2 4V20H22V4H2ZM18.586 6L12 12.586L5.414 6H18.586ZM4 18V7.414L12 15.414L20 7.414V18H4Z" fill="black" fillOpacity="0.9"/>
          </svg>
        },
        Option: ({ item, className, style, onClick,...props }) => {
           const classNames = cx('select-option', className)
           return <div className={classNames} onClick={onClick}>
             <div>
               <div style={{ marginBottom: '0.5rem' }}>{item.name}</div>
               <div style={{ fontSize: 12, opacity: 0.75, margin: '2px -4px' }}>
                 {
                   item.meta && (item.meta as any[]).map(({ value }, m) => {
                     return <span key={`meta-${m}`} style={{ margin: '0px 4px', padding: '1px 4px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>{value}</span>
                   })
                 }
               </div>
             </div>
           </div>
         },
         // IconSearch: () => null,
         // IconLoading: () => null,
      }}
    />
  </div>
}


const ProfileSelectAccountSearch = ({ ...props }:any) => {

  const [selected, setSelected] = React.useState<any>([])
  const onSelectedChange = (s) => {
    setSelected(s)
  }

  const initialValue = selected[0] ? selected[0].name : ''

  return <div>
    <p>
      Select profile after searching email
    </p>
    <Select
      className={"CustomSelect"}
      style={{ marginBottom: '1rem' }}
      getOptions={getProfilesByAccountEmail}
      selected={selected}
      initialValue={initialValue}
      placeholder={"Account email address"}
      onSelectedChange={onSelectedChange}
      showSuggestion={false}
      tabBehavior={"SELECT_HIGHLIGHTED_OPTION"}
      debounceTimeout={100}
      isMulti={false}
      autoFocus={false}
      components={{
        IconSearch: ({ selected }: { selected: Array<any> }) => {
          const styles: React.CSSProperties = {
            width: 16,
            height: 17,
            position: 'relative',
            top: 1
          }

          if ( selected.length ) {
            const { thumb } = selected[0]
            return <img src={thumb} alt="" className={css`
              width: 20px;
              height: 20px;
              border-radius: 50%;
              left: 40%;
            `} />
          }
          return <svg viewBox="0 0 24 24" fill="none" style={{
            ...styles,
            // opacity: selected.length ? 1 : 0.35
            opacity: 1
          }}>
            <path fillRule="evenodd" clipRule="evenodd" d="M2 4V20H22V4H2ZM18.586 6L12 12.586L5.414 6H18.586ZM4 18V7.414L12 15.414L20 7.414V18H4Z" fill="black" fillOpacity="0.9"/>
          </svg>
        },
        Option: ({ item, className, style, onClick,...props }) => {
           const classNames = cx('select-option', className)
           return <div className={classNames} onClick={onClick}>
             <div className="select-option__thumb-container">
               <img className="select-option__thumb" src={item.thumb} alt="" />
             </div>
             <div>
               <div>
                 <div style={{ marginBottom: 2 }}>{item.name}</div>
               </div>
             </div>
           </div>
         },
         // IconSearch: () => null,
         // IconLoading: () => null,
      }}
    />
  </div>
}


const ProfileSelect = ({ customerId, ...props }:any) => {

  const [selected, setSelected] = React.useState<any>([])
  const [ready, setReady] = React.useState<boolean>(false)
  
  const onSelectedChange = (s) => {
    setSelected(s)
  }

  React.useEffect(() => {
    if ( customerId ) {
      getProfiles(customerId)
        .then(profiles => setSelected([profiles[0]]))
        .then(() => setReady(true))
    }
  }, [customerId])

  if ( ready ) {
  
    return <div>
      <p>
        Select profile
      </p>
      <Select
        key={`select-${customerId}`}
        className={"CustomSelect"}
        style={{ marginBottom: '1rem' }}
        getOptions={async () => getProfiles(customerId)}
        selected={selected}
        initialValue={(selected.length && selected[0]) ? selected[0].name : ''}
        placeholder={"Profile"}
        onSelectedChange={onSelectedChange}
        showSuggestion={false}
        tabBehavior={"SELECT_HIGHLIGHTED_OPTION"}
        debounceTimeout={200}
        isMulti={false}
        autoFocus={false}
        alwaysShowOptionsOnFocus={true}
        hideOptionsAfterSelection={true}
        components={{
          IconSearch: ({ selected }: { selected: Array<any> }) => {
            const styles: React.CSSProperties = {
              width: 16,
              height: 17,
              position: 'relative',
              top: 1
            }

            if ( selected.length ) {
              const { thumb } = selected[0]
              return <img src={thumb} alt="" className={css`
                width: 20px;
                height: 20px;
                border-radius: 50%;
                left: 40%;
              `} />
            }
            return <svg viewBox="0 0 20 20" fill="none" style={{
              width: 20,
              height: 20
            }}>
              <circle cx="10" cy="10" r="10" fill="#E4E4E4"/>
            </svg>

          },
          Option: ({ item, className, style, onClick,...props }) => {
             const classNames = cx('select-option', className)
             return <div className={classNames} onClick={onClick}>
               <div className="select-option__thumb-container">
                 <img className="select-option__thumb" src={item.thumb} alt="" />
               </div>
               <div>
                 <div>
                   <div style={{ marginBottom: 2 }}>{item.name}</div>
                 </div>
               </div>
             </div>
           },
           // IconSearch: () => null,
           // IconLoading: () => null,
        }}
      />
    </div>
  }

  return <div>
    <p>
      Select profile
    </p>
  </div>
}

const CountrySelect = ({ initialValue = '', components, selected, ...props }:any) => {
  return (
    <div>
      <p>
        Try <code>USA</code> or <code>United</code>
      </p>
      <Select
        className={"CustomSelect CustomSelectCountry"}
        style={{ marginBottom: '1rem' }}
        getOptions={getCountries}
        selected={selected}
        placeholder={"Search countries"}
        initialValue={initialValue}
        showSuggestion={false}
        tabBehavior={"SELECT_HIGHLIGHTED_OPTION"}
        debounceTimeout={200}
        isMulti={false}
        autoFocus={false}
        hideOptionsAfterSelection={true}
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
          ...(components ? components : {}),
        }}
        {...props}
      />
    </div>
  )
}

const LanguageSelect = (props: any) => {
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
        style={{ marginBottom: '1rem' }}
        getOptions={getLanguages}
        selected={selected}
        placeholder={"Search languages"}
        onSelectedChange={onSelectedChange}
        showSuggestion={false}
        tabBehavior={"SELECT_HIGHLIGHTED_OPTION"}
        debounceTimeout={200}
        isMulti={false}
        autoFocus={false}
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
        {...props}
      />

      
    </div>
  )
}


const App = () => {
  const [account,setAccount] = React.useState<any>({})
  const [country,setCountry] = React.useState<any>({
    id: 'US',
    value: 'US', 
    name: 'United States',
    thumb: `https://svg-country-flags.s3.amazonaws.com/${'US'}.svg`,
  })
  const onSelectedChange = (x) => console.log("onSelectedChange", x)
  const onInputChange = (x) => console.log("onInputChange", x)



  return (
    <div className="App">

      <button onClick={() => setCountry(({ 
        id: 'IN',
        value: 'IN', 
        name: 'India',
        thumb: `https://svg-country-flags.s3.amazonaws.com/${'IN'}.svg`,
      }))}>
        Update Country
      </button>
      <pre>{JSON.stringify(country, null, 2)}</pre>

      <div
        className={css`
          margin: 4rem auto;
          padding: 0 2rem;

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
        <div className={css`
          display: grid;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          grid-gap: 1rem;
        `}>

        <div>
          <p>
            Try <code>Bloody</code> or <code>cai</code>
          </p>
          <Select
            className={"CustomSelect"}
            style={{ marginBottom: '1rem' }}
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
            hideOptionsAfterSelection={false}
            autoFocus={false}
          />
        </div>
        <div>
          <p>
            Search Wikipedia
          </p>
          <Select
            className={"CustomSelect"}
            style={{ marginBottom: '1rem' }}
            getOptions={getWiki}
            placeholder={"Search Wikipedia"}
            selected={[]}
            showSuggestion={true}
            onSelectedChange={onSelectedChange}
            onInputChange={onInputChange}
            tabBehavior={"SELECT_SUGGESTED"}
            debounceTimeout={200}
            components={{
              IconSearch: CustomIconSearch,
              Option: ({ item, className, style, onClick,...props }) => {
                const classNames = cx('select-option', className)
                return <div className={classNames} onClick={onClick}>
                  <div>
                    <div>
                      <div style={{ marginBottom: 2 }}>{item.name}</div>
                      <div 
                        className={css`
                          font-size: 10px;
                          opacity: 0.5;
                          .searchmatch {
                            font-weight: bold;
                          }
                        `}
                        dangerouslySetInnerHTML={{
                         __html: item.snippet
                        }} 
                      />
                    </div>
                  </div>
                 </div>
               },
            }}
            hideOptionsAfterSelection={false}
            autoFocus={false}
          />
        </div>
      </div>
      <div className={css`
        display: grid;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 1rem;
      `}>

        <CountrySelect 
          components={{
            ClearSelection: () => null
          }}
          onBlur={(event: any) => console.log('Blur')}
        />
        <CountrySelect 
          selected={[country]}
          onSelectedChange={() => console.log('Change country?')}
          initialValue={country.name}
        />
        <CountrySelect 
          focusInputAfterRemovingSelectedItem={true}
          components={{
            IconSearch: null,
            IconLoading: null,
            Option: ({ item, className, style, onClick,...props }) => {
              const classNames = cx('select-option', className)
              return <div className={cx(classNames, css``)}>
                {item.name}
              </div>
            }
          }}
        />

      </div>

      <div className={css`
        display: grid;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 1rem;
      `}>
        <LanguageSelect />
        <LanguageSelect 
          initialValue={'English'}
          selected={[{
            "id": "recaSEiPRVC2QCYuS",
            "name": "English",
            "value": "English",
            "meta": [
              {
                "id": "code",
                "value": "en"
              },
              {
                "id": "native",
                "value": "English"
              }
            ]
          }]}
        />

        </div>

        <div className={css`
          display: grid;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          grid-gap: 1rem;
        `}>
          <ConfirmSelect />
        </div>

        <div className={css`
          display: grid;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          grid-gap: 1rem;
        `}>
          <ProfileSelectAccountSearchCombined />
          <ProfileSelectAccountSearch />
          
        </div>

        <div className={css`
          display: grid;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          grid-gap: 1rem;
        `}>
          <EmailSelect onSelect={option => setAccount(option)}/>
          <ProfileSelect customerId={!!account ? account.value : ''}/>
        </div>

      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
