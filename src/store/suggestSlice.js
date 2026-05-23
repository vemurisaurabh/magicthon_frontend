import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { analyzeMeme, refineMemes, generateMemeImage } from '../services/memeService.js'

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

export const generateMemeImages = createAsyncThunk(
  'suggest/generateMemeImages',
  async ({ file, suggestions }, { dispatch }) => {
    const results = await Promise.allSettled(
      suggestions.map(async (s) => {
        const imageUrl = await generateMemeImage(file, {
          templateId: s.templateId,
          topText: s.topText,
          bottomText: s.bottomText,
        })
        dispatch(setGeneratedImage({ templateId: s.templateId, imageUrl }))
        return { templateId: s.templateId, imageUrl }
      })
    )
    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
  },
  {
    condition: (_, { getState }) => {
      const { suggest } = getState()
      return suggest.imageGenStatus === 'idle'
    },
  }
)

export const retryGenerateMemeImage = createAsyncThunk(
  'suggest/retryGenerateMemeImage',
  async ({ file, suggestion }, { dispatch }) => {
    dispatch(markRetrying(suggestion.templateId))
    const imageUrl = await generateMemeImage(file, {
      templateId: suggestion.templateId,
      topText: suggestion.topText,
      bottomText: suggestion.bottomText,
    })
    dispatch(setGeneratedImage({ templateId: suggestion.templateId, imageUrl }))
    return { templateId: suggestion.templateId, imageUrl }
  }
)

const suggestSlice = createSlice({
  name: 'suggest',
  initialState: {
    suggestions: [],
    status: 'idle',
    refineStatus: 'idle',
    error: null,
    generatedImages: {},
    retrying: {},
    imageGenStatus: 'idle',
  },
  reducers: {
    clearSuggestions(state) {
      state.suggestions = []
      state.status = 'idle'
      state.refineStatus = 'idle'
      state.error = null
      state.generatedImages = {}
      state.retrying = {}
      state.imageGenStatus = 'idle'
    },
    setGeneratedImage(state, action) {
      const { templateId, imageUrl } = action.payload
      state.generatedImages[templateId] = imageUrl
      delete state.retrying[templateId]
    },
    markRetrying(state, action) {
      state.retrying[action.payload] = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzePhoto.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.generatedImages = {}
        state.retrying = {}
        state.imageGenStatus = 'idle'
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
        state.generatedImages = {}
        state.retrying = {}
        state.imageGenStatus = 'idle'
      })
      .addCase(refineSuggestions.fulfilled, (state, action) => {
        state.refineStatus = 'idle'
        state.suggestions = action.payload
      })
      .addCase(refineSuggestions.rejected, (state, action) => {
        state.refineStatus = 'idle'
        state.error = action.payload
      })
      .addCase(generateMemeImages.pending, (state) => {
        state.imageGenStatus = 'loading'
      })
      .addCase(generateMemeImages.fulfilled, (state) => {
        state.imageGenStatus = 'done'
      })
      .addCase(generateMemeImages.rejected, (state) => {
        state.imageGenStatus = 'done'
      })
      .addCase(retryGenerateMemeImage.rejected, (state, action) => {
        const templateId = action.meta?.arg?.suggestion?.templateId
        if (templateId) delete state.retrying[templateId]
      })
  },
})

export const { clearSuggestions, setGeneratedImage, markRetrying } = suggestSlice.actions

export const selectSuggestions = (state) => state.suggest.suggestions
export const selectSuggestStatus = (state) => state.suggest.status
export const selectRefineStatus = (state) => state.suggest.refineStatus
export const selectSuggestError = (state) => state.suggest.error
export const selectGeneratedImages = (state) => state.suggest.generatedImages
export const selectRetrying = (state) => state.suggest.retrying
export const selectImageGenStatus = (state) => state.suggest.imageGenStatus

export default suggestSlice.reducer
