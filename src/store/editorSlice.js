import { createSlice } from '@reduxjs/toolkit'

const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    selectedTemplate: null,
    textValues: {},
    history: [],
    historyIndex: -1,
  },
  reducers: {
    setSelectedTemplate(state, action) {
      const suggestion = action.payload
      state.selectedTemplate = suggestion
      const texts = {}
      if (suggestion.topText) texts.top = suggestion.topText
      if (suggestion.bottomText) texts.bottom = suggestion.bottomText
      state.textValues = texts
      state.history = [{ ...texts }]
      state.historyIndex = 0
    },
    updateText(state, action) {
      const { zoneId, value } = action.payload
      state.textValues[zoneId] = value
      const snapshot = { ...state.textValues }
      state.history = state.history.slice(0, state.historyIndex + 1)
      state.history.push(snapshot)
      state.historyIndex = state.history.length - 1
    },
    undo(state) {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1
        state.textValues = { ...state.history[state.historyIndex] }
      }
    },
    clearEditor(state) {
      state.selectedTemplate = null
      state.textValues = {}
      state.history = []
      state.historyIndex = -1
    },
  },
})

export const { setSelectedTemplate, updateText, undo, clearEditor } = editorSlice.actions

export const selectTemplate = (state) => state.editor.selectedTemplate
export const selectTextValues = (state) => state.editor.textValues
export const selectCanUndo = (state) => state.editor.historyIndex > 0

export default editorSlice.reducer
