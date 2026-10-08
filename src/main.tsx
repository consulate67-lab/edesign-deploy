import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

const root = document.getElementById('root')!
const paymentResult = new URLSearchParams(window.location.search).get('payment')

// PayTR ödeme formu iframe içinde çalışır; ödeme bitince dönüş adresi (bu site) yine o iframe'de açılır.
// Uygulamayı iframe içinde tekrar açmak yerine sonucu ödeme penceresine iletiriz.
if (paymentResult && window.parent !== window) {
  window.parent.postMessage({ type: 'paytr-result', status: paymentResult }, window.location.origin)
  root.innerHTML = `<p style="font:600 15px system-ui,sans-serif;text-align:center;margin-top:3rem;color:#334155">${
    paymentResult === 'success' ? 'Ödemeniz alındı, haklarınız yükleniyor…' : 'Ödeme tamamlanamadı.'
  }</p>`
} else {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
