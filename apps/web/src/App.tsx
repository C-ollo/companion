import { useEffect, useRef, useState } from "react"

import {
  CATEGORY_LABELS,
  SUPPORT_LEVELS,
} from "@skill-passport/shared/src/types"
import {
  getSkill,
  isSafetyBlocked,
  safetyCategory,
} from "@skill-passport/shared/src/skills"
import type { SafetyCategory } from "@skill-passport/shared/src/skills"

import { apiAvailable } from "./api"
import { speak } from "./read-aloud"
import {
  askMessage,
  markSent,
  shareByText,
  startAsk,
  useAskRequest,
} from "./ask-friend"
import { matchLog, saveLog, useLogSession } from "./log-session"
import { useVoiceTyping } from "./voice-typing"
import {
  addEntry,
  HELP_LABELS,
  helpLabel,
  removeEntry,
  usePassportEntries,
} from "./passport-store"
import {
  askStepsFor,
  resetPointAsk,
  setStepIndex,
  startPointAsk,
  usePointAskSession,
} from "./point-ask-session"

type Page = "home" | "point" | "passport" | "people" | "guidance" | "logging" | "celebration" | "scan" | "identify" | "cafesteps" | "cafecomplete" | "summary" | "summary-editor" | "summary-sharing" | "summary-shares" | "supporters" | "add-supporter" | "cheer-detail" | "confirmer" | "credential" | "credential-export" | "data-backup" | "storage-control" | "safety-block" | "photo-confirmation" | "coach-standby" | "safe-alternatives" | "voice-log" | "skill-mapping" | "skill-clarification" | "voice-confirmed"
const A = "/assets"
const icons = {
  logo: `${A}/e2f39.svg`,
  sound: `${A}/8b506.svg`,
  profile: `${A}/59e02.svg`,
  home: `${A}/f6436.svg`,
  point: `${A}/5afb7.svg`,
  passport: `${A}/5ebf8.svg`,
  people: `${A}/e7db2.svg`,
  camera: `${A}/73b9a.svg`,
  upload: `${A}/5aa9d.svg`,
  scanner: `${A}/53e15.svg`,
  ring: `${A}/6d523.svg`,
  levelRing: `${A}/5735a.svg`,
  heart: `${A}/35378.svg`,
  highFive: `${A}/a8933.svg`,
  breathe: `${A}/4f2bd.svg`,
}
const pageCopy: Record<Page, string> = {
  home: "Good morning, Maya. How can I help you today? Choose My Skills to practice your skills, or Point and Ask for visual help.",
  point:
    "Point and Ask. Show me what you need help with. Point at any appliance, transit sign, menu, button, or label. Photos are never saved.",
  passport:
    "My Skills. You have two practice choices today: Washing Machine Laundry and Warm Food Safely. Choose the skill you want to practice.",
  people:
    "My People. Your private support network. Sarah and Jordan are trusted people you added.",
  guidance:
    "Step guidance. Add one cup of soap. Close the soap drawer. Take all the time you need.",
  logging:
    "You finished Washing Machine Laundry. How did it go today? There is no wrong answer.",
  celebration:
    "Great work, Maya. Your progress is recorded. My Skills now has fourteen stamps.",
  scan: "Point your camera at the café screen. Keep the screen inside the frame.",
  identify:
    "I think this is a café self-order touchscreen kiosk. Does this look right?",
  cafesteps: "Tap the Iced Drinks button. It is in the top row.",
  cafecomplete: "You did it, Maya. Your café order is complete.",
  summary:
    "My November Progress. You finished 18 routines and earned 14 stamps. You own and control this summary.",
  "summary-editor":
    "Edit what you did. Change any sentence to sound the way you want.",
  "summary-sharing":
    "Share my November Summary. Sharing is off until you create a private link.",
  "summary-shares":
    "Active shared links. See who can view your summaries. Turn off access anytime.",
  supporters:
    "My Supporters and Cheers. Private links are for people you trust.",
  "add-supporter":
    "Add a trusted person. Create a private cheer link. No account is needed.",
  "cheer-detail":
    "Cheer from Jordan. Proud of you. Cheers stay calm and positive.",
  confirmer:
    "In-person confirmation. Hand the phone to a trusted friend or family member. They tap to verify you did this together.",
  credential:
    "My Skills record. A record of everyday skills Maya has learned.",
  "credential-export":
    "Print or save a copy. Choose how to keep or share your official skill record.",
  "data-backup":
    "Back up My Skills. Your data stays on your phone. Create an offline backup file.",
  "storage-control":
    "Storage and data control. You own every piece of your data.",
  "safety-block":
    "Stovetop burner detected. We do not guide stoves, ovens, heaters, or medication. A trusted friend or family member can help you in person.",
  "photo-confirmation":
    "Check your photo before sending. Your photo stays on this device unless you choose to share it with Sarah, your family friend.",
  "coach-standby": "Sarah is on her way. Take a seat and relax while you wait.",
  "safe-alternatives":
    "Safe ways to warm food without turning on the stove. There is no pressure.",
  "voice-log":
    "Tell me what you did. Speak or type in your own words. You can always type instead.",
  "skill-mapping":
    "Here is what we found. We matched your words to a routine in My Skills.",
  "skill-clarification":
    "Did you mean this skill? We ask one question when we are unsure. You decide.",
  "voice-confirmed":
    "Your voice log was saved. You earned your fifteenth stamp and unlocked Coffee with Jordan.",
}

function Icon({
  src,
  alt = "",
  className = "",
}: {
  src: string
  alt?: string
  className?: string
}) {
  return <img className={`icon ${className}`} src={src} alt={alt} />
}
function AppHeader({ page }: { page: Page }) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <img
            className="brand-logo-canvas"
            src={icons.logo}
            alt=""
            width="512"
            height="512"
          />
        </span>
        <span>
          <b className="brand-wordmark">Companion</b>
        </span>
      </div>
      <div className="header-actions">
        <button
          className="quiet-button"
          onClick={() => speak(pageCopy[page])}
          aria-label="Read this page aloud"
        >
          <Icon src={icons.sound} />
          <span>Read to me</span>
        </button>
        <button
          className="avatar-button"
          aria-label="Open profile and settings"
        >
          <Icon src={icons.profile} />
        </button>
      </div>
    </header>
  )
}
function BottomNav({ page, go }: { page: Page; go: (page: Page) => void }) {
  const items: { id: Page; label: string; icon: string }[] = [
    { id: "home", label: "Home", icon: icons.home },
    { id: "point", label: "Point & Ask", icon: icons.point },
    { id: "passport", label: "My Skills", icon: icons.passport },
    { id: "people", label: "My People", icon: icons.people },
  ]
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
        <button
          className={page === item.id ? "active" : ""}
          key={item.id}
          onClick={() => go(item.id)}
          aria-current={page === item.id ? "page" : undefined}
        >
          <Icon src={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
function FeatureSticker({ kind }: { kind: "passport" | "point" }) {
  return kind === "point" ? (
    <span className="feature-sticker scanner-sticker">
      <Icon src={icons.scanner} />
    </span>
  ) : (
    <span className="feature-sticker passport-sticker" aria-hidden="true">
      <i className="passport-crest">✦</i>
      <i className="bookmark" />
    </span>
  )
}
function BreathingCard() {
  const [breathing, setBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState<"in" | "out">("in")

  useEffect(() => {
    if (!breathing) {
      setBreathPhase("in")
      return
    }

    const phaseTimer = window.setInterval(() => {
      setBreathPhase((phase) => (phase === "in" ? "out" : "in"))
    }, 4000)

    return () => window.clearInterval(phaseTimer)
  }, [breathing])

  const toggleBreathing = () => setBreathing((value) => !value)

  return (
    <section
      className={`calm-card ${breathing ? "breathing" : ""}`}
      aria-labelledby="breathing-title"
    >
      <div className="calm-copy">
        <h3 id="breathing-title">Take a calm breath</h3>
        <p>Tap to breathe. 4 seconds in and 4 seconds out.</p>
        <button
          className="breath-control"
          type="button"
          onClick={toggleBreathing}
          aria-pressed={breathing}
          aria-label={
            breathing ? "Stop breathing exercise" : "Start breathing exercise"
          }
        >
          <span className="breath-ring" aria-hidden="true" />
          <span className="breath-orb">
            {breathing && (
              <strong aria-live="polite">
                {breathPhase === "in" ? "Breathe in" : "Breathe out"}
              </strong>
            )}
          </span>
        </button>
        {breathing && (
          <p className="breath-stop-hint" aria-live="polite">
            Tap whenever you’re ready to stop.
          </p>
        )}
      </div>
    </section>
  )
}
function Home({ go }: { go: (page: Page) => void }) {
  return (
    <main className="page home-page">
      <section className="greeting">
        <h1>Good morning, Maya.</h1>
        <p>How can I help you today?</p>
      </section>
      <section className="feature-grid" aria-label="Primary choices">
        <article className="feature-card">
          <figure className="feature-cover">
            <img
              src={`${A}/point-ask-cover.webp`}
              alt="A person using Point and Ask to identify a washing machine control"
            />
            <i className="corner tl" aria-hidden="true" />
            <i className="corner tr" aria-hidden="true" />
            <i className="corner bl" aria-hidden="true" />
            <i className="corner br" aria-hidden="true" />
          </figure>
          <p className="eyebrow feature-heading">Point & Ask</p>
          <h2 className="feature-tagline">Visual Help Anywhere</h2>
          <p>
            Point your camera at appliances, signs, labels, or counters for
            instant guidance.
          </p>
          <button
            className="primary-button home-point-action"
            onClick={() => go("point")}
          >
            Open Point & Ask Camera
          </button>
        </article>
        <article className="feature-card">
          <figure className="feature-cover skill-passport-cover">
            <img
              src={`${A}/skill-passport-cover.webp`}
              alt="An illustrated skills book showing everyday skills"
            />
          </figure>
          <p className="eyebrow feature-heading">My Skills</p>
          <h2 className="feature-tagline">Practice My Skills</h2>
          <p>Skill tracker, step-by-step guides, and progress logs.</p>
          <div className="feature-top">
            <div className="badge-row">
              <span className="slate-badge">
                <i />3 tasks today
              </span>
            </div>
          </div>
          <button
            className="outline-button home-passport-action"
            onClick={() => go("passport")}
          >
            Open My Skills
          </button>
        </article>
      </section>
      <BreathingCard />
    </main>
  )
}
const categories = [
  ["washer", "Appliances & Machines", "Washers, microwaves, kettles, stoves"],
  [
    "train",
    "Transit & Street Signs",
    "Bus stops, rail maps, wayfinding directions",
  ],
  [
    "menu",
    "Menus & Food Orders",
    "Café counters, menus, receipts, food labels",
  ],
  ["dial", "Buttons & Dials", "Thermostats, remotes, elevator panels"],
]
function PointAsk({ go }: { go: (page: Page) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<File | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo)
    },
    [photo],
  )
  const onFile = (file?: File) => {
    if (!file) return
    if (photo) URL.revokeObjectURL(photo)
    fileRef.current = file
    setPhoto(URL.createObjectURL(file))
    setMessage("Photo ready. Tap Get simple guidance.")
  }
  const getGuidance = () => {
    if (apiAvailable && fileRef.current) {
      void startPointAsk(fileRef.current)
      go("identify")
      return
    }
    setMessage(
      "This looks like a control panel. Start by finding the large round power button. Take your time.",
    )
  }
  return (
    <main className="page point-page">
      <section className="screen-intro">
        <span className="slate-badge">✦ Visual Helper</span>
        <h1>Show me what you need help with.</h1>
        <p>Point at any appliance, transit sign, menu, button, or label.</p>
      </section>
      <section className="camera-card">
        <div className="viewfinder">
          <img
            src={photo || `${A}/dd509.png`}
            alt={
              photo
                ? "Your selected photo"
                : "Example home and community setting"
            }
          />
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <span className="camera-orb">
            <Icon src={icons.camera} />
          </span>
          {photo && <b>Photo ready for guidance</b>}
        </div>
        <input
          ref={inputRef}
          className="file-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <button className="primary-button centered" onClick={() => go("scan")}>
          <Icon src={icons.camera} />
          Open camera
        </button>
        <button
          className="soft-button"
          onClick={() => inputRef.current?.click()}
        >
          <Icon src={icons.upload} />
          Or upload a photo from your phone
        </button>
        {photo && (
          <button className="guidance-button" onClick={getGuidance}>
            Get simple guidance
          </button>
        )}
        {message && (
          <p className="guidance-message" role="status">
            {message}
          </p>
        )}
      </section>
      <section className="examples">
        <h2>Examples of what we explain:</h2>
        <div className="category-list">
          {categories.map(([sticker, title, copy]) => (
            <article className="category-card" key={title}>
              <span
                className={`category-sticker ${sticker}`}
                aria-hidden="true"
              >
                <i />
              </span>
              <span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="privacy-card">
        <span>
          <h2>Your Privacy Is Safe</h2>
          <p>
            Photos are never saved. Pictures stay in memory and are discarded
            immediately.
          </p>
        </span>
      </section>
    </main>
  )
}
function MasteryRing() {
  return (
    <span className="mastery-ring">
      <Icon src={icons.ring} />
    </span>
  )
}
const practices = [
  ["Stovetop Pasta", "Cooking", "Yesterday", "pot"],
  ["Light Rail Route", "Transit", "Tuesday", "rail"],
  ["Grocery List", "Shopping", "Monday", "list"],
]
const todaysPractices: {
  title: string
  image: string
  imageAlt: string
  duration: string
  page: Page
}[] = [
  {
    title: "Washing Machine Laundry",
    image: `${A}/b942e.png`,
    imageAlt: "A calm residential laundry room with front-loading machines",
    duration: "15 min",
    page: "guidance",
  },
  {
    title: "Warm Food Safely",
    image: `${A}/dd509.png`,
    imageAlt: "A kitchen counter with a toaster, kettle, and other appliances",
    duration: "8 min",
    page: "safe-alternatives",
  },
]
// Short day label for saved entries: "Today", "Yesterday", or the weekday.
function dayLabel(iso: string) {
  const day = new Date(iso)
  const today = new Date()
  const days = Math.round(
    (new Date(today.toDateString()).getTime() -
      new Date(day.toDateString()).getTime()) /
      86_400_000,
  )
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return day.toLocaleDateString(undefined, { weekday: "long" })
}
function stickerFor(skillId: string) {
  const category = getSkill(skillId)?.category
  if (category === "getting_around") return "rail"
  if (skillId === "stovetop_cooking" || skillId === "microwave_meal") return "pot"
  return "list"
}
function Passport({ go }: { go: (page: Page) => void }) {
  const [highFive, setHighFive] = useState(false)
  const saved = [...usePassportEntries()].reverse()
  const [practiceIndex, setPracticeIndex] = useState(0)
  const practice = todaysPractices[practiceIndex]
  const showPreviousPractice = () =>
    setPracticeIndex(
      (practiceIndex - 1 + todaysPractices.length) % todaysPractices.length,
    )
  const showNextPractice = () =>
    setPracticeIndex((practiceIndex + 1) % todaysPractices.length)

  return (
    <main className="page passport-page">
      <section className="passport-banner">
        <span>
          <b>Today's Practice</b>
        </span>
      </section>
      <section
        className="routine-carousel"
        aria-label="Today's practice choices"
        aria-roledescription="carousel"
      >
        <div className="routine-carousel-heading">
          <span>
            <h1>Choose a skill to practice</h1>
          </span>
          <strong>
            {practiceIndex + 1} of {todaysPractices.length}
          </strong>
        </div>
        <article className="routine-card" aria-live="polite">
          <div className="routine-photo">
            <img src={practice.image} alt={practice.imageAlt} />
            <span className="duration">◷ {practice.duration}</span>
          </div>
          <div className="routine-body">
            <div className="routine-title">
              <span>
                <h2>{practice.title}</h2>
              </span>
            </div>
            <button
              className="primary-button centered"
              onClick={() => go(practice.page)}
            >
              Start Steps
            </button>
          </div>
        </article>
        <div className="carousel-controls">
          <button onClick={showPreviousPractice} aria-label="Previous skill">
            <span>Previous</span>
          </button>
          <div className="carousel-dots" aria-label="Choose a skill">
            {todaysPractices.map((item, index) => (
              <button
                className={practiceIndex === index ? "active" : ""}
                key={item.title}
                onClick={() => setPracticeIndex(index)}
                aria-label={`Show ${item.title}`}
                aria-current={practiceIndex === index ? true : undefined}
              />
            ))}
          </div>
          <button onClick={showNextPractice} aria-label="Next skill">
            <span>Next</span>
          </button>
        </div>
      </section>
      <section className="ring-legend" aria-label="Independence level legend">
        <span>
          <i className="rings one" />
          With someone
        </span>
        <span className="selected">
          <i className="rings two" />
          With AI help
        </span>
        <span>
          <i className="rings three" />
          By myself
        </span>
      </section>
      <section className="recent-section">
        <div className="section-heading">
          <h2>Recent Practice</h2>
          <span>{saved.length + practices.length} Completed</span>
        </div>
        <div className="practice-list">
          {saved.slice(0, 5).map((entry) => {
            const skill = getSkill(entry.skillId)
            const label = helpLabel(entry)
            return (
              <article className="practice-card" key={entry.id}>
                <span className={`mini-sticker ${stickerFor(entry.skillId)}`} />
                <span className="practice-name">
                  <b>{skill?.name ?? entry.skillId}</b>
                  <small>
                    {entry.place ||
                      (skill ? CATEGORY_LABELS[skill.category] : "")}
                  </small>
                </span>
                <MasteryRing />
                <span
                  className="mastered"
                  style={{ maxWidth: "40%", textAlign: "right" }}
                >
                  <b>
                    {label.replace(/^[●○]+\s*/, "")}
                  </b>
                  <small>
                    {dayLabel(entry.at)}
                    {entry.source === "confirmed" && entry.confirmedBy
                      ? ` · with ${entry.confirmedBy}`
                      : ""}
                  </small>
                </span>
              </article>
            )
          })}
          {practices.map(([title, type, day, sticker]) => (
            <article className="practice-card" key={title}>
              <span className={`mini-sticker ${sticker}`} />
              <span className="practice-name">
                <b>{title}</b>
                <small>{type}</small>
              </span>
              <MasteryRing />
              <span className="mastered">
                <b>Learned</b>
                <small>{day}</small>
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="monthly-summary-entry">
        <span>
          <small>November 2024</small>
          <h2>Monthly Summary</h2>
          <p>Review your routines, stamps, and progress.</p>
        </span>
        <button onClick={() => go("summary")}>Open Summary</button>
      </section>
      <section className="credential-entry-grid">
        <button onClick={() => go("credential")}>
          <span>Official document</span>
          <b>My Skills record</b>
          <small>View and save your official skill record.</small>
        </button>
        <button onClick={() => go("data-backup")}>
          <span>On this phone</span>
          <b>Back Up My Skills</b>
          <small>Save your progress to an offline file.</small>
        </button>
      </section>
      <section className="cheer-card">
        <div className="cheer-person">
          <img src={`${A}/1bb43.png`} alt="Jordan, trusted friend" />
          <span>
            <b>Jordan</b>
            <small>Trusted Friend</small>
          </span>
          <span className="heart">
            <Icon src={icons.heart} />
          </span>
        </div>
        <blockquote>“Great job on your laundry Maya! Proud of you.”</blockquote>
        <div className="cheer-actions">
          <small>Sent today at 10:15 AM</small>
          <button onClick={() => setHighFive(true)} disabled={highFive}>
            <Icon src={icons.highFive} />
            {highFive ? "High Five Sent" : "Send High Five"}
          </button>
        </div>
      </section>
      <BreathingCard />
    </main>
  )
}
function FlowTopBar({
  title,
  back,
  close,
}: {
  title: string
  back: () => void
  close: () => void
}) {
  return (
    <header className="flow-topbar">
      <button onClick={back} aria-label="Go back">
        ←
      </button>
      <strong>{title}</strong>
      <span>
        <button onClick={close} aria-label="Close this flow">
          ×
        </button>
        <button className="flow-avatar" aria-label="Open profile">
          <Icon src={icons.profile} />
        </button>
      </span>
    </header>
  )
}
function FlowProgress() {
  return (
    <section className="flow-progress" aria-label="Step 2 of 4. 50% complete.">
      <div>
        <b>Step 2 of 4</b>
        <span>50% Completed</span>
      </div>
      <div className="segments" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <i className={step < 3 ? "done" : ""} key={step} />
        ))}
      </div>
      <div className="step-labels">
        <b>1. Load</b>
        <b>2. Soap</b>
        <span>3. Dial</span>
        <span>4. Start</span>
      </div>
    </section>
  )
}
function Guidance({ go }: { go: (page: Page) => void }) {
  const [paused, setPaused] = useState(false)
  const [items, setItems] = useState([true, true])
  const toggleItem = (index: number) =>
    setItems((current) =>
      current.map((value, itemIndex) => (index === itemIndex ? !value : value)),
    )
  return (
    <div className="flow-screen">
      <FlowTopBar
        title="Step Guidance"
        back={() => go("passport")}
        close={() => go("home")}
      />
      <main className="flow-main">
        <div className="context-chips">
          <span>Washing Machine Laundry</span>
          <span>My Apartment</span>
        </div>
        <FlowProgress />
        <aside className="reassurance">
          <b>♥ No rush at all</b>
          <p>The washing machine will wait for you.</p>
        </aside>
        <div className="guidance-layout">
          <article className="instruction-card">
            <p className="flow-label">Instruction</p>
            <h1>Add one cup of soap. Close the soap drawer.</h1>
            <p>Pour detergent into compartment number 2.</p>
            <button
              className="audio-pill"
              onClick={() => speak(pageCopy.guidance)}
            >
              <Icon src={icons.sound} />
              Read this step aloud
            </button>
            <section className="drawer-card">
              <div className="drawer-heading">
                <h2>Where the soap goes</h2>
                <span>Compartment II</span>
              </div>
              <div className="drawer-photo">
                <img
                  src={`${A}/69df6.png`}
                  alt="Washing machine soap drawer with compartment two open"
                />
                <div>
                  <b>✓ Soap Compartment II</b>
                  <span>Fill only to the max line.</span>
                </div>
              </div>
            </section>
          </article>
          <aside className="guidance-side">
            <section className="items-card">
              <div>
                <h2>Items Needed</h2>
                <span>{items.filter(Boolean).length} of 2 ready</span>
              </div>
              {["Laundry detergent liquid", "Measuring cap"].map(
                (item, index) => (
                  <button key={item} onClick={() => toggleItem(index)}>
                    <i className={items[index] ? "checked" : ""}>
                      {items[index] ? "✓" : ""}
                    </i>
                    {item}
                  </button>
                ),
              )}
            </section>
            <section className="coach-support">
              <span className="coach-initial">S</span>
              <span>
                <b>Sarah</b>
                <small>Family friend in My People</small>
              </span>
              <button onClick={() => speak("Sarah is ready to help.")}>
                Get audio support
              </button>
            </section>
          </aside>
        </div>
      </main>
      {paused && (
        <div className="pause-notice" role="status">
          <b>Routine paused.</b>
          <span>Continue whenever you are ready.</span>
        </div>
      )}
      <nav className="flow-actions" aria-label="Step controls">
        <button className="flow-secondary" onClick={() => go("passport")}>
          ← Previous
        </button>
        <button className="flow-secondary" onClick={() => setPaused(!paused)}>
          {paused ? "Continue" : "Pause"}
        </button>
        <button className="flow-primary" onClick={() => go("logging")}>
          Next: Turn dial to Normal →
        </button>
      </nav>
    </div>
  )
}
const observations = [
  {
    title: "I needed help",
    level: "●○○ With someone",
    copy: "A supporter did the steps with me.",
  },
  {
    title: "I needed a reminder",
    level: "●●○ With AI help",
    copy: "I used visual cards or a quick reminder.",
  },
  {
    title: "I did it by myself",
    level: "●●● By myself",
    copy: "I completed every step without reminders.",
  },
]
function Logging({ go }: { go: (page: Page) => void }) {
  const [choice, setChoice] = useState(1)
  const [confirmed, setConfirmed] = useState(true)
  // Save what the person chose, on this device, then celebrate.
  const saveAndContinue = () => {
    addEntry({
      skillId: "laundry",
      level: SUPPORT_LEVELS[choice] ?? "with_prompt",
      place: "My Apartment",
      via: "practice",
      source: confirmed ? "confirmed" : "self",
      confirmedBy: confirmed ? "Sarah" : undefined,
    })
    go("celebration")
  }
  return (
    <div className="flow-screen">
      <FlowTopBar
        title="How It Went"
        back={() => go("guidance")}
        close={() => go("home")}
      />
      <main className="flow-main logging-main">
        <section className="finish-banner">
          <span className="finish-check">✓</span>
          <div>
            <span className="mint-badge">Step 4 of 4 complete</span>
            <h1>Great job! You finished Washing Machine Laundry!</h1>
            <p>Choose one answer below.</p>
          </div>
          <button
            className="audio-pill"
            onClick={() => speak(pageCopy.logging)}
          >
            <Icon src={icons.sound} />
            Listen to options
          </button>
          <img
            className="finish-thumb"
            src={`${A}/6d93e.png`}
            alt="Washing machine laundry preview"
          />
        </section>
        <div className="logging-layout">
          <section className="decision-card">
            <h2>How did it go today?</h2>
            <p>Every level adds to My Skills.</p>
            <p>There is no wrong answer.</p>
            <div className="radio-list" role="radiogroup">
              {observations.map((option, index) => (
                <button
                  role="radio"
                  aria-checked={choice === index}
                  className={choice === index ? "selected" : ""}
                  key={option.title}
                  onClick={() => setChoice(index)}
                >
                  <i>{choice === index ? "✓" : ""}</i>
                  <span>
                    <b>{option.title}</b>
                    <small>{option.copy}</small>
                  </span>
                  <em>{option.level}</em>
                </button>
              ))}
            </div>
          </section>
          <aside className="passport-preview">
            <p className="flow-label">My Skills entry preview</p>
            <div className="stamp-preview">
              <strong>
                Level {choice + 1}
                <small>Stamp</small>
              </strong>
              <span>
                <b>Washing Machine Laundry</b>
                <small>{choice + 1} of 3 dots earned</small>
              </span>
            </div>
            <dl>
              <div>
                <dt>Location</dt>
                <dd>My Apartment</dd>
              </div>
              <div>
                <dt>Log Mode</dt>
                <dd>{confirmed ? "In-person confirmed" : "Self-reported"}</dd>
              </div>
              <div>
                <dt>Next Review</dt>
                <dd>Whenever ready</dd>
              </div>
            </dl>
            <div className="coach-quote">
              <img src={`${A}/c2624.png`} alt="Sarah, family friend" />
              <span>
                <b>Sarah says</b>
                <p>“Steady steps count, Maya.”</p>
              </span>
            </div>
          </aside>
        </div>
        <section className="confirmer-card">
          <div className="confirm-toggle">
            <span>
              <b>Did a support person practice with you?</b>
              <small>Choose what happened in person.</small>
            </span>
            <button
              role="switch"
              aria-checked={confirmed}
              className={confirmed ? "on" : ""}
              onClick={() => setConfirmed(!confirmed)}
            >
              <i />
              {confirmed ? "On" : "Off"}
            </button>
          </div>
          {confirmed && (
            <div className="verified-coach">
              <span>S</span>
              <p>
                <b>Sarah ✓</b>
                <small>Family Friend · In-person confirmed</small>
              </p>
            </div>
          )}
          <p className="equal-credit">
            <b>Equal Credit:</b> All logs count toward badge growth.
          </p>
        </section>
        <button className="tell-more-button" onClick={() => go("voice-log")}>
          Tell me something else
          <small>Use your voice or type your own activity.</small>
        </button>
      </main>
      <nav className="flow-actions logging-actions">
        <button className="flow-secondary" onClick={() => go("guidance")}>
          ← Edit previous steps
        </button>
        <button className="flow-primary" onClick={saveAndContinue}>
          Save to My Skills & Continue →
        </button>
      </nav>
    </div>
  )
}
function Celebration({ go }: { go: (page: Page) => void }) {
  const [saved, setSaved] = useState(true)
  return (
    <div className="flow-screen">
      <FlowTopBar
        title="My Skills Updated"
        back={() => go("logging")}
        close={() => go("home")}
      />
      <main className="flow-main celebration-main">
        {saved ? (
          <section className="undo-bar">
            <span>
              <b>Log saved</b>
              <small>Undo is available now.</small>
            </span>
            <button onClick={() => setSaved(false)}>Undo</button>
          </section>
        ) : (
          <section className="undo-bar" role="status">
            <span>
              <b>Log removed</b>
              <small>You can edit your answer.</small>
            </span>
            <button onClick={() => go("logging")}>Edit log</button>
          </section>
        )}
        <article className="celebration-card">
          <span className="sage-badge">My Skills Updated</span>
          <div className="celebration-heading">
            <span>
              <h1>Great work, Maya!</h1>
              <p>Your laundry log is now in My Skills.</p>
            </span>
            <button
              className="audio-pill"
              onClick={() => speak(pageCopy.celebration)}
            >
              <Icon src={icons.sound} />
              Read aloud
            </button>
          </div>
          <section className="mastery-panel">
            <div className="flow-mastery-rings">
              <img src={`${A}/47fe0.svg`} alt="" />
              <img src={`${A}/5a4b8.svg`} alt="" />
              <img src={`${A}/43ee8.svg`} alt="" />
              <img src={`${A}/4a090.svg`} alt="" />
              <img src={`${A}/ce3b6.svg`} alt="" />
              <img src={`${A}/92df6.svg`} alt="" />
              <span>
                <Icon src={`${A}/8f7a5.svg`} />
                <b>Tier 2/3</b>
              </span>
            </div>
            <div>
              <h2>Level 2 of 3 · With AI help</h2>
              <span className="level-pill">●●○ AI help</span>
              <p>My Apartment upgraded to Level 2.</p>
              <p>One routine by yourself earns the next skill level.</p>
            </div>
          </section>
          <section className="metric-grid">
            <div>
              <small>Confirmed routine</small>
              <b>✓ Wash & Fold Cycle</b>
            </div>
            <div>
              <small>Support Used</small>
              <b>1 spoken reminder</b>
            </div>
            <div>
              <small>Time Spent</small>
              <b>Take your time</b>
            </div>
          </section>
        </article>
        <section className="celebration-grid">
          <article>
            <span>
              <p className="flow-label">My Skills balance</p>
              <h2>14 Stamps</h2>
            </span>
            <img src={`${A}/6d93e.png`} alt="Laundry stamp preview" />
            <p>+1 permanent laundry stamp</p>
          </article>
          <article className="supporter-note">
            <img src={`${A}/1bb43.png`} alt="Jordan, trusted friend" />
            <span>
              <p className="flow-label">Supporter note</p>
              <h2>Jordan</h2>
            </span>
            <blockquote>
              “Proud of you starting before 11 today, Maya!”
            </blockquote>
          </article>
        </section>
      </main>
      <nav className="flow-actions logging-actions">
        <button className="flow-secondary" onClick={() => go("home")}>
          Return to Daily Home
        </button>
        <button className="flow-primary" onClick={() => go("passport")}>
          View My Skills →
        </button>
      </nav>
    </div>
  )
}
const cafeGoals = [
  ["Order or buy something", "Menus, prices, drinks and payment"],
  ["Use this machine", "Step buttons, dials and knobs"],
  ["Read text or labels", "Translate words to audio"],
  ["Something else", "General everyday guidance"],
]
function CafeScan({ go }: { go: (page: Page) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [goal, setGoal] = useState(0)
  const [flash, setFlash] = useState(false)
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo)
    },
    [photo],
  )
  const choosePhoto = (file?: File) => {
    if (!file) return
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(URL.createObjectURL(file))
    if (apiAvailable) {
      void startPointAsk(file)
      go("identify")
    }
  }
  // With the API on, the viewfinder shows the live camera. If the browser
  // can't open it (no permission, no camera), tapping opens the phone camera.
  const videoRef = useRef<HTMLVideoElement>(null)
  const [camera, setCamera] = useState<"starting" | "on" | "off">(
    apiAvailable ? "starting" : "off",
  )
  useEffect(() => {
    if (!apiAvailable) return
    let stream: MediaStream | null = null
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((track) => track.stop())
          return
        }
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
        setCamera("on")
      })
      .catch(() => setCamera("off")) ?? setCamera("off")
    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])
  const captureFrame = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          choosePhoto(new File([blob], "photo.jpg", { type: "image/jpeg" }))
        }
      },
      "image/jpeg",
      0.9,
    )
  }
  // With the API on, Capture uses the live camera (or opens the phone camera);
  // without it, the designer's sample flow runs.
  const scan = () => {
    if (apiAvailable) {
      if (camera === "on") captureFrame()
      else inputRef.current?.click()
      return
    }
    resetPointAsk()
    go("identify")
  }
  return (
    <div className="flow-screen cafe-flow">
      <FlowTopBar
        title="Point & Ask"
        back={() => go("point")}
        close={() => go("home")}
      />
      <main className="flow-main cafe-main">
        <div className="cafe-landmark">
          <span>Step 1 of 4 · Take a photo</span>
          <button
            onClick={() =>
              speak(
                apiAvailable
                  ? "Point your camera at what you need help with. We help step by step."
                  : pageCopy.scan,
              )
            }
          >
            <Icon src={icons.sound} />
            Read aloud
          </button>
        </div>
        <p className="cafe-intro">
          {apiAvailable
            ? "Point your camera at what you need help with. We help step by step."
            : "Point your camera at the café screen. We help step by step."}
        </p>
        <section
          className="cafe-viewfinder"
          onClick={
            apiAvailable && camera === "off"
              ? () => inputRef.current?.click()
              : undefined
          }
          style={
            apiAvailable && camera === "off" ? { cursor: "pointer" } : undefined
          }
        >
          {apiAvailable && camera !== "off" ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Live camera view"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : apiAvailable && !photo ? (
            <div
              aria-hidden="true"
              style={{ width: "100%", height: "100%", background: "var(--color-primary)" }}
            />
          ) : (
            <img
              src={photo || `${A}/502a5.png`}
              alt="Café self-order touchscreen kiosk"
            />
          )}
          <span className="camera-status">
            {!apiAvailable || camera === "on"
              ? "● Camera active"
              : camera === "starting"
                ? "● Starting camera..."
                : "● Camera off"}
          </span>
          <button
            className={flash ? "flash active" : "flash"}
            onClick={() => setFlash(!flash)}
            aria-pressed={flash}
            aria-label="Toggle flash"
          >
            ◐
          </button>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          {!apiAvailable ? (
            <div className="aim-prompt">
              <b>Aim at the order screen</b>
              <span>Keep screen inside the frame</span>
            </div>
          ) : camera === "off" ? (
            <div className="aim-prompt">
              <b>Tap here to open your camera</b>
              <span>Then take a photo of what you need help with</span>
            </div>
          ) : (
            <div
              className="aim-prompt"
              style={{ top: "auto", bottom: 14, transform: "translateX(-50%)" }}
            >
              <b>Aim at what you need help with</b>
              <span>Then tap Capture Photo</span>
            </div>
          )}
        </section>
        <input
          ref={inputRef}
          className="file-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => choosePhoto(event.target.files?.[0])}
        />
        {/* No capture attribute, so phones open the photo library. */}
        <input
          ref={uploadRef}
          className="file-input"
          type="file"
          accept="image/*"
          onChange={(event) => choosePhoto(event.target.files?.[0])}
        />
        <div className="capture-actions">
          <button className="flow-primary" onClick={scan}>
            <Icon src={icons.camera} />
            Capture Photo
          </button>
          <button
            className="flow-secondary"
            onClick={() =>
              (apiAvailable ? uploadRef : inputRef).current?.click()
            }
          >
            <Icon src={icons.upload} />
            Upload photo instead
          </button>
        </div>
        <section className="memory-card">
          <span className="shield">✓</span>
          <span>
            <h2>Your privacy is safe</h2>
            <p>This app does not keep your photo.</p>
            <p>It checks and deletes it immediately.</p>
          </span>
        </section>
        {!apiAvailable && (
        <section className="goal-section">
          <div>
            <h2>What do you want to do?</h2>
            <span>1 choice</span>
          </div>
          <div className="goal-list" role="radiogroup">
            {cafeGoals.map(([title, copy], index) => (
              <button
                key={title}
                role="radio"
                aria-checked={goal === index}
                className={goal === index ? "selected" : ""}
                onClick={() => setGoal(index)}
              >
                <i>{goal === index ? "✓" : ""}</i>
                <span>
                  <b>{title}</b>
                  <small>{copy}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
        )}
      </main>
      <nav className="cafe-bottom">
        <button className="flow-primary" onClick={scan}>
          {apiAvailable ? "Take Photo & Get Help →" : "Scan Kiosk Screen →"}
        </button>
      </nav>
    </div>
  )
}
// Ideas to tap on "What do you want to do with it?", by skill.
const GOAL_IDEAS: Record<string, string[]> = {
  laundry: ["Wash my clothes", "Wash my bedsheets", "Pick the right setting"],
  dryer: ["Dry my clothes", "Pick the right setting"],
  cafe_self_order: ["Order a drink", "Order food", "Pay"],
  microwave_meal: ["Warm up my food", "Set the time"],
  dishes: ["Wash the dishes", "Start the dishwasher"],
  light_rail_to_work: ["Buy a ticket", "Find my train"],
  new_bus_route: ["Buy a ticket", "Find my bus"],
  grocery_shopping: ["Find the price", "Pay"],
}
const DEFAULT_GOAL_IDEAS = ["Turn it on", "Read the labels", "Pick the right setting"]

function CafeIdentify({ go }: { go: (page: Page) => void }) {
  const session = usePointAskSession()
  const result = session.result
  const live = session.status !== "idle"
  // After "Yes", the person says what they want to do before the steps.
  const [asking, setAsking] = useState(false)
  const [goalText, setGoalText] = useState("")
  const [goalError, setGoalError] = useState("")
  const askRef = useRef<HTMLElement>(null)
  const voice = useVoiceTyping(goalText, setGoalText)
  const goalIdeas = (result && GOAL_IDEAS[result.skill_id]) || DEFAULT_GOAL_IDEAS
  const confirm = () => {
    if (!live) {
      go("cafesteps")
      return
    }
    setAsking(true)
    setTimeout(
      () => askRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    )
  }
  const startSteps = () => {
    const words = goalText.trim()
    if (voice.listening) voice.toggle()
    if (!words) {
      // The basic steps were loaded with the photo.
      go("cafesteps")
      return
    }
    if (isSafetyBlocked(words)) {
      setGoalError(
        "I don't give steps for stoves, heaters, electrical work or medication. Let's ask someone you trust.",
      )
      return
    }
    void askStepsFor(words)
    go("cafesteps")
  }
  const unsure = session.status === "ready" && Boolean(result?.unsure_reason)
  useEffect(() => {
    if (result?.safety_blocked) go("safety-block")
  }, [result, go])

  const badge =
    session.status === "loading"
      ? "● Checking your photo"
      : session.status === "error"
        ? "● Could not check"
        : unsure
          ? "● Check first · Not sure"
          : result
            ? `● Check first · ${Math.round(result.confidence * 100)}% match`
            : "● Check first · 96% match"
  const heading =
    session.status === "loading"
      ? "Looking at your photo..."
      : session.status === "error"
        ? "I couldn't check this photo right now."
        : unsure
          ? "I'm not sure. I won't guess."
          : result
            ? result.check_statement
            : "I think this is a Café Self-Order Touchscreen Kiosk."
  const question =
    session.status === "loading"
      ? "This takes a few seconds."
      : session.status === "error"
        ? "Try another photo, or ask someone you trust."
        : unsure
          ? (result?.unsure_reason ?? "Try another photo, or ask someone you trust.")
          : "Does this look right to you?"
  const same = result ? result.same_as_before : ["Food and drink categories are across the top."]
  const different = result ? result.different : ["The card reader is below the screen."]
  const comparison = [...same, ...different].join(" ")
  const canStart = !live || (session.status === "ready" && !unsure)
  // A skill they already have, on a different type of item.
  const knownSkill =
    session.status === "ready" && !unsure && result
      ? session.known.find((k) => k.skillId === result.skill_id)
      : undefined
  const knownName = knownSkill ? getSkill(knownSkill.skillId)?.name : undefined
  const words = (v = "") => v.toLowerCase().replace(/[^a-z]+/g, " ").trim()
  const sameAsBefore =
    Boolean(knownSkill?.learnedOn && result) &&
    words(knownSkill?.learnedOn) === words(result?.item_name)
  const typeLine = sameAsBefore
    ? "You've used this one before."
    : `This one is a different type: ${result?.item_name}.`
  const knownText =
    knownSkill && knownName && result
      ? `You already know this: ${knownName}. ${
          knownSkill.learnedOn && !sameAsBefore
            ? `You learned it on: ${knownSkill.learnedOn}. `
            : ""
        }${typeLine}${different.length > 0 && !sameAsBefore ? " Below is what's different." : ""}`
      : ""

  return (
    <div className="flow-screen cafe-flow">
      <FlowTopBar
        title="Object Identification"
        back={() => go("scan")}
        close={() => go("home")}
      />
      <main className="flow-main cafe-main">
        <div className="cafe-landmark">
          <span>{badge}</span>
          <button onClick={() => speak(`${heading} ${question}`)}>
            <Icon src={icons.sound} />
            Read to me
          </button>
        </div>
        <figure className="scan-preview">
          <img
            src={session.photoUrl ?? `${A}/96e44.png`}
            alt={live ? "Your photo" : "Scanned café ordering kiosk"}
          />
          <b>{session.status === "loading" ? "Checking..." : "✓ Scanned"}</b>
        </figure>
        <section className="recognition-card" aria-live="polite">
          <div>
            <h1>{heading}</h1>
            <button
              className="icon-audio"
              onClick={() => speak(`${heading} ${question}`)}
              aria-label="Read recognition aloud"
            >
              <Icon src={icons.sound} />
            </button>
          </div>
          <p>{question}</p>
          {!live && <span className="level-pill">●●○ With AI help</span>}
          {canStart && !asking && (
            <button className="flow-primary" onClick={confirm}>
              ✓ Yes, that's right
            </button>
          )}
          {(unsure || session.status === "error") && (
            <button
              className="flow-primary"
              onClick={() => {
                startAsk({ reason: "unsure", itemName: result?.item_name ?? "" })
                go("photo-confirmation")
              }}
            >
              Ask someone you trust
            </button>
          )}
          {!asking && (
            <button className="flow-secondary" onClick={() => go("scan")}>
              Try again / Retake
            </button>
          )}
        </section>
        {asking && (
          <section ref={askRef} className="text-alternative" aria-live="polite">
            <header>
              <label htmlFor="point-goal">What do you want to do with it?</label>
              <button
                className="icon-audio"
                onClick={() => speak("What do you want to do with it? Type or say it. Or tap an idea.")}
                aria-label="Read aloud"
                style={{ color: "var(--color-brand)" }}
              >
                <Icon src={icons.sound} />
              </button>
            </header>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <textarea
                id="point-goal"
                value={goalText}
                onChange={(event) => {
                  setGoalText(event.target.value)
                  setGoalError("")
                }}
                rows={2}
                maxLength={250}
                placeholder="For example: wash my bedsheets"
                style={{ minHeight: 80 }}
              />
              <button
                className={`voice-mic ${voice.listening ? "active" : ""}`}
                onClick={voice.toggle}
                aria-pressed={voice.listening}
                aria-label={voice.listening ? "Stop listening" : "Say it instead"}
                style={{ width: 64, height: 64, flex: "none" }}
              >
                <Flow8Asset group="input" file="1e757.svg" />
              </button>
            </div>
            <small>
              {voice.listening
                ? "Listening... tap the microphone to stop."
                : "Type it, or tap the microphone and say it."}
            </small>
            {voice.message && (
              <p className="guidance-message" role="status">
                {voice.message}
              </p>
            )}
            <div className="quick-prompts">
              <h2>Or tap an idea:</h2>
              <div>
                {goalIdeas.map((idea) => (
                  <button
                    key={idea}
                    onClick={() => {
                      setGoalText(idea)
                      setGoalError("")
                    }}
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
            {goalError && (
              <p className="guidance-message" role="alert">
                {goalError}
              </p>
            )}
            {goalError ? (
              <button
                className="flow-primary"
                onClick={() => {
                  startAsk({ reason: "unsure", itemName: result?.item_name ?? "" })
                  go("photo-confirmation")
                }}
              >
                Ask someone you trust
              </button>
            ) : (
              <button className="flow-primary" onClick={startSteps}>
                {goalText.trim() ? "Get my steps →" : "Just show me the basics →"}
              </button>
            )}
          </section>
        )}
        {knownText && (
          <section className="comparison-card" aria-live="polite">
            <p className="flow-label">You already know this</p>
            <div className="comparison-title">
              <h2>{knownName}</h2>
              <button
                className="icon-audio"
                onClick={() => speak(knownText)}
                aria-label="Read aloud"
              >
                <Icon src={icons.sound} />
              </button>
            </div>
            <article className="same-block">
              {knownSkill?.learnedOn && !sameAsBefore && (
                <p>You learned it on: {knownSkill.learnedOn}</p>
              )}
              <p>{typeLine}</p>
            </article>
          </section>
        )}
        {(same.length > 0 || different.length > 0) && (
          <section className="comparison-card">
            <p className="flow-label">Familiar match</p>
            <div className="comparison-title">
              <h2>Comparing to your saved setup</h2>
              <span>{live ? "My Skills" : "Campus Café"}</span>
            </div>
            {same.length > 0 && (
              <article className="same-block">
                <h3>
                  {live ? "✓ Same as what you know" : "✓ Same as familiar ordering"}
                </h3>
                {same.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </article>
            )}
            {different.length > 0 && (
              <article className="different-block">
                <h3>What is different</h3>
                {different.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </article>
            )}
            <button className="audio-pill" onClick={() => speak(comparison)}>
              <Icon src={icons.sound} />
              Read comparison aloud
            </button>
          </section>
        )}
      </main>
      <nav className="cafe-bottom with-note">
        <button
          className="flow-primary"
          onClick={asking ? startSteps : confirm}
          disabled={!canStart || Boolean(goalError)}
        >
          {asking
            ? goalText.trim()
              ? "Get my steps →"
              : "Just show me the basics →"
            : "Start Step-by-Step Guidance →"}
        </button>
        <small>Take your time. Ask for help anytime.</small>
      </nav>
    </div>
  )
}
function CafeSteps({ go }: { go: (page: Page) => void }) {
  const [paused, setPaused] = useState(false)
  const [hint, setHint] = useState(false)
  const [photoRatio, setPhotoRatio] = useState(4 / 3)
  const session = usePointAskSession()
  const steps = session.result?.steps ?? []
  const live = steps.length > 0
  // Identify is back but the steps are still coming (or failed).
  const waiting = !live && session.status === "ready" && session.stepsStatus === "loading"
  const failed = !live && session.status === "ready" && session.stepsStatus === "error"
  const pending = waiting || failed
  const index = Math.min(session.stepIndex, Math.max(steps.length - 1, 0))
  const step = steps[index]
  const total = live ? steps.length : 3
  const current = live ? index + 1 : 1
  const dots = Array.from({ length: total }, (_, i) => (i < current ? "●" : "○")).join("")
  const instruction = waiting
    ? "Getting your steps ready..."
    : failed
      ? "I couldn't get the steps right now."
      : (step?.action ?? "Tap the Iced Drinks button on the screen.")
  const where = waiting
    ? "This takes a few seconds. Take your time."
    : failed
      ? "Try another photo, or ask someone you trust."
      : (step?.where ?? "Touch the cold drinks picture in the top row.")
  const hintText =
    step?.hint ?? step?.done_when ?? "Look at the first row. Find the cold drink cup."
  const askSarah = () => {
    startAsk({
      reason: "stuck",
      itemName: session.result?.item_name ?? "Café Self-Order Touchscreen Kiosk",
      stepNumber: current,
      stepText: instruction,
    })
    go("photo-confirmation")
  }
  const showStep = (next: number) => {
    setHint(false)
    setStepIndex(next)
  }
  const next = () => {
    if (live && index < steps.length - 1) {
      showStep(index + 1)
      return
    }
    go("cafecomplete")
  }
  return (
    <div className="flow-screen cafe-flow">
      <FlowTopBar
        title="Step Guidance"
        back={() => go("identify")}
        close={() => go("home")}
      />
      <main className="flow-main cafe-main">
        <div className="cafe-landmark">
          <span>● One step at a time</span>
        </div>
        <section className="cafe-step-counter">
          <span>
            <b>{pending ? "Step 1" : `Step ${current} of ${total}`}</b>
            <small>
              {pending ? "Getting ready" : (step?.step_title ?? "Choosing your item")}
            </small>
          </span>
          {!pending && <em>{dots}</em>}
          <p>Take your time. There is no time limit.</p>
        </section>
        <section className="ar-viewfinder">
          {live || pending ? (
            // Show the whole photo at its real shape so the highlight lines up.
            <div
              style={{
                position: "relative",
                height: "100%",
                maxWidth: "100%",
                aspectRatio: String(photoRatio),
                margin: "0 auto",
              }}
            >
              <img
                src={session.photoUrl ?? ""}
                alt="Your photo"
                onLoad={(event) =>
                  setPhotoRatio(
                    event.currentTarget.naturalWidth /
                      event.currentTarget.naturalHeight,
                  )
                }
                style={{ width: "100%", height: "100%", objectFit: "fill" }}
              />
              {step?.box && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: `${step.box.x * 100}%`,
                    top: `${step.box.y * 100}%`,
                    width: `${step.box.w * 100}%`,
                    height: `${step.box.h * 100}%`,
                    border: "4px solid var(--color-brand)",
                    borderRadius: "var(--radius-medium)",
                    boxShadow: "0 0 0 3px #ffffffcc, 0 0 20px #13332673",
                  }}
                />
              )}
            </div>
          ) : (
            <img
              src={`${A}/83e74.png`}
              alt="Close-up of café kiosk menu"
            />
          )}
          <span className="ar-status">
            {live || pending ? "● Your photo" : "● Example photo"}
          </span>
          {!live && !pending && (
            <div className="target-box">
              <b>Tap “Iced Drinks”</b>
              <span>Iced Drinks & Teas</span>
            </div>
          )}
          {live || pending ? (
            <small
              style={{ whiteSpace: "normal", width: "90%", textAlign: "center" }}
            >
              {pending ? "Your photo" : step?.box ? "Look inside the blue box" : step?.where}
            </small>
          ) : (
            <small>Look inside the blue box</small>
          )}
        </section>
        <section className="cafe-instruction">
          <h1>{instruction}</h1>
          <p>{where}</p>
          {step?.done_when && <p>✓ You'll know it worked: {step.done_when}</p>}
          {step?.caution && <p>{step.caution}</p>}
          <button
            className="audio-pill"
            onClick={() => speak(`${instruction} ${where}`)}
          >
            <Icon src={icons.sound} />
            Read this step aloud
          </button>
        </section>
        <div className="assist-row">
          <button onClick={() => setHint(!hint)}>Show hint</button>
          <button onClick={askSarah}>Not sure</button>
        </div>
        {hint && (
          <p className="hint-card" role="status">
            {hintText}
          </p>
        )}
        <section className="cafe-coach">
          <span className="coach-initial">S</span>
          <span>
            <b>Sarah</b>
            <small>Family friend in My People</small>
          </span>
          <button onClick={askSarah}>Ask Sarah</button>
        </section>
      </main>
      {paused && (
        <div className="pause-notice" role="status">
          <b>Guidance paused.</b>
          <span>Continue when ready.</span>
        </div>
      )}
      <nav className="cafe-step-actions">
        <button disabled={!live || index === 0} onClick={() => showStep(index - 1)}>
          ← Back
        </button>
        <button onClick={() => setPaused(!paused)}>
          {paused ? "Continue" : "Pause"}
        </button>
        <button onClick={next} disabled={pending}>
          Next →
        </button>
        <button onClick={() => go("scan")}>Ask something else</button>
      </nav>
    </div>
  )
}
function CafeComplete({ go }: { go: (page: Page) => void }) {
  const session = usePointAskSession()
  const result = session.result
  const skill = result ? getSkill(result.skill_id) : undefined
  const [savedId, setSavedId] = useState<string | null>(null)
  const save = () => {
    if (!result || !skill) return
    setSavedId(
      addEntry({
        skillId: skill.id,
        level: "with_prompt",
        place: result.item_name,
        via: "point_ask",
        source: "self",
      }),
    )
  }
  const undo = () => {
    if (savedId) removeEntry(savedId)
    setSavedId(null)
  }
  const profile = result
    ? [...result.different, ...result.same_as_before].slice(0, 3)
    : [
        "Touchscreen kiosk. Categories are along the top.",
        "The card reader is at the bottom center.",
      ]
  return (
    <div className="flow-screen cafe-flow">
      <FlowTopBar
        title="Step By Step Complete"
        back={() => go("cafesteps")}
        close={() => go("home")}
      />
      <main className="flow-main cafe-main">
        <div className="cafe-landmark">
          <span>Task complete</span>
          <button onClick={() => speak(pageCopy.cafecomplete)}>
            <Icon src={icons.sound} />
            Read aloud
          </button>
        </div>
        <section className="cafe-done">
          <span className="done-badge">
            ✓<b>Done</b>
          </span>
          <h1>You did it, Maya!</h1>
          <p>
            {result
              ? `You finished every step with the ${result.item_name}.`
              : "Café order completed at Uptown Coffee."}
          </p>
        </section>
        {result && (
          <section className="cafe-passport-update" aria-live="polite">
            <div>
              <h2>{savedId ? "My Skills Updated" : "Add to My Skills"}</h2>
              <span>{savedId ? "Saved" : "Check first"}</span>
            </div>
            {skill ? (
              <>
                <article>
                  <Icon src={`${A}/71212.svg`} />
                  <span>
                    <b>{skill.name}</b>
                    <p>{helpLabel({ level: "with_prompt", via: "point_ask" })}</p>
                  </span>
                </article>
                <p>
                  <b>
                    {session.known.some((k) => k.skillId === skill.id)
                      ? "New place for a skill you know:"
                      : "New place:"}
                  </b>{" "}
                  {result.item_name}
                </p>
                {savedId ? (
                  <p>
                    Saved on this phone.{" "}
                    <button className="audio-pill" onClick={undo}>
                      Undo
                    </button>
                  </p>
                ) : (
                  <p>Does this look right? Save it when you are ready.</p>
                )}
              </>
            ) : (
              <p>
                I couldn't match this to a skill. You can tell me what you did
                instead.
              </p>
            )}
          </section>
        )}
        {!result && (
          <section className="cafe-passport-update">
          <div>
            <h2>My Skills Updated</h2>
            <span>Step 2 of 3</span>
          </div>
          <article>
            <Icon src={`${A}/71212.svg`} />
            <span>
              <b>●●○ Level 2: With AI help</b>
              <p>Great consistency. You ordered independently!</p>
            </span>
          </article>
          <p>
            <b>New location earned:</b> Uptown Coffee.
          </p>
          <p>One more routine earns the On-My-Own stamp.</p>
        </section>
        )}
        <section className="kiosk-profile">
          <h2>{result ? "Good to remember" : "Kiosk Profile Stored (Text Only)"}</h2>
          <div>
            <small>{result ? "About this one" : "Saved details"}</small>
            {profile.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p>✓ Your photo was not saved.</p>
        </section>
      </main>
      <nav className="cafe-bottom dual">
        {result && skill && !savedId ? (
          <button className="flow-primary" onClick={save}>
            ✓ Save to My Skills
          </button>
        ) : result && !skill ? (
          <button className="flow-primary" onClick={() => go("voice-log")}>
            Tell me what you did →
          </button>
        ) : (
          <button className="flow-primary" onClick={() => go("passport")}>
            View My Skills →
          </button>
        )}
        <button className="flow-secondary" onClick={() => go("home")}>
          Return to Home
        </button>
      </nav>
    </div>
  )
}
const summarySections = [
  {
    title: "What you did",
    items: [
      "You washed laundry at your new apartment.",
      "You ordered iced tea on the café screen.",
      "You made stovetop pasta and checked safety.",
    ],
  },
  {
    title: "Getting stronger",
    items: [
      "You did 3 routines with AI help.",
      "You used the Point & Ask camera smoothly.",
    ],
  },
  {
    title: "Ideas for next month",
    items: [
      "Practice morning light rail to Central Station.",
      "Try the grocery self-checkout routine.",
    ],
  },
]
function SummaryLandmark({
  label,
  action = "Listen",
  copy,
}: {
  label: string
  action?: string
  copy: string
}) {
  return (
    <div className="summary-landmark">
      <span>
        <i aria-hidden="true" />
        {label}
      </span>
      <button onClick={() => speak(copy)}>
        <Icon src={icons.sound} />
        {action}
      </button>
    </div>
  )
}
function MonthlySummary({ go }: { go: (page: Page) => void }) {
  return (
    <div className="flow-screen summary-flow">
      <FlowTopBar
        title="Monthly Summary"
        back={() => go("passport")}
        close={() => go("home")}
      />
      <main className="summary-main">
        <SummaryLandmark
          label="November 2024 summary"
          copy={pageCopy.summary}
        />
        <header className="summary-intro">
          <h1>My November Progress</h1>
          <p>Created from your confirmed logs.</p>
          <p>You own and control this summary.</p>
        </header>
        <nav className="month-picker" aria-label="Choose summary month">
          <button aria-label="View October summary">October</button>
          <button className="active" aria-current="date">
            November 2024 · 14 Stamps
          </button>
          <button aria-label="View December summary">December</button>
        </nav>
        <section className="summary-highlights" aria-labelledby="highlights">
          <h2 id="highlights">Highlights</h2>
          <figure>
            <img
              src={`${A}/flow4-summary-kitchen.png`}
              alt="Maya's organized kitchen counter with plants and appliances"
            />
            <figcaption>Maya’s Independent Routines</figcaption>
          </figure>
          <div className="summary-stats">
            <article>
              <small>Routines finished</small>
              <strong>18 routines</strong>
              <span>4 more this month</span>
            </article>
            <article>
              <small>My Skills stamps</small>
              <strong>14 stamps earned</strong>
              <span>New record</span>
            </article>
            <article>
              <small>New locations explored</small>
              <strong>My Apartment and Uptown Coffee</strong>
            </article>
          </div>
        </section>
        <div className="summary-section-list">
          {summarySections.map((section, index) => (
            <section className="summary-section-card" key={section.title}>
              <header>
                <span className="summary-section-mark" aria-hidden="true">
                  {index + 1}
                </span>
                <h2>{section.title}</h2>
                <button onClick={() => go("summary-editor")}>
                  Edit section
                </button>
              </header>
              {index === 1 && (
                <div className="skill-progress">
                  <span>
                    <small>Skill level progress</small>
                    <b>Level 2</b>
                  </span>
                  <span className="level-dots" aria-label="Level 2 of 3">
                    <i />
                    <i />
                    <i />
                    With AI help
                  </span>
                </div>
              )}
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <aside className="summary-private-note">
          <span aria-hidden="true">✓</span>
          <p>
            <b>Safe and Private Storage</b>
            Drafted in memory from your local logs. Nothing is shared until you
            choose.
          </p>
        </aside>
        <div className="summary-page-actions">
          <button
            className="summary-primary"
            onClick={() => go("summary-sharing")}
          >
            Review and Share Summary
          </button>
          <button
            className="summary-secondary"
            onClick={() => go("summary-editor")}
          >
            Edit Individual Lines
          </button>
        </div>
      </main>
    </div>
  )
}
const lineTwoDraft =
  "You ordered iced tea on the café touchscreen kiosk at Uptown Coffee by yourself!"
const lineThreeDraft = "You made stovetop pasta and checked safety."
function SummaryEditor({ go }: { go: (page: Page) => void }) {
  const [lineOne, setLineOne] = useState(
    "You washed laundry at your new apartment.",
  )
  const [editingOne, setEditingOne] = useState(false)
  const [lineTwo, setLineTwo] = useState(lineTwoDraft)
  const [lineTwoSaved, setLineTwoSaved] = useState(false)
  const [lineThree, setLineThree] = useState(
    "You cooked pasta safely and timed boiling water.",
  )
  const [editingThree, setEditingThree] = useState(false)
  const wordCount = lineTwo.trim().split(/\s+/).filter(Boolean).length
  const fullSummary = `${lineOne} ${lineTwo} ${lineThree}`
  return (
    <div className="flow-screen summary-flow">
      <FlowTopBar
        title="Per Line Editor"
        back={() => go("summary")}
        close={() => go("home")}
      />
      <main className="summary-main">
        <SummaryLandmark
          label="Edit your summary"
          action="Read Aloud"
          copy={pageCopy["summary-editor"]}
        />
        <header className="summary-intro">
          <h1>Edit What You Did</h1>
          <p>Change any sentence to sound the way you want.</p>
          <p>Unedited lines stay connected to your draft.</p>
        </header>
        <div className="editor-section-title">
          <h2>Section 1: What you did</h2>
          <span>3 lines</span>
        </div>
        <section className="line-card">
          <header>
            <span className="line-tag">AI draft</span>
            <small>Line 1</small>
          </header>
          {editingOne ? (
            <textarea
              aria-label="Change line 1"
              value={lineOne}
              onChange={(event) => setLineOne(event.target.value)}
            />
          ) : (
            <p>{lineOne}</p>
          )}
          <div className="line-actions">
            <button onClick={() => setEditingOne(!editingOne)}>
              {editingOne ? "Save line" : "Edit line"}
            </button>
            <button onClick={() => speak(lineOne)}>
              <Icon src={icons.sound} /> Listen
            </button>
          </div>
        </section>
        <section className="line-card active-line">
          <header>
            <span className="line-tag active">Currently editing</span>
            <small>Line 2</small>
          </header>
          <label htmlFor="line-two">Rewrite this line:</label>
          <textarea
            id="line-two"
            value={lineTwo}
            onChange={(event) => {
              setLineTwo(event.target.value)
              setLineTwoSaved(false)
            }}
          />
          <p className="word-helper" aria-live="polite">
            Sentence has {wordCount} words. Simple language is easy for family
            to read.
          </p>
          {lineTwoSaved && (
            <p className="saved-message" role="status">
              Your line was saved on this phone.
            </p>
          )}
          <button
            className="summary-primary"
            onClick={() => setLineTwoSaved(true)}
          >
            Save line
          </button>
          <button
            className="summary-secondary"
            onClick={() => {
              setLineTwo(lineTwoDraft)
              setLineTwoSaved(false)
            }}
          >
            Reset to AI draft
          </button>
        </section>
        <section className="line-card">
          <header>
            <span className="line-tag edited">Edited by you</span>
            <small>Line 3</small>
          </header>
          {editingThree ? (
            <textarea
              aria-label="Change line 3"
              value={lineThree}
              onChange={(event) => setLineThree(event.target.value)}
            />
          ) : (
            <p>{lineThree}</p>
          )}
          <p className="saved-message">Your custom wording saved</p>
          <div className="line-actions">
            <button onClick={() => setEditingThree(!editingThree)}>
              {editingThree ? "Save change" : "Change"}
            </button>
            <button
              onClick={() => {
                setLineThree(lineThreeDraft)
                setEditingThree(false)
              }}
            >
              Revert
            </button>
            <button
              className="icon-only"
              aria-label="Listen to line 3"
              onClick={() => speak(lineThree)}
            >
              <Icon src={icons.sound} />
            </button>
          </div>
        </section>
        <aside className="summary-private-note">
          <span aria-hidden="true">✓</span>
          <p>
            <b>Always in your control</b>
            Your changes are saved automatically on your phone.
          </p>
        </aside>
        <div className="summary-page-actions">
          <button className="summary-primary" onClick={() => go("summary")}>
            Done Editing Lines
          </button>
          <button
            className="summary-secondary"
            onClick={() => speak(fullSummary)}
          >
            Listen to Full Summary
          </button>
        </div>
      </main>
    </div>
  )
}
type Recipient = "mom" | "coach" | "custom"
function PrivateSharing({ go }: { go: (page: Page) => void }) {
  const [recipient, setRecipient] = useState<Recipient>("mom")
  const [customName, setCustomName] = useState("")
  const recipientName =
    recipient === "mom"
      ? "Mom"
      : recipient === "coach"
        ? "Sarah"
        : customName || "this person"
  return (
    <div className="flow-screen summary-flow">
      <FlowTopBar
        title="Private Sharing Control"
        back={() => go("summary")}
        close={() => go("home")}
      />
      <main className="summary-main">
        <SummaryLandmark
          label="Share privately"
          copy={pageCopy["summary-sharing"]}
        />
        <header className="summary-intro">
          <h1>Share My November Summary</h1>
          <p>Sharing is turned off by default.</p>
          <p>You choose who gets a private link.</p>
        </header>
        <aside className="sharing-off" role="status">
          <b>Sharing is currently off</b>
          <p>Nobody can see this page until you create a link below.</p>
        </aside>
        <section className="sharing-step">
          <h2>
            <span>1</span> Who do you want to share with?
          </h2>
          <p>Each person gets their own private link.</p>
          <div className="recipient-list" role="radiogroup">
            <button
              role="radio"
              aria-checked={recipient === "mom"}
              className={recipient === "mom" ? "selected" : ""}
              onClick={() => setRecipient("mom")}
            >
              <i aria-hidden="true" />
              <span>
                <b>Mom (Elena Lin)</b>
                <small>Family Supporter</small>
              </span>
              {recipient === "mom" && <em>Selected</em>}
            </button>
            <button
              role="radio"
              aria-checked={recipient === "coach"}
              className={recipient === "coach" ? "selected" : ""}
              onClick={() => setRecipient("coach")}
            >
              <i aria-hidden="true" />
              <span>
                <b>Sarah</b>
                <small>Family Friend · My People</small>
              </span>
            </button>
            <button
              role="radio"
              aria-checked={recipient === "custom"}
              className={recipient === "custom" ? "selected" : ""}
              onClick={() => setRecipient("custom")}
            >
              <i aria-hidden="true" />
              <span>
                <b>Add someone else</b>
                <small>Enter name and relationship</small>
              </span>
            </button>
          </div>
          {recipient === "custom" && (
            <label className="custom-recipient">
              Person’s name
              <input
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="Enter their name"
              />
            </label>
          )}
        </section>
        <section className="sharing-step">
          <h2>
            <span>2</span> What will they see?
          </h2>
          <div className="permissions-card">
            <article>
              <b>November 2024 Summary Snapshot</b>
              <p>Shows your 14 milestone stamps and routine counts.</p>
            </article>
            <article className="level-preview">
              <b>Skill level display:</b>
              <span className="level-dots">
                <i />
                <i />
                <i />
                By myself
              </span>
            </article>
            <article>
              <b>No personal photos or passwords</b>
              <p>Your private notes stay safely on your device.</p>
            </article>
            <article>
              <b>Read-only view</b>
              <p>Nobody can edit or change your skills.</p>
            </article>
          </div>
        </section>
        <section className="sharing-step">
          <h2>
            <span>3</span> Create and send your link
          </h2>
          <button
            className="summary-primary"
            disabled={recipient === "custom" && !customName.trim()}
            onClick={() => go("summary-shares")}
          >
            Create Private Link for {recipientName}
          </button>
        </section>
        <aside className="summary-private-note">
          <span aria-hidden="true">✓</span>
          <p>
            <b>You are always in full control.</b>
            You can stop sharing this link anytime. Maya makes every decision.
          </p>
        </aside>
      </main>
    </div>
  )
}
function ActiveShares({ go }: { go: (page: Page) => void }) {
  const [momActive, setMomActive] = useState(true)
  const [revoked, setRevoked] = useState<"Jordan" | "Elena Lin" | null>(
    "Jordan",
  )
  const undoRevocation = () => {
    if (revoked === "Elena Lin") setMomActive(true)
    setRevoked(null)
  }
  return (
    <div className="flow-screen summary-flow">
      <FlowTopBar
        title="Manage Shared Links"
        back={() => go("summary-sharing")}
        close={() => go("home")}
      />
      <main className="summary-main">
        <SummaryLandmark
          label="Your shared links"
          action="Read"
          copy={pageCopy["summary-shares"]}
        />
        <header className="summary-intro">
          <h1>Active Shared Links</h1>
          <p>See who can view your summaries.</p>
          <p>Turn off access anytime.</p>
        </header>
        {revoked && (
          <aside className="revocation-toast" role="status">
            <b>Stopped sharing with {revoked}. Link no longer works.</b>
            <p>Access stopped right away.</p>
            <button onClick={undoRevocation}>Undo (Available for 10s)</button>
          </aside>
        )}
        {momActive ? (
          <article className="active-share-card">
            <header>
              <span className="recipient-avatar" aria-hidden="true">
                EL
              </span>
              <span>
                <h2>Elena Lin (Mom)</h2>
                <p>Family Supporter</p>
              </span>
              <strong>Link Active</strong>
            </header>
            <section>
              <b>November 2024 Summary Snapshot</b>
              <p>Today at 2:15 PM · Read-only snapshot</p>
              <p>Viewed 1 time · Sent 1 Cheer: “Proud of you”</p>
            </section>
            <button
              className="summary-secondary"
              onClick={() =>
                speak(
                  "Mom sees your November summary, 14 stamps, and routine counts.",
                )
              }
            >
              Preview what Mom sees
            </button>
            <button
              className="stop-sharing"
              onClick={() => {
                setMomActive(false)
                setRevoked("Elena Lin")
              }}
            >
              Stop Sharing Link
            </button>
          </article>
        ) : (
          <p className="no-active-share">Mom’s link is no longer active.</p>
        )}
        <section className="revocation-rules">
          <h2>What happens when you stop sharing</h2>
          <ul>
            <li>The web link stops working immediately.</li>
            <li>
              The viewer sees this message: This summary is no longer shared.
            </li>
            <li>Your skills and logs on this device are untouched.</li>
          </ul>
        </section>
        <button className="summary-primary" onClick={() => go("summary")}>
          Return to Monthly Summary
        </button>
      </main>
    </div>
  )
}
type Flow5AssetGroup = "hub" | "add" | "cheer" | "confirm"
function Flow5Asset({
  group,
  file,
  alt = "",
}: {
  group: Flow5AssetGroup
  file: string
  alt?: string
}) {
  return <img src={`${A}/flow5-${group}/${file}`} alt={alt} />
}
function Flow5TopBar({
  group,
  title,
  back,
  close,
}: {
  group: Flow5AssetGroup
  title: string
  back: () => void
  close: () => void
}) {
  const readCopy =
    group === "hub"
      ? pageCopy.supporters
      : group === "add"
        ? pageCopy["add-supporter"]
        : group === "cheer"
          ? pageCopy["cheer-detail"]
          : pageCopy.confirmer
  return (
    <header className="flow5-topbar">
      <button onClick={back} aria-label="Go back">
        <Flow5Asset group={group} file="54d97.svg" />
      </button>
      <strong>{title}</strong>
      <span>
        <button
          className="flow5-read-icon"
          onClick={() => speak(readCopy)}
          aria-label="Read this page aloud"
        >
          <Flow5Asset group={group} file="bfc78.svg" />
        </button>
        <button onClick={close} aria-label="Close this flow">
          <Flow5Asset group={group} file="28d0b.svg" />
        </button>
        <button className="flow5-profile" aria-label="Open profile">
          <Flow5Asset group={group} file="59e02.svg" />
        </button>
      </span>
    </header>
  )
}
function Flow5Landmark({
  group,
  icon,
  label,
  action,
  copy,
  darkAction = false,
}: {
  group: Flow5AssetGroup
  icon: string
  label: string
  action: string
  copy: string
  darkAction?: boolean
}) {
  return (
    <div className="flow5-landmark">
      <span>
        <Flow5Asset group={group} file={icon} />
        {label}
      </span>
      <button className={darkAction ? "dark" : ""} onClick={() => speak(copy)}>
        <Flow5Asset
          group={group}
          file={
            group === "hub"
              ? "1af84.svg"
              : group === "confirm"
                ? "f87cb.svg"
                : "dc99e.svg"
          }
        />
        {action}
      </button>
    </div>
  )
}
function Flow5ButtonIcon({
  group,
  file,
}: {
  group: Flow5AssetGroup
  file: string
}) {
  return (
    <span className="flow5-button-icon" aria-hidden="true">
      <Flow5Asset group={group} file={file} />
    </span>
  )
}
function SupportersHub({ go }: { go: (page: Page) => void }) {
  const [updateSent, setUpdateSent] = useState(false)
  return (
    <div className="flow-screen flow5-screen">
      <Flow5TopBar
        group="hub"
        title="Supporters & Cheers"
        back={() => go("people")}
        close={() => go("home")}
      />
      <main className="flow5-main">
        <Flow5Landmark
          group="hub"
          icon="21ec9.svg"
          label="Your trusted people"
          action="Read"
          copy={pageCopy.supporters}
        />
        <header className="flow5-intro">
          <h1>My Supporters & Cheers</h1>
          <p>Private links are for people you trust.</p>
          <p>No accounts, feeds, or public search.</p>
        </header>
        <section className="reward-card">
          <header>
            <span className="reward-symbol" aria-hidden="true">
              ☕
            </span>
            <span>
              <small>Reward goal</small>
              <h2>Coffee with Jordan</h2>
            </span>
            <b>1 stamp left!</b>
          </header>
          <div className="reward-count">
            <strong>14 of 15 Stamps Earned</strong>
            <span>93%</span>
          </div>
          <div
            className="reward-track"
            role="progressbar"
            aria-valuenow={14}
            aria-valuemin={0}
            aria-valuemax={15}
            aria-label="14 of 15 stamps earned"
          >
            <i />
          </div>
          <p>
            <Flow5Asset group="hub" file="cd4de.svg" />
            Reward unlocks at 15 stamps.
          </p>
        </section>
        <section className="supporter-roster">
          <header>
            <h2>My Active Supporters</h2>
            <span>2 Connected</span>
          </header>
          <article className="supporter-card">
            <header>
              <img
                className="supporter-photo"
                src={`${A}/flow5-hub/8c059.png`}
                alt="Elena Lin"
              />
              <span>
                <h3>Mom (Elena Lin)</h3>
                <p>Family Supporter</p>
                <small>Active link · 1 cheer sent</small>
              </span>
              <button
                className="flow5-menu"
                aria-label="Manage Mom's connection"
                onClick={() => speak("Mom's private link is active.")}
              >
                <Flow5Asset group="hub" file="fdfad.svg" />
              </button>
            </header>
            <button
              className="cheer-preview"
              onClick={() => go("cheer-detail")}
            >
              <span aria-hidden="true">Cheer</span>
              <span>
                <b>“Proud of you”</b>
                <small>On your Laundry routine today</small>
              </span>
            </button>
            <div className="supporter-actions">
              <button
                className="flow5-primary"
                onClick={() => go("cheer-detail")}
              >
                <Flow5ButtonIcon group="hub" file="68781.svg" />
                Ask for a Cheer
              </button>
              <button onClick={() => speak("Mom's supporter link is active.")}>
                Manage
              </button>
            </div>
          </article>
          <article className="supporter-card">
            <header>
              <img
                className="supporter-photo"
                src={`${A}/flow5-hub/ceb9d.png`}
                alt="Sarah"
              />
              <span>
                <h3>Sarah</h3>
                <p>Family Friend</p>
                <small>Active link · In My People</small>
              </span>
              <button
                className="flow5-menu"
                aria-label="Manage Sarah's connection"
                onClick={() => speak("Sarah's private link is active.")}
              >
                <Flow5Asset group="hub" file="fdfad.svg" />
              </button>
            </header>
            <p className="supporter-note">
              <Flow5Asset group="hub" file="180d9.svg" />
              Available for check-ins when you choose.
            </p>
            <div className="supporter-actions">
              <button
                className="flow5-primary"
                onClick={() => setUpdateSent(true)}
              >
                <Flow5ButtonIcon group="hub" file="97924.svg" />
                {updateSent ? "Update Sent" : "Send Quick Update"}
              </button>
              <button
                onClick={() => speak("Sarah's supporter link is active.")}
              >
                Manage
              </button>
            </div>
          </article>
        </section>
        <section className="confirmer-access">
          <span className="flow5-round-icon">
            <Flow5Asset group="hub" file="c6047.svg" />
          </span>
          <span>
            <h2>Have a support person with you?</h2>
            <p>
              They can tap in person and confirm a routine you did together.
            </p>
          </span>
          <button onClick={() => go("confirmer")}>Confirm Together</button>
        </section>
        <aside className="flow5-privacy">
          <span className="flow5-round-icon">
            <Flow5Asset group="hub" file="b5d75.svg" />
          </span>
          <p>
            <b>Our Privacy Promise</b>
            Your circle is private. Supporters see only what you share. Remove
            anyone with one tap.
          </p>
        </aside>
        <div className="flow5-actions">
          <button className="flow5-primary" onClick={() => go("add-supporter")}>
            <Flow5ButtonIcon group="hub" file="5ed27.svg" />
            Add New Supporter
          </button>
          <button onClick={() => go("passport")}>
            <Flow5ButtonIcon group="hub" file="9867c.svg" />
            Return to My Skills
          </button>
        </div>
      </main>
    </div>
  )
}
const relationshipOptions = [
  ["Family / Parent", "d27a5.svg"],
  ["Family Member", "006e9.svg"],
  ["Friend / Peer", "e8a6d.svg"],
  ["Trusted Friend", "a8d91.svg"],
] as const
function AddSupporter({ go }: { go: (page: Page) => void }) {
  const [name, setName] = useState("Jordan Davis")
  const [relationship, setRelationship] = useState("Friend / Peer")
  const [permissions, setPermissions] = useState([true, true])
  const [linkCreated, setLinkCreated] = useState(false)
  const firstName = name.trim().split(/\s+/)[0] || "this person"
  return (
    <div className="flow-screen flow5-screen">
      <Flow5TopBar
        group="add"
        title="Add Supporter"
        back={() => go("supporters")}
        close={() => go("home")}
      />
      <main className="flow5-main">
        <Flow5Landmark
          group="add"
          icon="fc627.svg"
          label="Create a supporter link"
          action="Listen"
          copy={pageCopy["add-supporter"]}
        />
        <header className="flow5-intro icon-intro">
          <span className="flow5-round-icon">
            <Flow5Asset group="add" file="f4bd9.svg" />
          </span>
          <span>
            <h1>Add a Trusted Person</h1>
            <p>Create a private cheer link.</p>
            <p>No password or account needed.</p>
          </span>
        </header>
        <section className="flow5-form-card">
          <header>
            <span className="flow5-step">1</span>
            <h2>What is their name?</h2>
            <small>Plain spelling</small>
          </header>
          <div className="supporter-name-field">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Supporter name"
            />
            <button onClick={() => setName("")} aria-label="Clear name">
              <Flow5Asset group="add" file="c4d24.svg" />
            </button>
          </div>
          <p>We will use this name across their cheers.</p>
        </section>
        <section className="flow5-form-card">
          <header>
            <span className="flow5-step">2</span>
            <h2>Who are they to you?</h2>
            <small>1 choice</small>
          </header>
          <div className="relationship-list" role="radiogroup">
            {relationshipOptions.map(([label, icon]) => (
              <button
                key={label}
                role="radio"
                aria-checked={relationship === label}
                className={relationship === label ? "selected" : ""}
                onClick={() => setRelationship(label)}
              >
                <Flow5Asset group="add" file={icon} />
                <span>
                  <b>{label}</b>
                  {label === "Family Member" && (
                    <small>Recommended for support routines</small>
                  )}
                </span>
                <span className="choice-mark">
                  <Flow5Asset
                    group="add"
                    file={relationship === label ? "e0f80.svg" : "75366.svg"}
                  />
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="flow5-form-card">
          <header>
            <span className="flow5-step">3</span>
            <h2>What can {firstName} see?</h2>
          </header>
          <div className="permission-list">
            {[
              [
                "Invited tasks and earned stamps",
                "Only routines you decide to share.",
              ],
              [
                "Send cheerful emojis and kudos",
                "They can applaud when you finish steps.",
              ],
            ].map(([title, copy], index) => (
              <button
                key={title}
                role="checkbox"
                aria-checked={permissions[index]}
                onClick={() =>
                  setPermissions((current) =>
                    current.map((value, item) =>
                      item === index ? !value : value,
                    ),
                  )
                }
              >
                <span className={permissions[index] ? "checked" : ""}>
                  {permissions[index] && (
                    <Flow5Asset group="add" file="3400b.svg" />
                  )}
                </span>
                <span>
                  <b>{title}</b>
                  <small>{copy}</small>
                </span>
              </button>
            ))}
          </div>
          <aside className="boundary-note">
            <span className="flow5-round-icon">
              <Flow5Asset group="add" file="503af.svg" />
            </span>
            <p>
              <b>Strict boundary:</b> {firstName} cannot edit tasks, delete
              stamps, or see private camera notes.
            </p>
          </aside>
        </section>
        <aside className="private-link-note">
          <span className="flow5-round-icon">
            <Flow5Asset group="add" file="6509e.svg" />
          </span>
          <p>
            <b>Completely Private Link</b>
            {firstName} gets a unique web link. It is separate from Mom’s link.
          </p>
        </aside>
        {linkCreated && (
          <p className="link-created-message" role="status">
            Private link created for {firstName}. Only {firstName} can use this
            link.
          </p>
        )}
        <div className="flow5-actions">
          <button
            className="flow5-primary"
            disabled={!name.trim()}
            onClick={() =>
              linkCreated ? go("supporters") : setLinkCreated(true)
            }
          >
            <Flow5ButtonIcon group="add" file="886d6.svg" />
            {linkCreated
              ? "Return to Supporters"
              : `Create Private Link for ${firstName}`}
          </button>
          <button onClick={() => go("supporters")}>Cancel & Return</button>
        </div>
      </main>
    </div>
  )
}
function CheerDetail({ go }: { go: (page: Page) => void }) {
  const [visible, setVisible] = useState(true)
  return (
    <div className="flow-screen flow5-screen">
      <Flow5TopBar
        group="cheer"
        title="Cheer Detail"
        back={() => go("supporters")}
        close={() => go("home")}
      />
      <main className="flow5-main">
        <Flow5Landmark
          group="cheer"
          icon="ee4c1.svg"
          label="Cheer received"
          action="Read Aloud"
          copy={pageCopy["cheer-detail"]}
        />
        <header className="flow5-intro">
          <h1>Cheer from Jordan</h1>
          <p>Cheers arrive only after finishing a task.</p>
          <p>Words stay calm and positive.</p>
        </header>
        <section className="received-cheer">
          <header>
            <span className="flow5-round-icon">
              <Flow5Asset group="cheer" file="90274.svg" />
            </span>
            <span>
              <h2>
                Jordan <small>Trusted Friend</small>
              </h2>
              <p>Received today at 3:15 PM</p>
            </span>
          </header>
          <div className="associated-stamp">
            <b>Associated Stamp</b>
            <strong>Washing Machine Laundry · My Apartment</strong>
          </div>
          <div className="cheer-banner">Proud of you!</div>
          <p className="preset-note">
            <Flow5Asset group="cheer" file="466be.svg" />
            Preset cheer. No open chat or replies needed.
          </p>
        </section>
        <section className="passport-control">
          <header>
            <h2>You control My Skills</h2>
            <span>{visible ? "Visible on Stamp" : "Hidden from Stamp"}</span>
          </header>
          <p>You decide what stays on your record.</p>
          <p>You can change this anytime.</p>
          <button onClick={() => setVisible(!visible)}>
            <Flow5ButtonIcon group="cheer" file="b8eab.svg" />
            {visible
              ? "Hide this cheer from My Skills"
              : "Show this cheer in My Skills"}
          </button>
        </section>
        <section className="preset-explainer">
          <header>
            <Flow5Asset group="cheer" file="7d718.svg" />
            <h2>Why cheers are preset</h2>
          </header>
          <p>Supporters cannot send timers or free typing before you finish.</p>
          <p>Cheers only come after.</p>
          <div className="allowed-cheers" aria-label="Allowed preset cheers">
            {["Thumbs up", "Nice work", "You did it", "Proud of you"].map(
              (cheer) => (
                <span key={cheer}>{cheer}</span>
              ),
            )}
          </div>
          <aside>
            <Flow5Asset group="cheer" file="5f2fc.svg" />
            <b>Safety rule: Every supporter uses these four gentle words.</b>
          </aside>
        </section>
        <section className="invite-shortcut">
          <h2>Want Mom or Sarah to cheer?</h2>
          <p>Give trusted helpers permission to view your next stamp.</p>
          <button onClick={() => go("add-supporter")}>
            Invite Supporter to View Stamp
            <Flow5Asset group="cheer" file="dc6c5.svg" />
          </button>
        </section>
        <div className="flow5-actions">
          <button className="flow5-primary" onClick={() => go("supporters")}>
            <Flow5ButtonIcon group="cheer" file="1af07.svg" />
            Done · Keep in My Skills
          </button>
          <button onClick={() => go("supporters")}>Return to My People</button>
        </div>
      </main>
    </div>
  )
}
const confirmers = [
  ["Sarah", "Family Friend"],
  ["Jordan", "Trusted Friend"],
  ["Another trusted person", "Tap to enter name"],
] as const
function ConfirmerTap({ go }: { go: (page: Page) => void }) {
  const [confirmer, setConfirmer] = useState("Sarah")
  const [otherName, setOtherName] = useState("")
  const [physicallyConfirmed, setPhysicallyConfirmed] = useState(false)
  const confirmerName =
    confirmer === "Another trusted person"
      ? otherName || "Trusted person"
      : confirmer
  return (
    <div className="flow-screen flow5-screen">
      <Flow5TopBar
        group="confirm"
        title="Send A Cheer Request"
        back={() => go("supporters")}
        close={() => go("home")}
      />
      <main className="flow5-main">
        <Flow5Landmark
          group="confirm"
          icon="dc66e.svg"
          label="Confirm in person"
          action="Listen"
          copy={pageCopy.confirmer}
          darkAction
        />
        <header className="flow5-intro">
          <h1>In-Person Support Confirmation</h1>
          <p>Hand the phone to your trusted person.</p>
          <p>They tap to verify you did this together.</p>
        </header>
        <section className="handover-card">
          <span className="flow5-round-icon">
            <Flow5Asset group="confirm" file="83a82.svg" />
          </span>
          <p>
            <b>Please hand the phone to your trusted person.</b>
            Confirmation records that they were physically present with Maya.
          </p>
        </section>
        <section className="routine-confirm-card">
          <header>
            <span>Routine to Confirm</span>
            <span>Today, 2:40 PM</span>
          </header>
          <div className="confirm-routine">
            <span className="flow5-square-icon">
              <Flow5Asset group="confirm" file="c74c9.svg" />
            </span>
            <span>
              <b>Washing Machine Laundry</b>
              <small>
                <Flow5Asset group="confirm" file="577fa.svg" />
                My Apartment
              </small>
            </span>
          </div>
          <div className="confirm-level">
            <span>Completed Level</span>
            <span className="level-dots">
              <i />
              <i />
              <i />
              With AI help
            </span>
          </div>
        </section>
        <section className="confirmer-choice">
          <h2>Who is confirming this attempt?</h2>
          <div role="radiogroup">
            {confirmers.map(([name, role], index) => (
              <button
                key={name}
                role="radio"
                aria-checked={confirmer === name}
                className={confirmer === name ? "selected" : ""}
                onClick={() => {
                  setConfirmer(name)
                  setPhysicallyConfirmed(false)
                }}
              >
                <span className="confirm-radio">
                  {confirmer === name && (
                    <Flow5Asset group="confirm" file="e0f80.svg" />
                  )}
                </span>
                <span>
                  <b>{name}</b>
                  <small>{role}</small>
                </span>
                <span className="flow5-round-icon">
                  <Flow5Asset
                    group="confirm"
                    file={
                      index === 0
                        ? "39703.svg"
                        : index === 1
                          ? "4ae23.svg"
                          : "a7144.svg"
                    }
                  />
                </span>
              </button>
            ))}
          </div>
          {confirmer === "Another trusted person" && (
            <input
              value={otherName}
              onChange={(event) => {
                setOtherName(event.target.value)
                setPhysicallyConfirmed(false)
              }}
              placeholder="Enter their name"
              aria-label="Trusted person's name"
            />
          )}
        </section>
        <section className="physical-tap">
          <h2>
            <Flow5Asset group="confirm" file="30f7f.svg" />
            Step 1: Physical Confirmation
          </h2>
          <button
            className="flow5-primary"
            disabled={
              confirmer === "Another trusted person" && !otherName.trim()
            }
            onClick={() => setPhysicallyConfirmed(true)}
          >
            <Flow5ButtonIcon group="confirm" file="00c68.svg" />
            {physicallyConfirmed
              ? `Confirmed by ${confirmerName}`
              : `Tap to Confirm as ${confirmerName}`}
          </button>
          <p>
            <Flow5Asset group="confirm" file="551b2.svg" />
            Confirmed status is set only by an in-person physical tap.
          </p>
        </section>
        <aside className="return-phone">
          <span className="flow5-round-icon">
            <Flow5Asset group="confirm" file="a7748.svg" />
          </span>
          <p>
            <b>Step 2: Return phone to Maya</b>
            Both self-reported and confirmed logs count toward Maya’s progress.
          </p>
        </aside>
        <div className="flow5-actions">
          <button
            className="flow5-primary"
            disabled={!physicallyConfirmed}
            onClick={() => go("supporters")}
          >
            Confirm & Return Phone to Maya
            <Flow5ButtonIcon group="confirm" file="d3302.svg" />
          </button>
          <button onClick={() => go("supporters")}>
            Cancel · Keep as Self-Reported
          </button>
        </div>
      </main>
    </div>
  )
}
type Flow6AssetGroup = "credential" | "export" | "backup" | "storage"
function Flow6Asset({
  group,
  file,
  alt = "",
}: {
  group: Flow6AssetGroup
  file: string
  alt?: string
}) {
  return <img src={`${A}/flow6-${group}/${file}`} alt={alt} />
}
function Flow6TopBar({
  group,
  title,
  back,
  close,
}: {
  group: Flow6AssetGroup
  title: string
  back: () => void
  close: () => void
}) {
  const copy =
    group === "credential"
      ? pageCopy.credential
      : group === "export"
        ? pageCopy["credential-export"]
        : group === "backup"
          ? pageCopy["data-backup"]
          : pageCopy["storage-control"]
  return (
    <header className="flow6-topbar">
      <button onClick={back} aria-label="Go back">
        <Flow6Asset group={group} file="b37d7.svg" />
        <span>Back</span>
      </button>
      <strong>{title}</strong>
      <span>
        <button onClick={() => speak(copy)} aria-label="Read this page aloud">
          <Flow6Asset group={group} file="8b506.svg" />
        </button>
        <button onClick={close} aria-label="Close this flow">
          <Flow6Asset group={group} file="30ef3.svg" />
        </button>
        <button className="flow6-profile" aria-label="Open profile">
          <Flow6Asset group={group} file="59e02.svg" />
        </button>
      </span>
    </header>
  )
}
function Flow6Landmark({
  group,
  icon,
  label,
  copy,
}: {
  group: Flow6AssetGroup
  icon?: string
  label: string
  copy: string
}) {
  const sound =
    group === "export"
      ? "1af84.svg"
      : group === "backup"
        ? "bfc78.svg"
        : "8b506.svg"
  return (
    <div className="flow6-landmark">
      <span>
        {icon && <Flow6Asset group={group} file={icon} />}
        {label}
      </span>
      <button onClick={() => speak(copy)} aria-label="Listen to this page">
        <Flow6Asset group={group} file={sound} />
        Listen
      </button>
    </div>
  )
}
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
function makeCredentialPdf(
  includeStamps = true,
  includeSignature = true,
  includePrivateNotes = false,
) {
  const lines = [
    "Companion - My Skills record",
    "Maya Lin - Member ID CP-2024-884",
    "Issued by Companion - November 2024",
    "14 skill stamps - 4 life areas - all current skills learned",
    ...(includeStamps
      ? [
          "Household: Washing Machine Laundry - Level 3",
          "Nutrition: Stovetop Warm Meal and Pasta - Level 3",
          "Mobility: Light Rail Public Transit - Level 3",
          "Commerce: Grocery Store and Touchscreen Kiosk - Level 3",
        ]
      : []),
    ...(includeSignature ? ["Confirmed by Sarah Martinez, Family Friend"] : []),
    ...(includePrivateNotes
      ? ["Private note: Maya prefers clear visual instructions."]
      : []),
  ]
  const escapePdf = (value: string) =>
    value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)")
  const content = [
    "BT",
    "/F1 16 Tf",
    "72 730 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "" : "0 -34 Td",
      `(${escapePdf(line)}) Tj`,
    ]),
    "ET",
  ]
    .filter(Boolean)
    .join("\n")
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]
  let pdf = "%PDF-1.4\n"
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([pdf], { type: "application/pdf" })
}
const passportBackup = {
  app: "Companion",
  version: 1,
  member: { name: "Maya Lin", id: "CP-2024-884" },
  logs: 18,
  stamps: 14,
  applianceProfiles: ["Uptown Coffee Kiosk", "Home Washer"],
  exportedAt: "November 2024",
}
const bytesToBase64 = (bytes: Uint8Array) => {
  let value = ""
  bytes.forEach((byte) => {
    value += String.fromCharCode(byte)
  })
  return btoa(value)
}
const base64ToBytes = (value: string) =>
  Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
async function createBackupEnvelope() {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(passportBackup)),
  )
  const rawKey = await crypto.subtle.exportKey("raw", key)
  return {
    app: "Companion",
    version: 1,
    format: "AES-GCM",
    key: bytesToBase64(new Uint8Array(rawKey)),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  }
}
async function readBackupEnvelope(raw: Record<string, unknown>) {
  if (raw.format !== "AES-GCM") return raw
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(String(raw.key)),
    "AES-GCM",
    false,
    ["decrypt"],
  )
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(String(raw.iv)) },
    key,
    base64ToBytes(String(raw.data)),
  )
  return JSON.parse(new TextDecoder().decode(decrypted))
}
async function downloadPassportBackup() {
  const backup = await createBackupEnvelope()
  downloadBlob(
    new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    }),
    "companion-passport-backup.json",
  )
}
const credentialSkills = [
  {
    domain: "Household",
    title: "Washing Machine Laundry",
    copy: "Validated across 3 separate home laundry setups.",
    icon: "9476d.svg",
  },
  {
    domain: "Nutrition",
    title: "Stovetop Warm Meal & Pasta",
    copy: "Safely completed burner controls and drainage.",
    icon: "6761f.svg",
  },
  {
    domain: "Mobility",
    title: "Light Rail Public Transit",
    copy: "Boarding, card tap, and destination transfer.",
    icon: "10d95.svg",
  },
  {
    domain: "Commerce",
    title: "Grocery Store & Touchscreen Kiosk",
    copy: "Self-scan checkout, bagging, and receipt checks.",
    icon: "9e7fd.svg",
  },
]
function CredentialPreview({ go }: { go: (page: Page) => void }) {
  const [shareStatus, setShareStatus] = useState("")
  const shareCredential = async () => {
    const shareData = {
      title: "My Skills record for Maya Lin",
      text: "View Maya Lin’s Companion skill record.",
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setShareStatus("Skill record sharing opened.")
        return
      } catch {
        setShareStatus(
          "Sharing was canceled. Your skill record stayed private.",
        )
        return
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
      setShareStatus("Skill record link copied.")
    } else {
      setShareStatus("Sharing is not available on this device.")
    }
  }
  return (
    <div className="flow-screen flow6-screen">
      <Flow6TopBar
        group="credential"
        title="Official Skill Record"
        back={() => go("passport")}
        close={() => go("home")}
      />
      <main className="flow6-main">
        <Flow6Landmark
          group="credential"
          icon="43bc6.svg"
          label="My Skills record"
          copy={pageCopy.credential}
        />
        <header className="flow6-intro">
          <h1>My Skills record</h1>
          <p>A record of everyday skills you have learned.</p>
          <p>Earned by Maya Lin.</p>
        </header>
        <article className="credential-certificate">
          <header>
            <span className="credential-crest">
              <Flow6Asset group="credential" file="7a70b.svg" />
            </span>
            <span>
              <small>Companion · Skill Record</small>
              <b>Independent Living Skills</b>
            </span>
            <strong>
              <Flow6Asset group="credential" file="463eb.svg" />
              Confirmed
            </strong>
          </header>
          <section className="candidate-record">
            <small>Candidate Record</small>
            <h2>
              Maya Lin <span>Age 24</span>
            </h2>
            <p>
              Member number: <b>#CP-2024-884</b>
            </p>
            <div className="credential-qr">
              <span>
                <Flow6Asset group="credential" file="45fcc.svg" />
              </span>
              <b>Scan to check</b>
              <small>Check without internet</small>
            </div>
          </section>
          <dl className="credential-meta">
            <div>
              <dt>Issued By</dt>
              <dd>Companion</dd>
              <dd>My Skills record</dd>
            </div>
            <div>
              <dt>Certification Date</dt>
              <dd>November 2024</dd>
              <dd>Cycle 8 · Spring Cohort</dd>
            </div>
          </dl>
          <div className="credential-metrics">
            <span>
              <b>14</b>
              <small>Confirmed Stamps</small>
            </span>
            <span>
              <b>4</b>
              <small>Life Domains</small>
            </span>
            <span>
              <b>4</b>
              <small>Skills Learned</small>
            </span>
          </div>
          <section className="credential-skills">
            <h2>
              <Flow6Asset group="credential" file="2cc4c.svg" />
              Earned Living Competencies
            </h2>
            {credentialSkills.map((skill) => (
              <article key={skill.domain}>
                <span>
                  <small>{skill.domain}</small>
                  <h3>{skill.title}</h3>
                  <p>{skill.copy}</p>
                  <b className="credential-level">
                    <i />
                    <i />
                    <i /> Level 3 · By Myself
                  </b>
                </span>
                <span className="credential-skill-icon">
                  <Flow6Asset group="credential" file={skill.icon} />
                </span>
              </article>
            ))}
          </section>
          <footer className="credential-attestation">
            <span className="credential-crest">
              <Flow6Asset group="credential" file="f0ef9.svg" />
            </span>
            <span>
              <small>Confirmed by</small>
              <b>Sarah Martinez</b>
              <p>Family Friend · My People</p>
            </span>
            <strong>
              <Flow6Asset group="credential" file="4caf8.svg" />
              Record confirmed
            </strong>
          </footer>
        </article>
        <aside className="flow6-info">
          <Flow6Asset group="credential" file="be6ad.svg" />
          <p>
            <b>Your data stays yours</b>
            It works without internet and can move to a new device. You can
            print it or save a signed document.
          </p>
        </aside>
        {shareStatus && (
          <p className="flow6-status" role="status">
            {shareStatus}
          </p>
        )}
        <div className="flow6-actions">
          <button
            className="flow6-primary"
            onClick={() => go("credential-export")}
          >
            <Flow6Asset group="credential" file="660cb.svg" />
            Print or Save a Copy
          </button>
          <button onClick={shareCredential}>
            <Flow6Asset group="credential" file="85349.svg" />
            Share Skill Record
          </button>
        </div>
      </main>
    </div>
  )
}
const exportDestinations = [
  {
    id: "pdf",
    title: "Save as a Document",
    copy: "Saves to your phone’s Files. Works offline forever.",
    icon: "e2ac1.svg",
  },
  {
    id: "print",
    title: "Send to AirPrint / Network Printer",
    copy: "Print a paper copy for your binder or trusted person.",
    icon: "1162c.svg",
  },
  {
    id: "email",
    title: "Send by Email",
    copy: "Attach the saved document to an email.",
    icon: "f12b4.svg",
  },
] as const
function CredentialExport({ go }: { go: (page: Page) => void }) {
  const [destination, setDestination] = useState("pdf")
  const [included, setIncluded] = useState([true, true, false])
  const [status, setStatus] = useState("")
  const generate = () => {
    if (destination === "print") {
      window.print()
      setStatus("The print window opened.")
      return
    }
    downloadBlob(
      makeCredentialPdf(included[0], included[1], included[2]),
      "maya-lin-official-skill-passport.pdf",
    )
    if (destination === "email") {
      window.location.href =
        "mailto:?subject=Maya%20Lin%20My%20Skills%20record&body=The%20skill%20record%20was%20saved%20to%20your%20device.%20Attach%20it%20to%20this%20email."
      setStatus("The document was saved. Attach it to your email.")
    } else {
      setStatus("Official skill record saved.")
    }
  }
  return (
    <div className="flow-screen flow6-screen">
      <Flow6TopBar
        group="export"
        title="Print or Save"
        back={() => go("credential")}
        close={() => go("home")}
      />
      <main className="flow6-main">
        <Flow6Landmark
          group="export"
          label="Print or save a copy"
          copy={pageCopy["credential-export"]}
        />
        <header className="flow6-intro">
          <h1>Print or Save a Copy</h1>
          <p>Choose how to save your official skill record.</p>
        </header>
        <section className="document-preview">
          <div className="document-thumb" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>
              {["89352.svg", "1aff2.svg", "780ac.svg"].map((file) => (
                <Flow6Asset group="export" file={file} key={file} />
              ))}
            </span>
          </div>
          <span>
            <b>Confirmed Skill Record</b>
            <strong>Independent Living Skill Record</strong>
            <small>
              <Flow6Asset group="export" file="2a0e1.svg" />1 Page · Standard
              Letter (8.5 × 11 in)
            </small>
          </span>
        </section>
        <section className="export-section">
          <h2>1. Delivery Destination</h2>
          <div className="export-destinations" role="radiogroup">
            {exportDestinations.map((option) => (
              <button
                key={option.id}
                role="radio"
                aria-checked={destination === option.id}
                className={destination === option.id ? "selected" : ""}
                onClick={() => setDestination(option.id)}
              >
                <span className="export-radio" />
                <Flow6Asset group="export" file={option.icon} />
                <span>
                  <b>{option.title}</b>
                  <small>{option.copy}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="export-section">
          <h2>2. What to Include</h2>
          <div className="export-inclusions">
            {[
              ["Include 14 earned stamp badges", "Shows your learned skills"],
              [
                "Include trusted person confirmations",
                "Includes friend or family confirmation",
              ],
              ["Include private per-line notes", "Off by default for privacy"],
            ].map(([title, copy], index) => (
              <button
                key={title}
                role="checkbox"
                aria-checked={included[index]}
                onClick={() =>
                  setIncluded((current) =>
                    current.map((value, item) =>
                      item === index ? !value : value,
                    ),
                  )
                }
              >
                <span className={included[index] ? "checked" : ""}>
                  <Flow6Asset
                    group="export"
                    file={included[index] ? "3400b.svg" : "64275.svg"}
                  />
                </span>
                <span>
                  <b>{title}</b>
                  <small>{copy}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
        <aside className="flow6-info">
          <span className="flow6-round-icon">
            <Flow6Asset group="export" file="7bcb7.svg" />
          </span>
          <p>
            <b>High Contrast Print Ready</b>
            Pure black-and-white print compatible. High contrast saves color
            ink.
          </p>
        </aside>
        {status && (
          <p className="flow6-status" role="status">
            {status}
          </p>
        )}
        <div className="flow6-actions">
          <button className="flow6-primary" onClick={generate}>
            Save Document Now
            <Flow6Asset group="export" file="2ac9b.svg" />
          </button>
          <button onClick={() => go("credential")}>Cancel & Return</button>
        </div>
      </main>
    </div>
  )
}
function DataBackup({ go }: { go: (page: Page) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [restoreStatus, setRestoreStatus] = useState("")
  const restoreBackup = async (file?: File) => {
    if (!file) return
    try {
      const data = await readBackupEnvelope(JSON.parse(await file.text()))
      // Backups made before the rename say "Alongside"; keep accepting them.
      if (data.app !== "Companion" && data.app !== "Alongside")
        throw new Error("Invalid backup")
      localStorage.setItem("companion-passport-backup", JSON.stringify(data))
      setRestoreStatus(`Backup restored for ${data.member?.name || "Maya"}.`)
    } catch {
      setRestoreStatus("This file is not a valid Companion backup.")
    }
  }
  return (
    <div className="flow-screen flow6-screen">
      <Flow6TopBar
        group="backup"
        title="Data Backup"
        back={() => go("passport")}
        close={() => go("home")}
      />
      <main className="flow6-main">
        <Flow6Landmark
          group="backup"
          label="Back up your data"
          copy={pageCopy["data-backup"]}
        />
        <header className="flow6-intro">
          <h1>Back Up My Skills</h1>
          <p>Your data stays on your phone.</p>
          <p>Create an offline file to protect your progress.</p>
        </header>
        <section className="storage-health">
          <header>
            <span className="storage-shield">
              <Flow6Asset group="backup" file="fb0f4.svg" />
            </span>
            <span>
              <b>
                <i /> Storage Status: Healthy
              </b>
              <small>Local Device Only</small>
            </span>
          </header>
          <div className="storage-chips">
            {[
              ["68d4e.svg", "IndexedDB"],
              ["3b880.svg", "18 Logs"],
              ["ff7eb.svg", "14 Stamps"],
              ["02f8b.svg", "2 Appliances"],
            ].map(([icon, label]) => (
              <span key={label}>
                <Flow6Asset group="backup" file={icon} />
                {label}
              </span>
            ))}
          </div>
          <p>
            <Flow6Asset group="backup" file="33b81.svg" />
            Last backed up: Today at 2:00 PM (Offline file)
          </p>
        </section>
        <aside className="backup-callout">
          <Flow6Asset group="backup" file="6680f.svg" />
          <b>Phones can be lost or wiped. A backup protects your work.</b>
        </aside>
        <div className="backup-actions">
          <article>
            <header>
              <span className="flow6-round-icon">
                <Flow6Asset group="backup" file="eea78.svg" />
              </span>
              <span>
                <h2>Download Safe Backup File (.json)</h2>
                <p>Save an encrypted copy to phone Files.</p>
              </span>
            </header>
            <button className="flow6-primary" onClick={downloadPassportBackup}>
              <Flow6Asset group="backup" file="5d1b1.svg" />
              Download Backup File
            </button>
          </article>
          <article>
            <header>
              <span className="flow6-round-icon">
                <Flow6Asset group="backup" file="9b323.svg" />
              </span>
              <span>
                <h2>Restore from Existing Backup</h2>
                <p>Upload your saved backup on a new phone.</p>
              </span>
            </header>
            <input
              ref={inputRef}
              className="flow6-file-input"
              type="file"
              accept=".json,application/json"
              onChange={(event) => restoreBackup(event.target.files?.[0])}
            />
            <button onClick={() => inputRef.current?.click()}>
              <Flow6Asset group="backup" file="fe325.svg" />
              Upload Backup File
            </button>
          </article>
        </div>
        {restoreStatus && (
          <p className="flow6-status" role="status">
            {restoreStatus}
          </p>
        )}
        <section className="backup-photos">
          <figure>
            <img
              src={`${A}/flow6-backup/09483.png`}
              alt="Hands organizing personal files"
            />
            <figcaption>
              <b>Personal & Safe</b>
              <span>Only on your device</span>
            </figcaption>
          </figure>
          <figure>
            <img
              src={`${A}/flow6-backup/eab8c.png`}
              alt="A portable digital skills record on a desk"
            />
            <figcaption>
              <b>Portable Logs</b>
              <span>Easily transferable</span>
            </figcaption>
          </figure>
        </section>
        <aside className="flow6-info">
          <span className="flow6-round-icon">
            <Flow6Asset group="backup" file="9b039.svg" />
          </span>
          <p>
            <b>Local-First Privacy Guarantee</b>
            Zero cloud databases. We store no profile or photos on a server.
          </p>
        </aside>
        <div className="flow6-actions">
          <button
            className="flow6-primary"
            onClick={() => go("storage-control")}
          >
            Manage Storage & Deletions
            <Flow6Asset group="backup" file="77060.svg" />
          </button>
          <button onClick={() => go("passport")}>
            <Flow6Asset group="backup" file="9867c.svg" />
            Return to Settings
          </button>
        </div>
      </main>
    </div>
  )
}
type StorageUndo = "profiles" | "share" | "all" | null
function StorageControl({ go }: { go: (page: Page) => void }) {
  const [profilesActive, setProfilesActive] = useState(true)
  const [shareActive, setShareActive] = useState(true)
  const [logsVisible, setLogsVisible] = useState(false)
  const [profileVisible, setProfileVisible] = useState(false)
  const [clearReady, setClearReady] = useState(false)
  const [dataCleared, setDataCleared] = useState(false)
  const [undo, setUndo] = useState<StorageUndo>(null)
  useEffect(() => {
    const saved = localStorage.getItem("companion-storage-state")
    if (!saved) return
    try {
      const state = JSON.parse(saved)
      setProfilesActive(state.profilesActive !== false)
      setShareActive(state.shareActive !== false)
      setDataCleared(state.dataCleared === true)
    } catch {
      localStorage.removeItem("companion-storage-state")
    }
  }, [])
  useEffect(() => {
    localStorage.setItem(
      "companion-storage-state",
      JSON.stringify({ profilesActive, shareActive, dataCleared }),
    )
  }, [profilesActive, shareActive, dataCleared])
  const exportCsv = () =>
    downloadBlob(
      new Blob(
        [
          "routine,date,level\nWashing Machine Laundry,2024-11-14,3\nStovetop Pasta,2024-11-12,3\nLight Rail,2024-11-10,3\n",
        ],
        { type: "text/csv" },
      ),
      "companion-routine-logs.csv",
    )
  const restore = () => {
    if (undo === "profiles") setProfilesActive(true)
    if (undo === "share") setShareActive(true)
    if (undo === "all") {
      setProfilesActive(true)
      setShareActive(true)
      setDataCleared(false)
      localStorage.setItem(
        "companion-passport-backup",
        JSON.stringify(passportBackup),
      )
    }
    setUndo(null)
    setClearReady(false)
  }
  return (
    <div className="flow-screen flow6-screen">
      <Flow6TopBar
        group="storage"
        title="Storage Management"
        back={() => go("data-backup")}
        close={() => go("home")}
      />
      <main className="flow6-main">
        <Flow6Landmark
          group="storage"
          icon="a012d.svg"
          label="Manage your data"
          copy={pageCopy["storage-control"]}
        />
        <header className="flow6-intro storage-intro">
          <span>
            <h1>Storage & Data Control</h1>
            <p>You own every piece of your data.</p>
            <p>Delete single items or reset safely.</p>
          </span>
          <button
            onClick={() => speak(pageCopy["storage-control"])}
            aria-label="Listen to page description"
          >
            <Flow6Asset group="storage" file="679ea.svg" />
          </button>
        </header>
        <aside className="safety-net">
          <span className="flow6-round-icon">
            <Flow6Asset group="storage" file="846f5.svg" />
          </span>
          <p>
            <b>10-Second Safety Net</b>
            Deleted items can be restored with one tap.
          </p>
        </aside>
        {undo && (
          <aside className="storage-undo" role="status">
            <span>
              <b>Item removed from this device.</b>
              <small>Undo is available for 10 seconds.</small>
            </span>
            <button onClick={restore}>Undo</button>
          </aside>
        )}
        <section className="data-ledger">
          <header>
            <h2>Data Items Ledger</h2>
            <span>3 categories</span>
          </header>
          <article>
            <header>
              <span className="flow6-square-icon">
                <Flow6Asset group="storage" file="ab3b3.svg" />
              </span>
              <span>
                <h3>Routine Logs (18 entries)</h3>
                <p>All task logs since October 2024.</p>
              </span>
            </header>
            {logsVisible && (
              <p className="ledger-detail">
                Laundry, pasta, transit, shopping, and 14 more logs.
              </p>
            )}
            <div>
              <button onClick={exportCsv}>
                <Flow6Asset group="storage" file="77e18.svg" />
                Export Spreadsheet
              </button>
              <button onClick={() => setLogsVisible(!logsVisible)}>
                <Flow6Asset group="storage" file="0e275.svg" />
                Manage (18)
              </button>
            </div>
          </article>
          <article>
            <header>
              <span className="flow6-square-icon">
                <Flow6Asset group="storage" file="9a512.svg" />
              </span>
              <span>
                <h3>
                  Appliance Profiles (
                  {profilesActive ? "2 text profiles" : "0 profiles"})
                </h3>
                <p>
                  {profilesActive
                    ? "Uptown Coffee Kiosk & Home Washer."
                    : "Profiles removed from this device."}
                </p>
              </span>
            </header>
            {profileVisible && profilesActive && (
              <p className="ledger-detail">
                Text-only setup notes. No photos are stored.
              </p>
            )}
            <div>
              <button
                disabled={!profilesActive}
                onClick={() => setProfileVisible(!profileVisible)}
              >
                <Flow6Asset group="storage" file="51d1b.svg" />
                View
              </button>
              <button
                className="danger"
                disabled={!profilesActive}
                onClick={() => {
                  setProfilesActive(false)
                  setUndo("profiles")
                }}
              >
                <Flow6Asset group="storage" file="b1cb4.svg" />
                Delete Profile
              </button>
            </div>
          </article>
          <article>
            <header>
              <span className="flow6-square-icon">
                <Flow6Asset group="storage" file="cd28b.svg" />
              </span>
              <span>
                <h3>
                  Active Share Snapshots (
                  {shareActive ? "1 active" : "0 active"})
                </h3>
                <p>
                  {shareActive
                    ? "Mom’s November 2024 view."
                    : "The shared link is stopped."}
                </p>
              </span>
            </header>
            <div>
              <button
                disabled={!shareActive}
                onClick={() => {
                  setShareActive(false)
                  setUndo("share")
                }}
              >
                <Flow6Asset group="storage" file="70698.svg" />
                Stop Sharing
              </button>
            </div>
          </article>
        </section>
        <section className="clear-data-card">
          <header>
            <Flow6Asset group="storage" file="f78b4.svg" />
            <h2>Clear Local App Data</h2>
          </header>
          <p>Removes all local logs on this device.</p>
          <p>Saved skill records remain safe and valid.</p>
          <button className="flow6-primary" onClick={downloadPassportBackup}>
            <Flow6Asset group="storage" file="94437.svg" />
            Export Backup Before Reset
          </button>
          <button
            className="clear-device"
            disabled={dataCleared}
            onClick={() => {
              if (!clearReady) {
                setClearReady(true)
                return
              }
              localStorage.removeItem("companion-passport-backup")
              setProfilesActive(false)
              setShareActive(false)
              setDataCleared(true)
              setClearReady(false)
              setUndo("all")
            }}
          >
            <Flow6Asset group="storage" file="357c6.svg" />
            {dataCleared
              ? "Device Data Cleared"
              : clearReady
                ? "Tap Again to Clear Device Data"
                : "Clear Device Data"}
          </button>
        </section>
        <div className="flow6-actions">
          <button className="flow6-primary" onClick={() => go("passport")}>
            Done · Keep Data Safe
            <Flow6Asset group="storage" file="2ac9b.svg" />
          </button>
          <button onClick={() => go("passport")}>
            <Flow6Asset group="storage" file="a9063.svg" />
            Return to My Skills
          </button>
        </div>
      </main>
    </div>
  )
}
type Flow7AssetGroup = "block" | "consent" | "standby" | "alternatives"
function Flow7Asset({
  group,
  file,
  alt = "",
}: {
  group: Flow7AssetGroup
  file: string
  alt?: string
}) {
  return <img src={`${A}/flow7-${group}/${file}`} alt={alt} />
}
function Flow7TopBar({
  group,
  title,
  copy,
  back,
  close,
}: {
  group: Flow7AssetGroup
  title: string
  copy: string
  back: () => void
  close: () => void
}) {
  return (
    <header className="flow7-topbar">
      <span>
        <button onClick={back} aria-label="Go back">
          <Flow7Asset group={group} file="54d97.svg" />
        </button>
        <button onClick={close} aria-label="Close this flow">
          <Flow7Asset group={group} file="28d0b.svg" />
        </button>
      </span>
      <strong title={title}>{title}</strong>
      <span>
        <button onClick={() => speak(copy)} aria-label="Read this page aloud">
          <Flow7Asset group={group} file="63493.svg" />
        </button>
        <span className="flow7-profile" aria-label="Maya's profile">
          <Flow7Asset group={group} file="59e02.svg" />
        </span>
      </span>
    </header>
  )
}
function Flow7Actions({ children }: { children: React.ReactNode }) {
  return <div className="flow7-actions">{children}</div>
}
// What the safety screen says, by the kind of item that was blocked.
const SAFETY_COPY: Record<
  SafetyCategory,
  { intro: string; hazard: string; info: string }
> = {
  heat: {
    intro: "We do not guide stoves, ovens or heaters, for your safety.",
    hazard: "High heat & burn risk",
    info: "Stoves, ovens and heaters need a support person present. This rule keeps you safe.",
  },
  electrical: {
    intro: "We do not guide electrical work, for your safety.",
    hazard: "Electric shock risk",
    info: "Electrical panels and wiring need a support person present. This rule keeps you safe.",
  },
  medication: {
    intro: "We do not guide medication, for your safety.",
    hazard: "Taking the wrong dose can hurt you",
    info: "Check medication with a support person, nurse or pharmacist. This rule keeps you safe.",
  },
}

function SafetyBlock({ go }: { go: (page: Page) => void }) {
  const session = usePointAskSession()
  const blocked = session.result?.safety_blocked ? session.result : null
  const category =
    (blocked &&
      (safetyCategory(blocked.appliance) ??
        safetyCategory(blocked.item_name))) ||
    "heat"
  const text = SAFETY_COPY[category]
  const copy = blocked
    ? `${blocked.item_name} detected. ${text.intro} A trusted friend or family member can help you in person.`
    : pageCopy["safety-block"]
  return (
    <div className="flow-screen flow7-screen">
      <Flow7TopBar
        group="block"
        title="Safety Handoff Overview"
        copy={copy}
        back={() => go("point")}
        close={() => go("home")}
      />
      <main className="flow7-main">
        <section className="flow7-landmark warning-landmark">
          <span className="flow7-landmark-icon">
            <Flow7Asset group="block" file="0b19f.svg" />
          </span>
          <span>
            <b>Safety first</b>
            <small>We don't guide this one</small>
          </span>
          <button
            onClick={() => speak(copy)}
            aria-label="Listen to safety message"
          >
            <Flow7Asset group="block" file="5d5a8.svg" />
          </button>
        </section>
        <header className="flow7-intro">
          <h1>
            {blocked
              ? `${blocked.item_name} Detected`
              : "Stovetop Burner Detected"}
          </h1>
          <p>{text.intro}</p>
        </header>
        <figure className="flow7-hero safety-photo">
          {blocked && session.photoUrl ? (
            <img src={session.photoUrl} alt="Your photo" />
          ) : (
            <Flow7Asset
              group="block"
              file="65988.png"
              alt="Electric coil stovetop detected by the camera"
            />
          )}
          <figcaption className="blocked-badge">
            <Flow7Asset group="block" file="d132b.svg" />
            Blocked for your safety
          </figcaption>
          <span className="detection-card">
            <span className="flow7-round-icon">
              <Flow7Asset group="block" file="5d004.svg" />
            </span>
            <span>
              <b>
                Object: {blocked ? blocked.item_name : "Electric Coil Stovetop"}
              </b>
              <small>Hazard: {text.hazard}</small>
            </span>
          </span>
        </figure>
        <aside className="flow7-info">
          <Flow7Asset group="block" file="6e52b.svg" />
<p>{text.info}</p>
        </aside>
        <Flow7Actions>
          <button
            className="flow7-primary"
            onClick={() => {
              startAsk({
                reason: "safety",
                itemName: blocked?.item_name ?? "Electric Coil Stovetop",
              })
              go("photo-confirmation")
            }}
          >
            Ask someone you trust
          </button>
          <button onClick={() => go("point")}>
            <Flow7Asset group="block" file="85b76.svg" />
            Cancel & Return to Camera
          </button>
        </Flow7Actions>
      </main>
    </div>
  )
}
function PhotoConfirmation({ go }: { go: (page: Page) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [consent, setConsent] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [error, setError] = useState("")
  const ask = useAskRequest()
  const session = usePointAskSession()
  const shownPhoto = photo ?? (ask ? session.photoUrl : null)
  const note = !ask
    ? "I want to warm up pasta safely."
    : ask.reason === "safety"
      ? "I want help using this safely."
      : ask.reason === "stuck"
        ? "I'm stuck on this step."
        : "I don't know how to use this."
  const backTo: Page =
    ask?.reason === "stuck"
      ? "cafesteps"
      : ask?.reason === "unsure"
        ? "identify"
        : "safety-block"
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo)
    },
    [photo],
  )
  const choosePhoto = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setError("Choose an image smaller than 10 MB.")
      return
    }
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(URL.createObjectURL(file))
    setConsent(false)
    setError("")
  }
  const cancel = () => {
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(null)
    go("point")
  }
  const send = () => {
    if (!consent) return
    markSent("app")
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(null)
    setConsent(false)
    go("coach-standby")
  }
  // Real send for the prototype: the phone's share menu (text, WhatsApp...).
  const sendByText = async () => {
    if (!consent || !ask) return
    try {
      await shareByText(ask, shownPhoto)
      markSent("text")
      setConsent(false)
      go("coach-standby")
    } catch (err) {
      // Closing the share menu is not an error.
      if ((err as Error)?.name !== "AbortError") {
        setError("I couldn't open your messages. Try again.")
      }
    }
  }
  return (
    <div className="flow-screen flow7-screen">
      <Flow7TopBar
        group="consent"
        title="Sensory & Regulation Needs"
        copy={pageCopy["photo-confirmation"]}
        back={() => go(backTo)}
        close={cancel}
      />
      <main className="flow7-main">
        <div className="flow7-progress">
          <span>
            <i /> Trusted person handoff · Step 2 of 2
          </span>
          <b>Photo Check</b>
        </div>
        <header className="flow7-intro">
          <h1>Share Photo with Sarah?</h1>
          <p>
            Check your photo before sending. Sarah, your family friend in My
            People, will see what you see.
          </p>
        </header>
        <section className="photo-check-card">
          <div className="photo-check-preview">
            <img
              src={shownPhoto || `${A}/flow7-consent/ea664.png`}
              alt={ask ? "Your photo" : "Photo of the detected electric stovetop"}
            />
            <span className="safe-photo-badge">
              <Flow7Asset group="consent" file="e72a1.svg" />
              Safe Photo Checked
            </span>
            <button onClick={() => inputRef.current?.click()}>
              <Flow7Asset group="consent" file="fc906.svg" />
              Retake
            </button>
            <input
              ref={inputRef}
              className="flow7-file-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => choosePhoto(event.target.files?.[0])}
            />
          </div>
          <div className="privacy-protections">
            <h2>
              <Flow7Asset group="consent" file="e5268.svg" />
              Privacy Protections
            </h2>
            {[
              [
                "Check your photo first",
                "Make sure no faces or personal things are in it",
              ],
              ["Only Sarah will see it", "It is not posted anywhere"],
              ["Your photo is not saved", "Companion does not keep it"],
            ].map(([title, detail]) => (
              <div key={title}>
                <span>
                  <Flow7Asset group="consent" file="52dd4.svg" />
                </span>
                <p>
                  <b>{title}</b>
                  <small>{detail}</small>
                </p>
              </div>
            ))}
          </div>
        </section>
        {error && (
          <p className="flow7-status" role="alert">
            {error}
          </p>
        )}
        <section className="message-preview">
          <header>
            <b>Message preview</b>
            <span>Local preview</span>
          </header>
          <div className="coach-recipient">
            <Flow7Asset
              group="consent"
              file="624b9.png"
              alt="Sarah Martinez, family friend"
            />
            <span>
              <b>Sarah Martinez</b>
              <small>Family Friend · In My People</small>
            </span>
          </div>
          <blockquote>
            <b>System Message:</b>
            “
            {ask
              ? askMessage(ask)
              : "Maya needs in-person help with the stovetop burner at Transition Kitchen."}
            ”
          </blockquote>
          <p className="resident-note">
            <Flow7Asset group="consent" file="5e7a5.svg" />
            <span>
              <b>Your note:</b> “{note}”
            </span>
          </p>
          <p className="static-eta">
            <Flow7Asset group="consent" file="7f536.svg" />
            {ask
              ? "Sarah will get your message right away."
              : "Estimated arrival: within 3 minutes"}
          </p>
        </section>
        <label className="consent-control">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            <b>I choose to share this photo with Sarah.</b>
            <small>
              The photo stays local until I confirm. I can cancel instead.
            </small>
          </span>
        </label>
        <Flow7Actions>
          <button className="flow7-primary" disabled={!consent} onClick={send}>
            Confirm & Send to Sarah
            <Flow7Asset group="consent" file="2ac9b.svg" />
          </button>
          {ask && (
            <button disabled={!consent} onClick={sendByText}>
              Send by text message instead
            </button>
          )}
          <button onClick={cancel}>
            <Flow7Asset group="consent" file="15ad5.svg" />
            Keep Photo Private & Cancel
          </button>
        </Flow7Actions>
      </main>
    </div>
  )
}
function CoachStandby({ go }: { go: (page: Page) => void }) {
  const [inhale, setInhale] = useState(true)
  const [callStatus, setCallStatus] = useState("")
  const ask = useAskRequest()
  const helping = ask && ask.reason !== "safety"
  const byText = ask?.sentBy === "text"
  const reply = !ask
    ? "Hi Maya! I see your stove photo. Don’t touch the dials yet, I’m walking over right now!"
    : ask.reason === "safety"
      ? "Hi Maya! I got your photo. Please don't touch it yet. I'm coming to help."
      : ask.reason === "stuck"
        ? "Hi Maya! I can see your photo. Give me a minute and I'll help you with this step."
        : "Hi Maya! I can see your photo. Let me take a look and tell you what it is."
  return (
    <div className="flow-screen flow7-screen">
      <Flow7TopBar
        group="standby"
        title="Friend or Family Support"
        copy={pageCopy["coach-standby"]}
        back={() => go("photo-confirmation")}
        close={() => go("home")}
      />
      <main className="flow7-main">
        <div className="flow7-live">
          <span>
            <i /> {byText ? "Sent by text message" : "Live support · Sarah notified"}
          </span>
          <button onClick={() => speak(pageCopy["coach-standby"])}>
            <Flow7Asset group="standby" file="dc99e.svg" /> Listen
          </button>
        </div>
        <header className="flow7-intro">
          <h1>{helping ? "Sarah Got Your Message" : "Sarah Is On Her Way"}</h1>
          <p>
            {helping
              ? "Sarah is looking at your photo. Take a breath while you wait."
              : "Sarah received your photo. Take a seat and relax while you wait."}
          </p>
        </header>
        <section className="coach-status-card">
          <header>
            <span className="coach-photo">
              <Flow7Asset
                group="standby"
                file="4d7d4.png"
                alt="Sarah, family friend"
              />
              <i />
            </span>
            <span>
              <h2>Sarah</h2>
              <b className="active-pill">
                <i /> {helping ? "Active · Replying" : "Active · Arriving in ~2 min"}
              </b>
              <strong>Family Friend · My People</strong>
              <small>
                <Flow7Asset group="standby" file="1dc61.svg" />
                {helping ? "Reading your message" : "Nearby and on the way"}
              </small>
            </span>
          </header>
          <blockquote>
            <Flow7Asset group="standby" file="48b70.svg" />
            <span>
              {byText ? (
                <>
                  <b>Your text was sent.</b>
                  Sarah will reply in your messages.
                </>
              ) : (
                <>
                  <b>Sarah wrote just now:</b>“{reply}”
                  {ask && (
                    <small>In this prototype, Sarah's reply is an example.</small>
                  )}
                </>
              )}
            </span>
          </blockquote>
          <p className="route-status">
            <b>Support Request Status</b>
            <span>
              <i />
              <i />
              <i /> {helping ? "Message delivered" : "Assigned & En Route"}
            </span>
          </p>
        </section>
        <a
          className="flow7-call"
          href="tel:"
          onClick={() => setCallStatus("Opening your phone call controls.")}
        >
          <Flow7Asset group="standby" file="5d6dd.svg" />
          Call Sarah Martinez
        </a>
        {callStatus && (
          <p className="flow7-status" role="status">
            {callStatus}
          </p>
        )}
        <section className="breathing-pause">
          <header>
            <span>
              <Flow7Asset group="standby" file="ab122.svg" />
              <h2>Calm Breathing Pause</h2>
            </span>
            <small>Self-paced</small>
          </header>
          <p>
            Feeling anxious? Tap the circle whenever you want to take a slow,
            gentle breath.
          </p>
          <button
            className={inhale ? "" : "exhale"}
            onClick={() => setInhale((value) => !value)}
            aria-pressed={!inhale}
          >
            <Flow7Asset group="standby" file="ae2db.svg" />
            {inhale ? "Tap to Inhale" : "Tap to Exhale"}
          </button>
          <small>
            {inhale
              ? "Breathe in gently through your nose."
              : "Breathe out gently when you are ready."}
          </small>
        </section>
        <aside className="right-thing">
          <Flow7Asset group="standby" file="bc756.svg" />
          <p>
            <b>You did the right thing.</b>
            Checking with Point & Ask protects your home. Asking for help is an
            independent skill you can be proud of!
          </p>
        </aside>
        <Flow7Actions>
          {helping ? (
            <button
              className="flow7-primary"
              onClick={() => go(ask?.reason === "stuck" ? "cafesteps" : "scan")}
            >
              {ask?.reason === "stuck" ? "Back to my steps" : "Try another photo"}
              <Flow7Asset group="standby" file="d3302.svg" />
            </button>
          ) : (
            <button
              className="flow7-primary"
              onClick={() => go("safe-alternatives")}
            >
              View Safe Stovetop Alternatives
              <Flow7Asset group="standby" file="d3302.svg" />
            </button>
          )}
          <button onClick={() => go("home")}>
            <Flow7Asset group="standby" file="fb28f.svg" />
            Cancel Support Request (I’m okay now)
          </button>
        </Flow7Actions>
      </main>
    </div>
  )
}
const safeOptions = [
  {
    title: "Microwave Reheat",
    subtitle: "Supported Routine",
    level: "●●● By myself",
    copy: "Press 1 minute. Safe door latch with zero open flame.",
    action: "Open Microwave Guide",
    icon: "8262e.svg",
    response:
      "Microwave guide opened. Use a microwave-safe dish. Press one minute, then check whether the food is warm.",
  },
  {
    title: "Electric Kettle",
    subtitle: "Warm Water Routine",
    level: "●●○ With AI help",
    copy: "Auto-shutoff switch turns off automatically when boiled.",
    action: "Open Kettle Guide",
    icon: "9a512.svg",
    response:
      "Kettle guide opened. Fill only to the marked line, close the lid, and use the auto-shutoff switch.",
  },
]
function SafeAlternatives({ go }: { go: (page: Page) => void }) {
  const [status, setStatus] = useState("")
  const openGuide = (response: string) => {
    setStatus(response)
    speak(response)
  }
  return (
    <div className="flow-screen flow7-screen">
      <Flow7TopBar
        group="alternatives"
        title="Safety Handoff Overview"
        copy={pageCopy["safe-alternatives"]}
        back={() => go("coach-standby")}
        close={() => go("home")}
      />
      <main className="flow7-main">
        <section className="alternatives-banner">
          <header>
            <span>
              <Flow7Asset group="alternatives" file="b57b7.svg" /> Safe
              alternatives · Zero pressure
            </span>
            <button onClick={() => speak(pageCopy["safe-alternatives"])}>
              <Flow7Asset group="alternatives" file="1af84.svg" /> Listen
            </button>
          </header>
          <h1>Safe Ways to Warm Food</h1>
          <p>You can make a warm meal safely without turning on the stove.</p>
        </section>
        <figure className="flow7-hero alternatives-photo">
          <Flow7Asset
            group="alternatives"
            file="6ffd5.png"
            alt="A calm and tidy kitchen space"
          />
          <figcaption>
            <Flow7Asset group="alternatives" file="4955a.svg" /> Calm Kitchen
            Space
          </figcaption>
        </figure>
        <section className="safe-option-list">
          {safeOptions.map((option, index) => (
            <article key={option.title}>
              <header>
                <span className="option-icon">
                  <Flow7Asset group="alternatives" file={option.icon} />
                </span>
                <span>
                  <h2>{option.title}</h2>
                  <small>{option.subtitle}</small>
                </span>
                {index === 0 && <b className="earned">Earned</b>}
              </header>
              <b className="skill-level">{option.level}</b>
              <p>{option.copy}</p>
              <button onClick={() => openGuide(option.response)}>
                {option.action}
                <Flow7Asset
                  group="alternatives"
                  file={index === 0 ? "03d99.svg" : "1e8da.svg"}
                />
              </button>
            </article>
          ))}
          <article>
            <header>
              <span className="option-icon warm">
                <Flow7Asset group="alternatives" file="87df5.svg" />
              </span>
              <span>
                <h2>Cook Together with Sarah</h2>
                <small>In-Person Support</small>
              </span>
              <b className="tap-stamp">
                <Flow7Asset group="alternatives" file="365ee.svg" /> Tap Stamp
              </b>
            </header>
            <b className="skill-level">Sarah arriving in ~15 mins</b>
            <p>Practice boiling pasta with Sarah when she arrives.</p>
            <button onClick={() => go("confirmer")}>
              Earns a Confirm Together stamp
              <Flow7Asset group="alternatives" file="fe87c.svg" />
            </button>
          </article>
        </section>
        {status && (
          <p className="flow7-status" role="status">
            {status}
          </p>
        )}
        <aside className="zero-pressure">
          <span>
            <Flow7Asset group="alternatives" file="c2c5e.svg" />
          </span>
          <p>
            <b>Zero Pressure</b>Take your time. Stovetop practice will be logged
            as confirmed when you do it together with your trusted person.
          </p>
        </aside>
        <Flow7Actions>
          <button className="flow7-primary" onClick={() => go("home")}>
            Done · Return to Home
            <Flow7Asset group="alternatives" file="2ac9b.svg" />
          </button>
          <button onClick={() => go("coach-standby")}>
            <Flow7Asset group="alternatives" file="28fb6.svg" />
            Back to Sarah’s Message
          </button>
        </Flow7Actions>
      </main>
    </div>
  )
}
type Flow8AssetGroup = "input" | "mapping" | "clarification" | "confirmed"
function Flow8Asset({
  group,
  file,
  alt = "",
}: {
  group: Flow8AssetGroup
  file: string
  alt?: string
}) {
  return <img src={`${A}/flow8-${group}/${file}`} alt={alt} />
}
function Flow8TopBar({
  group,
  title,
  copy,
  back,
  home = false,
}: {
  group: Flow8AssetGroup
  title: string
  copy: string
  back?: () => void
  home?: boolean
}) {
  const sound = group === "mapping" ? "bfc78.svg" : "bfc78.svg"
  return (
    <header className={`flow8-topbar ${home ? "flow8-homebar" : ""}`}>
      {back ? (
        <button onClick={back} className="flow8-back">
          <Flow8Asset group={group} file="b37d7.svg" />
          Back
        </button>
      ) : (
        <strong>My Skills</strong>
      )}
      {!home && <strong title={title}>{title}</strong>}
      <span>
        <button onClick={() => speak(copy)} aria-label="Read this page aloud">
          <Flow8Asset group={group} file={sound} />
          {home && <small>Read</small>}
        </button>
        <span className="flow8-profile" aria-label="Maya's profile">
          <Flow8Asset group={group} file="59e02.svg" />
        </span>
      </span>
    </header>
  )
}
function Flow8Landmark({
  group,
  label,
  copy,
  warning = false,
  icon,
}: {
  group: Flow8AssetGroup
  label: string
  copy: string
  warning?: boolean
  icon?: string
}) {
  return (
    <div className={`flow8-landmark ${warning ? "warning" : ""}`}>
      <span>
        {icon ? (
          <Flow8Asset group={group} file={icon} />
        ) : (
          <i aria-hidden="true" />
        )}
        {label}
      </span>
      <button onClick={() => speak(copy)}>
        <Flow8Asset
          group={group}
          file={group === "confirmed" ? "d2a5e.svg" : "bfc78.svg"}
        />
        Listen
      </button>
    </div>
  )
}
function Flow8Buttons({ children }: { children: React.ReactNode }) {
  return <div className="flow8-buttons">{children}</div>
}
const defaultVoiceDraft =
  "I took the light rail train from Central Station to 8th Street all by myself today."
const quickVoicePrompts = [
  "Rode light rail by myself",
  "Folded fresh laundry",
  "Ordered coffee at kiosk",
  "Made stovetop pasta with Sarah",
]
const hazardousVoiceTopics = [
  "burner",
  "heater",
  "medication",
  "medicine",
  "oven",
  "stove",
  "stovetop",
]
function VoiceLogInput({
  go,
  draft,
  setDraft,
}: {
  go: (page: Page) => void
  draft: string
  setDraft: (value: string) => void
}) {
  // If the sample sentence is still there, voice replaces it instead of adding to it.
  const { listening, toggle, message } = useVoiceTyping(
    draft === defaultVoiceDraft ? "" : draft,
    setDraft,
  )
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState("")
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0
  const review = async () => {
    const text = draft.toLowerCase()
    const hazardous = hazardousVoiceTopics.some((topic) => text.includes(topic))
    if (hazardous) {
      go("safety-block")
      return
    }
    if (apiAvailable) {
      setChecking(true)
      setError("")
      try {
        const outcome = await matchLog(draft)
        go(outcome === "matched" ? "skill-mapping" : "skill-clarification")
      } catch {
        setError("I couldn't check this right now. Please try again.")
      } finally {
        setChecking(false)
      }
      return
    }
    const unclear =
      text.includes("bought something") ||
      (text.includes("station") && !text.includes("light rail"))
    go(unclear ? "skill-clarification" : "skill-mapping")
  }
  return (
    <div className="flow-screen flow8-screen">
      <Flow8TopBar
        group="input"
        title="Tell Me Something Else"
        copy={pageCopy["voice-log"]}
        back={() => go("logging")}
      />
      <main className="flow8-main">
        <Flow8Landmark
          group="input"
          icon="f8f4c.svg"
          label="Tell us what you did"
          copy={pageCopy["voice-log"]}
        />
        <header className="flow8-intro">
          <h1>Tell Me What You Did</h1>
          <p>
            Speak or type in your own words. No complicated forms or checklists.
          </p>
        </header>
        <section className="voice-card" aria-live="polite">
          <button
            className={`voice-mic ${listening ? "active" : ""}`}
            onClick={toggle}
            aria-pressed={listening}
            aria-label={listening ? "Stop listening" : "Start speaking"}
          >
            <Flow8Asset group="input" file="1e757.svg" />
          </button>
          <b>{listening ? "Tap to stop" : "Tap to speak"}</b>
          <p className="listening-pill">
            <span aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            {listening ? "Listening to your voice..." : "Voice input paused"}
          </p>
          {message && (
            <p className="guidance-message" role="status">
              {message}
            </p>
          )}
          <article className="transcript-tile">
            <header>
              <b>Transcribed Words</b>
              <span>
                <i />
                {listening ? "Live audio active" : "Text ready"}
              </span>
            </header>
            <blockquote>“{draft || "Your words will appear here."}”</blockquote>
            <footer>
              <span>{wordCount} words spoken</span>
              <b>
                {listening ? "Listening..." : draft ? "Words ready" : "Waiting for words"}
              </b>
            </footer>
          </article>
        </section>
        <section className="text-alternative">
          <header>
            <label htmlFor="voice-log-text">Or type here instead</label>
            <button onClick={() => setDraft("")}>
              <Flow8Asset group="input" file="62094.svg" />
              Clear text
            </button>
          </header>
          <textarea
            id="voice-log-text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
          />
        </section>
        <section className="quick-prompts">
          <h2>
            <Flow8Asset group="input" file="d5ad3.svg" />
            Tap an idea to fill it in:
          </h2>
          <div>
            {quickVoicePrompts.map((prompt) => (
              <button key={prompt} onClick={() => setDraft(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </section>
        <aside className="voice-privacy">
          <Flow8Asset group="input" file="f2703.svg" />
          <p>
            <b>Private voice typing</b>
            Your phone's voice typing turns your speech into words. Companion
            never records or saves your audio.
            {apiAvailable &&
              " Your words are sent securely to find your skill, and are not stored."}
          </p>
        </aside>
        <Flow8Buttons>
          {error && (
            <p className="guidance-message" role="status">
              {error}
            </p>
          )}
          <button
            className="flow8-primary"
            onClick={review}
            disabled={!draft.trim() || checking}
          >
            {checking ? "Finding your skill..." : "Find My Skill & Review"}
            <Flow8Asset group="input" file="2ac9b.svg" />
          </button>
          <button onClick={() => go("home")}>Cancel & Return to Home</button>
        </Flow8Buttons>
      </main>
    </div>
  )
}
function SkillMapping({
  go,
  draft,
}: {
  go: (page: Page) => void
  draft: string
}) {
  const log = useLogSession()
  const result = log.result
  const skill = result ? getSkill(result.skill_id) : undefined
  const live = Boolean(result && skill)
  const transcript = live ? log.text : draft || defaultVoiceDraft
  const levelNumber = result ? SUPPORT_LEVELS.indexOf(result.support_level) + 1 : 3
  const levelLabel = result
    ? HELP_LABELS[result.support_level]
    : "By myself"
  return (
    <div className="flow-screen flow8-screen">
      <Flow8TopBar
        group="mapping"
        title="Skill Independence Level"
        copy={pageCopy["skill-mapping"]}
        back={() => go("voice-log")}
      />
      <main className="flow8-main">
        <Flow8Landmark
          group="mapping"
          label="Matching your skills"
          copy={pageCopy["skill-mapping"]}
        />
        <header className="flow8-intro">
          <h1>Here Is What We Found</h1>
          <p>
            We mapped your words to an independent routine in My Skills.
          </p>
        </header>
        <section className="spoken-reference">
          <header>
            <span>
              <Flow8Asset group="mapping" file="c03c2.svg" />
              What you shared
            </span>
            <b>Today · Just now</b>
          </header>
          <blockquote>“{transcript}”</blockquote>
          <button onClick={() => speak(transcript)}>
            <Flow8Asset group="mapping" file="8b506.svg" />
            Listen to transcript
          </button>
        </section>
        <section className="matched-skill">
          <header>
            <span>
              {skill ? CATEGORY_LABELS[skill.category] : "Mobility · Community transit"}
            </span>
            <b>
              <i />
              {result && live
                ? `${Math.round(result.confidence * 100)}% match`
                : "96% match"}
            </b>
          </header>
          <div className="matched-title">
            <span>
              <Flow8Asset group="mapping" file="28637.svg" />
            </span>
            <div>
              <h2>{skill ? skill.name : "Light Rail Public Transit"}</h2>
              {live ? (
                <p>{skill?.description}</p>
              ) : (
                <p>
                  <Flow8Asset group="mapping" file="48aa6.svg" />
                  Central Station → 8th Street
                </p>
              )}
            </div>
          </div>
          {!live && (
          <div className="route-line">
            <span>
              <i />
              Central Station
            </span>
            <Flow8Asset group="mapping" file="091a9.svg" />
            <span>
              <i />
              8th Street Station
            </span>
          </div>
          )}
        </section>
        <section className="detected-level">
          <h2>
            <Flow8Asset group="mapping" file="2ee68.svg" />
            Level {levelNumber} Detected: {live ? levelLabel : "By Myself"}
          </h2>
          <div>
            <b>Help Level:</b>
            <span>
              {Array.from({ length: levelNumber }, (_, i) => (
                <i key={i} />
              ))}{" "}
              {levelLabel}
            </span>
          </div>
          {live && result ? (
            <p>{result.reply}</p>
          ) : (
            <p>
              You stated <b>“all by myself.”</b> We automatically logged full
              independence with no extra questions needed.
            </p>
          )}
        </section>
        {!live && (
        <aside className="reward-preview">
          <span className="coffee-symbol" aria-hidden="true">
            ☕
          </span>
          <p>
            <b>Stamp goal progress</b>
            <strong>This log earns your 15th stamp!</strong>
            You will unlock your Coffee with Jordan reward goal.
          </p>
        </aside>
        )}
        <button
          className="change-match"
          onClick={() => go("skill-clarification")}
        >
          <Flow8Asset group="mapping" file="1d1ca.svg" />
          Not quite right? Change skill or level
        </button>
        <Flow8Buttons>
          <button
            className="flow8-primary"
            onClick={() => go("voice-confirmed")}
          >
            Confirm & Log to My Skills
            <Flow8Asset group="mapping" file="d3302.svg" />
          </button>
          <button onClick={() => go("voice-log")}>
            <Flow8Asset group="mapping" file="f5ff6.svg" />
            Try Speaking Again
          </button>
        </Flow8Buttons>
      </main>
    </div>
  )
}
const supportLevels = [
  ["With someone", 1],
  ["With AI help", 2],
  ["By myself", 3],
] as const
function SkillClarification({ go }: { go: (page: Page) => void }) {
  const [match, setMatch] = useState(true)
  const [level, setLevel] = useState(3)
  return (
    <div className="flow-screen flow8-screen">
      <Flow8TopBar
        group="clarification"
        title="Skill Entry Review"
        copy={pageCopy["skill-clarification"]}
        back={() => go("voice-log")}
      />
      <main className="flow8-main">
        <Flow8Landmark
          group="clarification"
          label="One quick question"
          copy={pageCopy["skill-clarification"]}
          warning
        />
        <header className="flow8-intro">
          <h1>Did You Mean This Skill?</h1>
          <p>We want to make sure we log the right routine for you.</p>
        </header>
        <section className="heard-card">
          <header>
            <b>What we heard</b>
            <span>
              <Flow8Asset group="clarification" file="c884a.svg" />
              64% Match
            </span>
          </header>
          <blockquote>“I bought something at the station.”</blockquote>
          <p>
            <Flow8Asset group="clarification" file="2a635.svg" />
            We never guess when we are unsure. You decide.
          </p>
        </section>
        <section className="candidate-card">
          <div className="candidate-title">
            <span>
              <Flow8Asset group="clarification" file="f3977.svg" />
            </span>
            <p>
              <small>Most Likely Matched Skill</small>
              <b>Grocery Store & Touchscreen Kiosk</b>
            </p>
          </div>
          <p className="alternate-skill">
            <Flow8Asset group="clarification" file="ae911.svg" />
            Or was it: Light Rail Transit card tap?
          </p>
          <div
            className="match-choices"
            role="radiogroup"
            aria-label="Confirm matched routine"
          >
            <button
              role="radio"
              aria-checked={match}
              className={match ? "selected" : ""}
              onClick={() => setMatch(true)}
            >
              <Flow8Asset group="clarification" file="1af07.svg" />
              Yes, that is what I did
              <Flow8Asset group="clarification" file="4abfa.svg" />
            </button>
            <button
              role="radio"
              aria-checked={!match}
              className={!match ? "selected" : ""}
              onClick={() => setMatch(false)}
            >
              <Flow8Asset group="clarification" file="3046c.svg" />
              Something else
              <Flow8Asset group="clarification" file="33d03.svg" />
            </button>
          </div>
        </section>
        {match && (
          <section className="level-selector">
            <h2>How did you do this routine today?</h2>
            <p>Pick the level that matches your experience.</p>
            <div role="radiogroup" aria-label="Support level">
              {supportLevels.map(([label, value]) => (
                <button
                  key={label}
                  role="radio"
                  aria-checked={level === value}
                  className={level === value ? "selected" : ""}
                  onClick={() => setLevel(value)}
                >
                  <span>
                    {Array.from({ length: 3 }, (_, index) => (
                      <i
                        className={index < value ? "filled" : ""}
                        key={index}
                      />
                    ))}
                  </span>
                  {label}
                  {level === value && (
                    <Flow8Asset group="clarification" file="53e46.svg" />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
        <aside className="no-log-note">
          <Flow8Asset group="clarification" file="678f7.svg" />
          <p>
            <b>No log is created</b> until you tap confirm. You can review or
            change this anytime.
          </p>
        </aside>
        <Flow8Buttons>
          <button
            className="flow8-primary"
            disabled={!match}
            onClick={() => go("voice-confirmed")}
          >
            Save Confirmed Routine
            <Flow8Asset group="clarification" file="d3302.svg" />
          </button>
          <button onClick={() => go("voice-log")}>
            <Flow8Asset group="clarification" file="0b547.svg" />
            Speak a Different Way
          </button>
        </Flow8Buttons>
      </main>
    </div>
  )
}
function VoiceLogConfirmed({ go }: { go: (page: Page) => void }) {
  const [saved, setSaved] = useState(true)
  const [rewardShown, setRewardShown] = useState(false)
  const log = useLogSession()
  const result = log.result
  const skill = result ? getSkill(result.skill_id) : undefined
  const live = Boolean(result && skill)
  const savedId = useRef<string | null>(null)
  useEffect(() => {
    if (live && result && saved && !savedId.current) {
      savedId.current = saveLog(log.text, result)
    }
    if (live && !saved && savedId.current) {
      removeEntry(savedId.current)
      savedId.current = null
    }
  }, [live, log.text, result, saved])
  return (
    <div className="flow-screen flow8-screen confirmed-screen">
      <Flow8TopBar
        group="confirmed"
        title="My Skills"
        copy={pageCopy["voice-confirmed"]}
        home
      />
      <main className="flow8-main">
        <Flow8Landmark
          group="confirmed"
          icon="fe87c.svg"
          label="Log saved"
          copy={pageCopy["voice-confirmed"]}
        />
        {saved ? (
          <>
            {!live && (
            <>
            <section className="stamp-milestone">
              <span className="milestone-crest">
                <Flow8Asset group="confirmed" file="47883.svg" />
              </span>
              <div>
                <small>Stamp 15 of 15</small>
                <h1>🎉 15th Stamp Earned!</h1>
                <p>Your voice log was added to My Skills.</p>
              </div>
              <footer>
                <span>
                  <b>My Skills Milestone</b>
                  <strong>100% Complete</strong>
                </span>
                <i>
                  <b />
                </i>
              </footer>
            </section>
            <section className="unlocked-reward">
              <header>
                <span className="coffee-symbol" aria-hidden="true">
                  ☕
                </span>
                <div>
                  <small>Goal Complete · 15 of 15 Stamps</small>
                  <h2>Reward unlocked: Coffee with Jordan!</h2>
                </div>
              </header>
              <p>
                You earned this reward by practicing your routines. Ask Jordan
                when they want to get coffee!
              </p>
              <button onClick={() => setRewardShown(true)}>
                <Flow8Asset group="confirmed" file="53f33.svg" />
                {rewardShown
                  ? "Reward Ready to Show Jordan"
                  : "Show Jordan My Unlocked Reward"}
              </button>
            </section>
            </>
            )}
            <section className="saved-entry">
              <header>
                <b>Saved entry details</b>
                <span>
                  <Flow8Asset group="confirmed" file="4f6b0.svg" />
                  Confirmed log
                </span>
              </header>
              <div className="saved-skill">
                <span>
                  <Flow8Asset group="confirmed" file="053ac.svg" />
                </span>
                <p>
                  <b>{skill ? skill.name : "Light Rail Public Transit"}</b>
                  <small>
                    {live ? `“${log.text}”` : "Central Station to 8th Street"}
                  </small>
                </p>
              </div>
              <div className="saved-level">
                <span>Skill Level:</span>
                <b>
                  {Array.from(
                    {
                      length: result
                        ? SUPPORT_LEVELS.indexOf(result.support_level) + 1
                        : 3,
                    },
                    (_, n) => (
                      <i key={n} />
                    ),
                  )}
                  {result && live
                    ? HELP_LABELS[result.support_level]
                    : "By myself"}
                </b>
              </div>
              <p>
                <Flow8Asset group="confirmed" file="ca64c.svg" />
                Saved from your voice · Kept on this device
              </p>
              <p>
                <Flow8Asset group="confirmed" file="63a43.svg" />
                {live ? `Today at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Today at 3:30 PM"}
              </p>
              <aside>
                <Flow8Asset group="confirmed" file="fb8be.svg" />
                Self-reported logs count toward My Skills.
              </aside>
            </section>
            <aside className="undo-voice-log">
              <header>
                <b>
                  <Flow8Asset group="confirmed" file="2a27d.svg" />
                  Made a mistake?
                </b>
                <span>Available now</span>
              </header>
              <p>Added to My Skills just now. You can undo this action.</p>
              <button onClick={() => setSaved(false)}>
                <Flow8Asset group="confirmed" file="1cc3e.svg" />
                Undo Log
              </button>
            </aside>
          </>
        ) : (
          <section className="voice-log-removed" role="status">
            <h1>Voice log removed</h1>
            <p>Your skills and stamp total were restored.</p>
            <button onClick={() => go("voice-log")}>
              Create a New Voice Log
            </button>
          </section>
        )}
        <Flow8Buttons>
          <button className="flow8-primary" onClick={() => go("home")}>
            Return to Daily Home
            <Flow8Asset group="confirmed" file="d3302.svg" />
          </button>
          <button onClick={() => go("passport")}>
            <Flow8Asset group="confirmed" file="b4e85.svg" />
            View in My Skills
          </button>
        </Flow8Buttons>
      </main>
      <nav className="flow8-bottom-nav" aria-label="My Skills navigation">
        {[
          ["6b6e7.svg", "Skills", "passport"],
          ["4a77d.svg", "Activity", "home"],
          ["049a5.svg", "Support", "people"],
        ].map(([icon, label, route]) => (
          <button key={label} onClick={() => go(route as Page)}>
            <Flow8Asset group="confirmed" file={icon} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
function MyPeople({ go }: { go: (page: Page) => void }) {
  return (
    <main className="page people-page">
      <div className="people-intro">
        <span className="blue-badge">Private support network</span>
        <h1>My People</h1>
        <p>People you trust are here when you want support.</p>
      </div>
      <section className="people-list">
        <article>
          <img src={`${A}/1bb43.png`} alt="" />
          <span>
            <h2>Jordan</h2>
            <p>Trusted Friend · Available now</p>
          </span>
          <button
            onClick={() =>
              speak("Calling Jordan is not enabled in this preview.")
            }
          >
            Call
          </button>
        </article>
        <article>
          <span className="person-initial">S</span>
          <span>
            <h2>Sarah</h2>
            <p>Family Friend · Available today</p>
          </span>
          <button onClick={() => speak("Message sent to Sarah.")}>
            Message
          </button>
        </article>
      </section>
      <button
        className="people-supporters-link"
        onClick={() => go("supporters")}
      >
        Open Supporters & Cheers
      </button>
    </main>
  )
}
export default function App() {
  const [page, setPage] = useState<Page>("home")
  const [voiceDraft, setVoiceDraft] = useState(defaultVoiceDraft)
  const focusedFlow = [
    "guidance",
    "logging",
    "celebration",
    "scan",
    "identify",
    "cafesteps",
    "cafecomplete",
    "summary",
    "summary-editor",
    "summary-sharing",
    "summary-shares",
    "supporters",
    "add-supporter",
    "cheer-detail",
    "confirmer",
    "credential",
    "credential-export",
    "data-backup",
    "storage-control",
    "safety-block",
    "photo-confirmation",
    "coach-standby",
    "safe-alternatives",
    "voice-log",
    "skill-mapping",
    "skill-clarification",
    "voice-confirmed",
  ].includes(page)
  const go = (next: Page) => {
    setPage(next)
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  }
  return (
    <div className={focusedFlow ? "app-shell" : "app-shell with-nav"}>
      {!focusedFlow && <AppHeader page={page} />}
      {page === "home" && <Home go={go} />}
      {page === "point" && <PointAsk go={go} />}
      {page === "passport" && <Passport go={go} />}
      {page === "people" && <MyPeople go={go} />}
      {page === "guidance" && <Guidance go={go} />}
      {page === "logging" && <Logging go={go} />}
      {page === "celebration" && <Celebration go={go} />}
      {page === "scan" && <CafeScan go={go} />}
      {page === "identify" && <CafeIdentify go={go} />}
      {page === "cafesteps" && <CafeSteps go={go} />}
      {page === "cafecomplete" && <CafeComplete go={go} />}
      {page === "summary" && <MonthlySummary go={go} />}
      {page === "summary-editor" && <SummaryEditor go={go} />}
      {page === "summary-sharing" && <PrivateSharing go={go} />}
      {page === "summary-shares" && <ActiveShares go={go} />}
      {page === "supporters" && <SupportersHub go={go} />}
      {page === "add-supporter" && <AddSupporter go={go} />}
      {page === "cheer-detail" && <CheerDetail go={go} />}
      {page === "confirmer" && <ConfirmerTap go={go} />}
      {page === "credential" && <CredentialPreview go={go} />}
      {page === "credential-export" && <CredentialExport go={go} />}
      {page === "data-backup" && <DataBackup go={go} />}
      {page === "storage-control" && <StorageControl go={go} />}
      {page === "safety-block" && <SafetyBlock go={go} />}
      {page === "photo-confirmation" && <PhotoConfirmation go={go} />}
      {page === "coach-standby" && <CoachStandby go={go} />}
      {page === "safe-alternatives" && <SafeAlternatives go={go} />}
      {page === "voice-log" && (
        <VoiceLogInput go={go} draft={voiceDraft} setDraft={setVoiceDraft} />
      )}
      {page === "skill-mapping" && <SkillMapping go={go} draft={voiceDraft} />}
      {page === "skill-clarification" && <SkillClarification go={go} />}
      {page === "voice-confirmed" && <VoiceLogConfirmed go={go} />}
      {!focusedFlow && <BottomNav page={page} go={go} />}
    </div>
  )
}
