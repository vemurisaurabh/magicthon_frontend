import { createSlice } from '@reduxjs/toolkit'

const shareSlice = createSlice({
  name: 'share',
  initialState: {
    shareId: null,
    shareUrl: null,
    reactions: {},
    status: 'idle',
    error: null,
  },
  reducers: {
    clearShare(state) {
      state.shareId = null
      state.shareUrl = null
      state.reactions = {}
      state.status = 'idle'
      state.error = null
    },
    setShareResult(state, action) {
      state.shareId = action.payload.id
      state.shareUrl = action.payload.shareUrl
      state.status = 'succeeded'
    },
    setShareLoading(state) {
      state.status = 'loading'
      state.error = null
    },
    setShareError(state, action) {
      state.status = 'failed'
      state.error = action.payload
    },
    setReactions(state, action) {
      state.reactions = action.payload
    },
    reactionReceived(state, action) {
      const { emoji } = action.payload
      state.reactions[emoji] = (state.reactions[emoji] || 0) + 1
    },
  },
})

export const {
  clearShare,
  setShareResult,
  setShareLoading,
  setShareError,
  setReactions,
  reactionReceived,
} = shareSlice.actions

export const selectShareUrl = (state) => state.share.shareUrl
export const selectShareId = (state) => state.share.shareId
export const selectReactions = (state) => state.share.reactions
export const selectShareStatus = (state) => state.share.status
export const selectShareError = (state) => state.share.error

export default shareSlice.reducer
