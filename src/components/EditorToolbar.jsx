import { Button } from 'primereact/button'
import './EditorToolbar.css'

export function EditorToolbar({ templateName, onBack, onLogoClick }) {
  return (
    <div className="editor-toolbar">
      <Button
        icon="pi pi-arrow-left"
        text
        className="editor-toolbar__back"
        onClick={onBack}
        aria-label="Back"
      />
      <span className="editor-toolbar__logo" onClick={onLogoClick} role="button" tabIndex={0}>Chintu Memer</span>
      <span className="editor-toolbar__divider">/</span>
      <span className="editor-toolbar__name">{templateName}</span>
    </div>
  )
}
