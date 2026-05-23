import { createSlice } from '@reduxjs/toolkit'

const uploadSlice = createSlice({
  name: 'upload',
  initialState: {
    file: null,
    previewUrl: null,
    status: 'idle',
  },
  reducers: {
    setFile(state, action) {
      state.file = action.payload.file
      state.previewUrl = action.payload.previewUrl
      state.status = 'ready'
    },
    clearFile(state) {
      state.file = null
      state.previewUrl = null
      state.status = 'idle'
    },
  },
})

export const { setFile, clearFile } = uploadSlice.actions

export const selectUploadFile = (state) => state.upload.file
export const selectPreviewUrl = (state) => state.upload.previewUrl
export const selectUploadStatus = (state) => state.upload.status

export default uploadSlice.reducer
