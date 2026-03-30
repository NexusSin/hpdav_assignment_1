import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

// get the data in asyncThunk
export const getDataSet = createAsyncThunk('communities/fetchData', async (args, thunkAPI) => {
  try{
    const response = await fetch('data/communities.csv');
    const responseText = await response.text();
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});

    // you can also dispatch any other reducer
    // thunkAPI.dispatch(reducerAction(params))

    return responseJson.data.map((item,i)=>{return {...item,index:i}});
    // when a result is returned, extraReducer below is triggered with the case setSeoulBikeData.fulfilled
  }catch(error){
    console.error("error in asyncThunk:", error);
    return thunkAPI.rejectWithValue(error)
  }
})

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: [],
  reducers: {
      // add reducer if needed
  },
  extraReducers: builder => {
    builder.addCase(getDataSet.pending, (state, action) => {
      // data loading in progress
      // do something with state, e.g. to change a status
    })
    builder.addCase(getDataSet.fulfilled, (state, action) => {
      return action.payload
    })
    builder.addCase(getDataSet.rejected, (state, action) => {
      // Add any fetched house to the array
      const error = action.payload
      console.error("getDataSet rejected:", error);
    })
  }
})

// Action creators are generated for each case reducer function
// export const { reducerAction } = dataSetSlice.actions

export default dataSetSlice.reducer