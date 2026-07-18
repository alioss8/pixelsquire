import { useEffect, useState } from "react"

export default function PixelSquireWidget() {
  const [streak, setStreak] = useState<number | null>(null)
  const [goals, setGoals] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_SUMMARY' }, (res) => {
      if (res?.ok) {
        setStreak(res.data.streak)
        setGoals(res.data.activeGoals)
      }
    })
    chrome.storage.local.get('mascotHidden').then((r) => {
      setHidden(Boolean(r.mascotHidden))
    })
  }, [])

  function addGoal() {
    if (title.trim() === '') return
    chrome.runtime.sendMessage(
      { type: 'CREATE_GOAL', title, cadence: 'DAILY' },
      (res) => {
        if (res?.ok) {
          setTitle('')
          setGoals((g) => (g ?? 0) + 1)
        }
      }
    )
  }

  async function toggleMascot() {
    const next = !hidden
    await chrome.storage.local.set({ mascotHidden: next })
    setHidden(next)

    if (!next) {
      const tabs = await chrome.tabs.query({})
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'SHOW_MASCOT' }).catch(() => {})
        }
      }
    }
  }

  async function handleGoogleLogin() {
    const tokenData = await chrome.storage.local.get('token')
    if (!tokenData.token) {
      alert('Token not found')
      return
    }

    const authUrl = `http://localhost:3001/api/v1/auth/google?device_token=${tokenData.token}`
    chrome.tabs.create({ url: authUrl })
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.crest}>⚔️</span>
        <h1 style={styles.title}>PixelSquire</h1>
      </div>

      <div style={styles.statBox}>
        <div style={styles.flame}>🔥</div>
        <div style={styles.statValue}>{streak !== null ? streak : '—'}</div>
        <div style={styles.statLabel}>day streak</div>
      </div>

      <div style={styles.goalCount}>
        {goals !== null ? goals : '—'} active {goals === 1 ? 'quest' : 'quests'}
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          placeholder="Add a new quest…"
        />
        <button style={styles.button} onClick={addGoal}>+</button>
      </div>

      <button style={styles.toggle} onClick={toggleMascot}>
        {hidden ? 'Show knight' : 'Hide knight'}
      </button>

      <button style={styles.googleButton} onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 280,
    padding: 22,
    background: 'linear-gradient(160deg, #3d3020 0%, #2e2419 100%)',
    fontFamily: "'Nunito', system-ui, sans-serif",
    color: '#ede4d3',
    textAlign: 'center',
    borderRadius: 14,
    border: '2px solid #6b5335',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 18,
  },
  crest: { fontSize: 20, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.5))' },
  title: {
    fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700,
    color: '#e0a458', margin: 0, letterSpacing: 0.5,
  },
  statBox: {
    background: 'rgba(224,164,88,0.08)', border: '1px solid #6b5335',
    borderRadius: 12, padding: '18px 0 14px', marginBottom: 14,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  flame: { fontSize: 18, marginBottom: 2 },
  statValue: {
    fontFamily: "'Cinzel', serif", fontSize: 44, fontWeight: 700,
    color: '#e0a458', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.4)',
  },
  statLabel: {
    fontSize: 12, color: '#b89b76', marginTop: 6,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  goalCount: { fontSize: 13, fontWeight: 600, color: '#7a9b5e', marginBottom: 18 },
  inputRow: { display: 'flex', gap: 8 },
  input: {
    flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid #6b5335',
    borderRadius: 9, color: '#ede4d3', fontFamily: "'Nunito', system-ui, sans-serif",
    fontSize: 13, padding: '10px 12px', outline: 'none',
  },
  button: {
    background: '#e0a458', border: 'none', borderRadius: 9, color: '#2e2419',
    fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20,
    width: 42, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
  },
  toggle: {
    marginTop: 14,
    width: '100%',
    background: 'transparent',
    border: '1px solid #6b5335',
    borderRadius: 9,
    color: '#b89b76',
    fontFamily: "'Nunito', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 10px',
    cursor: 'pointer',
  },
  googleButton: {
    marginTop: 10,
    width: '100%',
    background: '#ffffff',
    border: '1px solid #d3d3d3',
    borderRadius: 9,
    color: '#1f1f1f',
    fontFamily: "'Nunito', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 10px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  },
}