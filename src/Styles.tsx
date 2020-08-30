import * as React from 'react'
import styled from 'styled-components'

export const Styles = styled.div`
  .select, .select *, .select *:before, .select *:after {
    box-sizing: border-box;
    font-family: 'Netflix Sans', sans-serif;
  }

  .select {
    position: relative;
    max-width: var(--select-input-max-width);
  }
  .select-input-container {
    position: relative;
  }
  .select-input, .select-input--ghost {
    background: transparent;
    border: 1px solid var(--select-input-border-color);
    border-radius: var(--select-input-border-radius);
    outline: 1px solid transparent;
    outline-style: revert;
    padding-top: var(--select-input-padding);
    padding-bottom: var(--select-input-padding);
    padding-right: var(--select-input-padding);
    padding-left: var(--select-input-icon-width);
    font-size: var(--select-input-font-size);
    width: var(--select-input-max-width);
    color: rgba(15,15,15, 0.80);
  }
  .select-input.select-input--hide-placeholder::placeholder {
    color: transparent;
  }
  .select-input {
    font-family: 'Netflix Sans', sans-serif;
    position: relative;
    z-index: 1;
  }
  .select-input::placeholder {
    font-weight: 200;
    opacity: 0.5;
    font-size: 18px;
  }
  .select-input:focus {
    border-color: var(--select-input-focus-color);
    outline-color: var(--select-input-focus-color);
    /*box-shadow: 0 0 3pt 2pt red;*/
    z-index: 1;
  }
  .select-input--ghost {
    z-index: 0;
    position: absolute;
    border-color: transparent;
    top: 0;
    left: 0;
    opacity: 0.20;
  }



  .select-icon-container {
    position: absolute;
    top: 0;
    /*left: calc(var(--select-input-padding) * 2);*/
    left: 0;
    display: flex;
    align-items: center;
    height: 100%;
    width: var(--select-input-icon-width);
  }
  .select-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-items: center;
    left: 50%;
    transform: translateX(-50%);
  }


  .select-input-chips {
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--select-input-icon-width) - 8px);
    z-index: 3;
    padding: 
      calc(var(--select-input-padding)/2 + (var(--select-input-padding)/6))
      calc(var(--select-input-padding))
      calc(var(--select-input-padding)/2 + (var(--select-input-padding)/6)) 
      0;
    

    /*margin: 0 -1rem;*/
    /*padding: calc(var(--select-input-padding)) var(--select-input-padding);*/

    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }




  .select-options-container {
    position: absolute;
    width: 100%;
    z-index: 100;
    margin-top: 4px;
    max-height: 400px;
    overflow-y: scroll;
    /*border: 1px solid var(--select-input-border-color);*/
    background-color: var(--select-input-option-background-color);
    border-radius: var(--select-input-border-radius);
  }
  .select-options-container::-webkit-scrollbar {
    width: 0;
    height: 0;
  }


  .select-option-container {
    display: flex;
    align-items: center;
    padding: calc(var(--select-input-padding)/1) var(--select-input-padding);
  }
  .select-option-container:hover {
    background-color: var(--select-input-option-active-background-color-hover);
    /*color: inherit;*/
    cursor: pointer;
  }
  .select-option-container--highlighted {

    background-color: var(--select-input-option-background-color-hover);
    border-radius: var(--select-input-border-radius);
    color: white;
  }
  .select-option-container.select-option-container--highlighted:hover {
    background-color: var(--select-input-option-background-color-hover)
  }


  .select-option {
    display: flex;
    align-items: center;
  }
  .select-option > div {
    /*padding: 0 0.25rem;*/
    margin: 0 0.50rem;
    font-size: 15px;
  }
  .select-option .select-option__thumb-container {
    margin-left: 0rem;
    width: 32px;
    height: 32px;
    overflow: hidden;
    border-radius: 50%;
    position: relative;
    border: 1px solid rgba(0,0,0,0.05);
    background: #f6f7f8;
    background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
    background-repeat: no-repeat;
    background-size: 800px 104px; 
    display: inline-block;
    position: relative; 
    
    animation-duration: 1s;
    animation-fill-mode: forwards; 
    animation-iteration-count: 5;
    animation-name: placeholderShimmer;
    animation-timing-function: linear;
  }
  .select-option .select-option__thumb {
    max-width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%,-50%,0);
  }









  .select-input-chip {
    user-select: none;
    position: relative;
    font-size: 0.90rem;
    margin: 0.25rem;
    background-color: var(--select-input-chip-background-color);
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 4px;
    display: flex;
    align-items: stretch;
  }
  .select-input-chip--rollup {
    cursor: pointer;
    padding-left: 0.15rem;
    padding-right: 0.15rem;
  }
  .select-input-chip--rollup:hover {
    padding-left: 0.15rem;
    padding-right: 0.15rem;
    background-color: rgba(0,0,0,0.15);
  }
  .select-input-chip > * {
    padding: 0.25rem 0.5rem;
  }
  .select-input-chip__remove {
    cursor: pointer;
    margin-left: 6px;
    padding: 2px 8px;
    font-size: 0.70rem;
    border-radius: 0 4px 4px 0;
    border-color: transparent;
    border-left: 1px solid rgba(0,0,0,0.10);
    background-color: rgba(0,0,0, 0.03);
  }
  .select-input-chip__remove:hover {
    background-color: rgba(0,0,0,0.10);
  }
  .select-input-chip__remove:active,
  .select-input-chip__remove:focus {
    border-color: transparent;
    outline: none;
    background-color: rgba(0,0,0, 0.10); 
  }

  .popper {
    width: "2px";
    padding-top: 10px;
  }

  .popper-dropdown {
    flex-direction: column;
    background-color: #FFF;
    border-radius: 4px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.12);
    /*padding: 0.25rem 0.5rem;*/

    min-width: 200px;
  }

  .popper-dropdown__list {
    
  }

  .popper-dropdown__list-header {
    display: flex;
    align-items: center;
    justify-content: space-between; 
    font-size: 12px;
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    background: rgba(0,0,0,0.025);
    border-bottom: 1px solid rgba(0,0,0,0.05);
    user-select: none;
  }
  .popper-dropdown__list-item {
    display: flex;
    align-items: center;
    justify-content: space-between; 
    padding: 0.25rem 0.25rem 0.25rem 0.5rem;
  }

  .popper-dropdown__list-item:hover {
    background-color: rgba(0,0,0,0.03);
  }

  .popper-dropdown__list-item-drag-handle {
    cursor: move;
    font-size: 10px;
    margin-right: 0.5rem; 
    line-height: 1;
    opacity: 0.45;
  }

  .popper-dropdown__list-item-content {
    font-size: 12px;
  }

  .popper-dropdown__list-item-actions {
    
  }
  .popper-dropdown__list-item-action {
    /*position: absolute;*/
    cursor: pointer;
    background: transparent;
    top: 0;
    right: 0;
    height: 24px;
    width: 24px;
    align-items: center;
    justify-content: center;
    outline: none;
    border: none;
  }
  .popper-dropdown__list-item-action:hover {
    background-color: rgba(0,0,0,0.12);
  }

  @keyframes placeholderShimmer {
    0% {
      background-position: -468px 0;
    }
    
    100% {
      background-position: 468px 0; 
    }
  }
`

export default Styles