import { useCallback } from 'react'
import { Button } from 'primereact/button'
import './EditorToolbar.css'

export function EditorToolbar({ templateName, onBack, onExport, onShare, shareDisabled }) {
  return (
    <div className="editor-toolbar">
      <Button
        label="← Back"
        text
        className="editor-toolbar__back"
        onClick={onBack}
      />
      <span className="editor-toolbar__name">{templateName}</span>
      <div className="editor-toolbar__actions">
        <Button
          label="Export PNG"
          className="analyze-cta editor-toolbar__export"
          onClick={onExport}
        />
        <Button
          label="Share"
          outlined
          className="editor-toolbar__share"
          onClick={onShare}
          disabled={shareDisabled}
        />
      </div>
    </div>
  )
}
