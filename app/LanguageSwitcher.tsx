'use client'

import { useState, useEffect } from 'react'

const languages = [
  { code: 'en', label: '🇺🇸 English', name: 'English' },
  { code: 'ko', label: '🇰🇷 한국어', name: '한국어' },
  { code: 'vi', label: '🇻🇳 Tiếng Việt', name: 'Tiếng Việt' },
]

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('en')

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('wms-language') || 'en'
    setCurrentLang(savedLang)
  }, [])

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode)
    localStorage.setItem('wms-language', langCode)
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: langCode } }))
    // Reload page to apply language change
    window.location.reload()
  }

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0]

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        style={{
          padding: '8px 32px 8px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333333',
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          fontFamily: 'Comfortaa, cursive',
          outline: 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#999999'
          e.currentTarget.style.backgroundColor = '#f8f8f8'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e0e0e0'
          e.currentTarget.style.backgroundColor = '#ffffff'
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
