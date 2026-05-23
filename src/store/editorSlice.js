import { createSlice } from '@reduxjs/toolkit'

const DEFAULT_ZONE_STYLE = {
  fontSize: 48,
  fontFamily: 'Impact, Anton, sans-serif',
  fill: '#FFFFFF',
  stroke: '#000000',
  strokeWidth: 2,
  shadowEnabled: true,
  shadowBlur: 4,
  x: null,
  y: null,
}

function buildInitialZoneStyles(suggestion) {
  const styles = {}
  const zoneIds = ['top', 'bottom']
  for (const id of zoneIds) {
    styles[id] = { ...DEFAULT_ZONE_STYLE }
  }
  return styles
}

function takeSnapshot(state) {
  return {
    textValues: { ...state.textValues },
    zoneStyles: JSON.parse(JSON.stringify(state.zoneStyles)),
  }
}

function pushHistory(state) {
  state.history = state.history.slice(0, state.historyIndex + 1)
  state.history.push(takeSnapshot(state))
  state.historyIndex = state.history.length - 1
}

function restoreSnapshot(state, snapshot) {
  state.textValues = { ...snapshot.textValues }
  state.zoneStyles = JSON.parse(JSON.stringify(snapshot.zoneStyles))
}

const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    selectedTemplate: null,
    textValues: {},
    zoneStyles: {},
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
      state.zoneStyles = buildInitialZoneStyles(suggestion)
      state.history = [takeSnapshot({ textValues: texts, zoneStyles: state.zoneStyles })]
      state.historyIndex = 0
    },
    updateText(state, action) {
      const { zoneId, value } = action.payload
      state.textValues[zoneId] = value
      pushHistory(state)
    },
    updateZoneStyle(state, action) {
      const { zoneId, styleProps } = action.payload
      if (!state.zoneStyles[zoneId]) {
        state.zoneStyles[zoneId] = { ...DEFAULT_ZONE_STYLE }
      }
      Object.assign(state.zoneStyles[zoneId], styleProps)
      pushHistory(state)
    },
    updateZonePosition(state, action) {
      const { zoneId, x, y } = action.payload
      if (!state.zoneStyles[zoneId]) {
        state.zoneStyles[zoneId] = { ...DEFAULT_ZONE_STYLE }
      }
      state.zoneStyles[zoneId].x = x
      state.zoneStyles[zoneId].y = y
      pushHistory(state)
    },
    undo(state) {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1
        restoreSnapshot(state, state.history[state.historyIndex])
      }
    },
    redo(state) {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1
        restoreSnapshot(state, state.history[state.historyIndex])
      }
    },
    clearEditor(state) {
      state.selectedTemplate = null
      state.textValues = {}
      state.zoneStyles = {}
      state.history = []
      state.historyIndex = -1
    },
  },
})

export const {
  setSelectedTemplate,
  updateText,
  updateZoneStyle,
  updateZonePosition,
  undo,
  redo,
  clearEditor,
} = editorSlice.actions

export const selectTemplate = (state) => state.editor.selectedTemplate
export const selectTextValues = (state) => state.editor.textValues
export const selectZoneStyles = (state) => state.editor.zoneStyles
export const selectCanUndo = (state) => state.editor.historyIndex > 0
export const selectCanRedo = (state) => state.editor.historyIndex < state.editor.history.length - 1

export default editorSlice.reducer
