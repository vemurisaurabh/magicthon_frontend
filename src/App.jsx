import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage.jsx'
import SuggestionsPage from './pages/SuggestionsPage.jsx'
import EditorPage from './pages/EditorPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import SharePage from './pages/SharePage.jsx'
import { restoreDraft } from './store/editorSlice.js'
import { loadLatestDraft } from './services/draftService.js'
import './App.css'

const pageVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
}

const PARENT_ROUTE = {
  '/suggestions': '/',
  '/editor': '/suggestions',
  '/saved': '/editor',
}

function AppLayout() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const isEditor = location.pathname === '/editor'
  const isSaved = location.pathname === '/saved'
  const isSuggestions = location.pathname === '/suggestions'
  const isHome = location.pathname === '/'
  const parentRoute = PARENT_ROUTE[location.pathname] || '/'

  useEffect(() => {
    loadLatestDraft().then((draft) => {
      if (draft) {
        dispatch(restoreDraft({
          templateId: draft.template_id,
          layers: draft.layers,
        }))
      }
    }).catch(() => {})
  }, [dispatch])

  return (
    <>
      {!isEditor && !isSaved && (
        <nav className="app__nav">
          {!isHome && (
            <button className="app__back-btn" onClick={() => navigate(parentRoute)} aria-label="Go back">
              <i className="pi pi-arrow-left" />
            </button>
          )}
          <span className="app__logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
            Chintu Memer
          </span>
        </nav>
      )}

      <main className={`app__content ${isEditor ? 'app__content--editor' : ''} ${isSaved ? 'app__content--saved' : ''} ${(isHome || isSuggestions) ? 'app__content--wide' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className={`app__view ${isEditor ? 'app__view--editor' : ''}`}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/m/:memeId" element={<SharePage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <AppLayout />
      </div>
    </BrowserRouter>
  )
}
