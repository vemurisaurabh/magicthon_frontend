import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import 'primereact/resources/themes/lara-dark-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import './styles/primereact-theme.css'
import './styles/globals.css'
import { store } from './store/index.js'
import { App } from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)

/**
 *  The heart of the application which is to create the humour still needs to be enhanced. We can do two things
A) Give two options for every template. One the existing. Second where the uploaded character's face will be the cropped and kept to the template meme. I know this is heavy. But, adds to the liveliness of the project.
 */