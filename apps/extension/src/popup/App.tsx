import { useEffect, useState } from "react";

export default function PixelSquireWidget() {
  const [streak, setStreak] = useState<number | null>(null)
  const [goals, setGoals] = useState<number | null>(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_SUMMARY' }, (res) => {
      if (res?.ok) {
        setStreak(res.data.streak)
        setGoals(res.data.activeGoals)
      }
    })
  }, [])

  // ✅ addGoal SADECE işlem yapar, JSX döndürmez — burada BİTER
  function addGoal() {
    if (title.trim() === '') return

    chrome.runtime.sendMessage(
      { type: 'CREATE_GOAL', title: title, cadence: 'DAILY' },
      (res) => {
        if (res?.ok) {
          setTitle('')
          setGoals((g) => (g ?? 0) + 1)
        }
      }
    )
  }   // ← addGoal burada kapanıyor, JSX YOK

  function doCheckin() {
  chrome.runtime.sendMessage({ type: 'CHECKIN_QUICK' }, (res) => {
    if (res?.ok) {
      // checkin başarılı — streak'i güncelle
      chrome.runtime.sendMessage({ type: 'GET_SUMMARY' }, (r) => {
        if (r?.ok) setStreak(r.data.streak)
      })
    }
  })
}

  // ✅ Component'in TEK return'ü — ekranda görünen her şey burada
  return (
    <div style={{ width: 220, padding: 16, textAlign: 'center', font: '14px system-ui' }}>
      <h1>PixelSquire ⚔️</h1>

      <div style={{ marginBottom: 8 }}>
        <strong>Streak:</strong> {streak !== null ? `${streak} 🔥` : '...'}
      </div>
      <div style={{ marginBottom: 12 }}>
        <strong>Active Goals:</strong> {goals !== null ? goals : '...'}
      </div>

      {/* goal ekleme burada, ana return içinde */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Yeni hedef..."
      />
      <button onClick={addGoal}>Ekle</button>
      <button onClick={doCheckin}>Görev tamam ⚔️</button>
    </div>
  )
}