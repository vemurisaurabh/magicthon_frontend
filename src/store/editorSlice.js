import { createSlice } from '@reduxjs/toolkit'
import { nanoid } from '@reduxjs/toolkit'

const DEFAULT_LAYER_STYLE = {
  fontSize: 48,
  fontFamily: 'Impact, Anton, sans-serif',
  fill: '#F5E642',
  stroke: '#000000',
  strokeWidth: 2,
  shadowEnabled: true,
  shadowBlur: 4,
}

function createLayer(text, x, y) {
  return {
    id: nanoid(8),
    text: text || '',
    x,
    y,
    ...DEFAULT_LAYER_STYLE,
  }
}

function takeSnapshot(state) {
  return {
    layers: JSON.parse(JSON.stringify(state.layers)),
  }
}

function pushHistory(state) {
  state.history = state.history.slice(0, state.historyIndex + 1)
  state.history.push(takeSnapshot(state))
  state.historyIndex = state.history.length - 1
}

function restoreSnapshot(state, snapshot) {
  state.layers = JSON.parse(JSON.stringify(snapshot.layers))
}

const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    selectedTemplate: null,
    aiImageUrl: null,
    layers: [],
    activeLayerId: null,
    history: [],
    historyIndex: -1,
  },
  reducers: {
    setSelectedTemplate(state, action) {
      const suggestion = action.payload
      state.selectedTemplate = suggestion
      state.aiImageUrl = suggestion._aiImageUrl || null
      const layers = []
      if (suggestion.topText) {
        layers.push(createLayer(suggestion.topText, 0.05, 0.05))
      }
      if (suggestion.bottomText) {
        layers.push(createLayer(suggestion.bottomText, 0.05, 0.75))
      }
      state.layers = layers
      state.activeLayerId = layers[0]?.id || null
      state.history = [takeSnapshot({ layers })]
      state.historyIndex = 0
    },

    addLayer(state, action) {
      const { x, y } = action.payload
      const layer = createLayer('', x, y)
      state.layers.push(layer)
      state.activeLayerId = layer.id
      pushHistory(state)
    },

    removeLayer(state, action) {
      const id = action.payload
      state.layers = state.layers.filter((l) => l.id !== id)
      if (state.activeLayerId === id) {
        state.activeLayerId = state.layers[0]?.id || null
      }
      pushHistory(state)
    },

    setActiveLayer(state, action) {
      state.activeLayerId = action.payload
    },

    updateLayerText(state, action) {
      const { id, text } = action.payload
      const layer = state.layers.find((l) => l.id === id)
      if (layer) {
        layer.text = text
        pushHistory(state)
      }
    },

    updateLayerStyle(state, action) {
      const { id, styleProps } = action.payload
      const layer = state.layers.find((l) => l.id === id)
      if (layer) {
        Object.assign(layer, styleProps)
        pushHistory(state)
      }
    },

    updateLayerPosition(state, action) {
      const { id, x, y } = action.payload
      const layer = state.layers.find((l) => l.id === id)
      if (layer) {
        layer.x = x
        layer.y = y
      }
    },

    undo(state) {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1
        restoreSnapshot(state, state.history[state.historyIndex])
        if (!state.layers.find((l) => l.id === state.activeLayerId)) {
          state.activeLayerId = state.layers[0]?.id || null
        }
      }
    },

    redo(state) {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1
        restoreSnapshot(state, state.history[state.historyIndex])
        if (!state.layers.find((l) => l.id === state.activeLayerId)) {
          state.activeLayerId = state.layers[0]?.id || null
        }
      }
    },

    restoreDraft(state, action) {
      const { templateId, layers } = action.payload
      state.selectedTemplate = { templateId }
      state.layers = layers || []
      state.activeLayerId = state.layers[0]?.id || null
      state.history = [takeSnapshot({ layers: state.layers })]
      state.historyIndex = 0
    },

    clearEditor(state) {
      state.selectedTemplate = null
      state.aiImageUrl = null
      state.layers = []
      state.activeLayerId = null
      state.history = []
      state.historyIndex = -1
    },
  },
})

export const {
  setSelectedTemplate,
  addLayer,
  removeLayer,
  setActiveLayer,
  updateLayerText,
  updateLayerStyle,
  updateLayerPosition,
  undo,
  redo,
  restoreDraft,
  clearEditor,
} = editorSlice.actions

export const selectTemplate = (state) => state.editor.selectedTemplate
export const selectAiImageUrl = (state) => state.editor.aiImageUrl
export const selectLayers = (state) => state.editor.layers
export const selectActiveLayerId = (state) => state.editor.activeLayerId
export const selectActiveLayer = (state) => {
  const id = state.editor.activeLayerId
  return state.editor.layers.find((l) => l.id === id) || null
}
export const selectCanUndo = (state) => state.editor.historyIndex > 0
export const selectCanRedo = (state) => state.editor.historyIndex < state.editor.history.length - 1

export default editorSlice.reducer
