import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { analyzeMeme } from '../services/memeService.js'

export const analyzePhoto = createAsyncThunk(
  'suggest/analyzePhoto',
  async (file, { rejectWithValue }) => {
    try {
      return await analyzeMeme(file)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const suggestSlice = createSlice({
  name: 'suggest',
  initialState: {
    suggestions: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearSuggestions(state) {
      state.suggestions = []
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzePhoto.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(analyzePhoto.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.suggestions = action.payload
      })
      .addCase(analyzePhoto.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearSuggestions } = suggestSlice.actions

export const selectSuggestions = (state) => state.suggest.suggestions
export const selectSuggestStatus = (state) => state.suggest.status
export const selectSuggestError = (state) => state.suggest.error

export default suggestSlice.reducer
