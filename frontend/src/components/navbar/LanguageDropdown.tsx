import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Check, ChevronDown } from "lucide-react"
import { useTranslation } from "react-i18next"

export function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { i18n } = useTranslation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' }
  ]

  const currentLang = languages.find(l => l.code === i18n.language.split('-')[0]) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-100 shadow-sm transition-all"
      >
        <span className="text-xl">{currentLang.flag}</span>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentLang.code}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden py-1 z-50"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{l.flag}</span>
                  <span className={`text-sm font-bold ${currentLang.code === l.code ? 'text-[#1B5E20]' : 'text-slate-600'}`}>
                    {l.name}
                  </span>
                </div>
                {currentLang.code === l.code && <Check size={16} className="text-[#1B5E20]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
