import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { analyzeMeme, refineMemes } from '../services/memeService.js'

export const analyzePhoto = createAsyncThunk(
  'suggest/analyzePhoto',
  async ({ file, prompt, preferredTemplates }, { rejectWithValue }) => {
    try {
      return await analyzeMeme(file, prompt, preferredTemplates)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const refineSuggestions = createAsyncThunk(
  'suggest/refineSuggestions',
  async ({ file, previousSuggestions, feedback }, { rejectWithValue }) => {
    try {
      return await refineMemes(file, previousSuggestions, feedback)
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
    refineStatus: 'idle',
    error: null,
  },
  reducers: {
    clearSuggestions(state) {
      state.suggestions = []
      state.status = 'idle'
      state.refineStatus = 'idle'
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
      .addCase(refineSuggestions.pending, (state) => {
        state.refineStatus = 'loading'
        state.error = null
      })
      .addCase(refineSuggestions.fulfilled, (state, action) => {
        state.refineStatus = 'idle'
        state.suggestions = action.payload
      })
      .addCase(refineSuggestions.rejected, (state, action) => {
        state.refineStatus = 'idle'
        state.error = action.payload
      })
  },
})

export const { clearSuggestions } = suggestSlice.actions

export const selectSuggestions = (state) => state.suggest.suggestions
export const selectSuggestStatus = (state) => state.suggest.status
export const selectRefineStatus = (state) => state.suggest.refineStatus
export const selectSuggestError = (state) => state.suggest.error

export default suggestSlice.reducer
