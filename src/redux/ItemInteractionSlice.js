import { createSlice } from '@reduxjs/toolkit'


export const itemInteractionSlice = createSlice({
  name: 'itemInteraction',
  initialState: {
    selectedItems: [],
    brushedItems: [],
    hoveredItem:{}
  },
  reducers: {
    setSelectedItems: (state, action) => {
      return {...state, selectedItems: action.payload}
    },
    setBrushedItems: (state, action) => {
      return {...state, brushedItems: action.payload}
    },
    setHoveredItem: (state, action) => {
      return {...state, hoveredItem: action.payload}
    },
  },
})

// Action creators are generated for each case reducer function
export const { setSelectedItems, setBrushedItems, setHoveredItem } = itemInteractionSlice.actions

export default itemInteractionSlice.reducer