import { configureStore } from '@reduxjs/toolkit'
import uploadReducer from './uploadSlice.js'
import suggestReducer from './suggestSlice.js'
import editorReducer from './editorSlice.js'
import shareReducer from './shareSlice.js'

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
    suggest: suggestReducer,
    editor: editorReducer,
    share: shareReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})
