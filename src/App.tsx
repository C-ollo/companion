import { useEffect, useRef, useState } from "react"

type Page = "home" | "point" | "passport" | "people" | "guidance" | "logging" | "celebration" | "scan" | "identify" | "cafesteps" | "cafecomplete" | "summary" | "summary-editor" | "summary-sharing" | "summary-shares" | "supporters" | "add-supporter" | "cheer-detail" | "confirmer" | "credential" | "credential-export" | "data-backup" | "storage-control" | "safety-block" | "photo-confirmation" | "coach-standby" | "safe-alternatives" | "voice-log" | "skill-mapping" | "skill-clarification" | "voice-confirmed"
const A = "/assets"
const icons = {
  logo: `${A}/companion-logo.svg`,
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
  home: "Good morning, Maya. How can I help you today? Choose Skill Passport to practice your skills, or Point and Ask for visual help.",
  point:
    "Point and Ask. Show me what you need help with. Point at any appliance, transit sign, menu, button, or label. Photos are never saved.",
  passport:
    "Skill Passport. Today's practice is Washing Machine Laundry. Your next step is to add one cup of soap and turn the dial to Normal.",
  people:
    "My People. Your private support network. Coach Marcus is on standby, and Jordan sent you a cheer.",
  guidance:
    "Step guidance. Add one cup of soap. Close the soap drawer. Take all the time you need.",
  logging:
    "You finished Washing Machine Laundry. How did it go today? There is no wrong answer.",
  celebration:
    "Great work, Maya. Your progress is recorded. Your Passport now has fourteen stamps.",
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
    "Cheer from Coach Jordan. Proud of you. Cheers stay calm and positive.",
  confirmer:
    "In-person staff confirmation. Hand the phone to your coach. They tap to verify you did this together.",
  credential:
    "Official Skill Passport. A verifiable summary of independent living routines earned by Maya Lin.",
  "credential-export":
    "Print or save as PDF. Choose how to save or share your official credential.",
  "data-backup":
    "Backup your Passport. Your data stays on your phone. Create an offline backup file.",
  "storage-control":
    "Storage and data control. You own every piece of your data.",
  "safety-block":
    "Stovetop burner detected. We do not guide stoves, ovens, heaters, or medication. A coach can help you in person.",
  "photo-confirmation":
    "Check your photo before sending. Your photo stays on this device unless you choose to share it with Coach Sarah.",
  "coach-standby":
    "Coach Sarah is on her way. Take a seat and relax while you wait.",
  "safe-alternatives":
    "Safe ways to warm food without turning on the stove. There is no pressure.",
  "voice-log":
    "Tell me what you did. Speak or type in your own words. You can always type instead.",
  "skill-mapping":
    "Here is what we found. We matched your words to a routine in your passport.",
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
function speak(text: string) {
  if (!("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const words = new SpeechSynthesisUtterance(text)
  words.rate = 0.88
  window.speechSynthesis.speak(words)
}
function AppHeader({ page }: { page: Page }) {
  const title =
    page === "home"
      ? "Home"
      : page === "point"
        ? "Point & Ask"
        : page === "people"
          ? "My People"
          : "Companion"
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">
          <Icon src={icons.logo} />
        </span>
        <span>
          <b>COMPANION</b>
          <strong>{title}</strong>
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
function FlowBadge({ screen, name }: { screen: number name: string }) {
  return (
    <div className="flow-badge">
      <span>
        <i /> Flow 1 · Companion Hub
      </span>
      <b>
        Screen {screen} of 3 ({name})
      </b>
    </div>
  )
}
function BottomNav({ page, go }: { page: Page go: (page: Page) => void }) {
  const items: { id: Page label: string icon: string }[] = [
    { id: "home", label: "Home", icon: icons.home },
    { id: "point", label: "Point & Ask", icon: icons.point },
    { id: "passport", label: "Skill Passport", icon: icons.passport },
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
  return (
    <section
      className={`calm-card ${breathing ? "breathing" : ""}`}
      aria-live="polite"
    >
      <div className="calm-leaf" aria-hidden="true">
        ◆
      </div>
      <div className="calm-copy">
        <div className="row-between">
          <h3>
            {breathing
              ? "Breathe slowly with the circle"
              : "Take a calm breath"}
          </h3>
          <span>Optional pause</span>
        </div>
        <p>
          {breathing
            ? "Continue for as long as you want."
            : "You are doing great. Follow a gentle breath cycle anytime."}
        </p>
        {breathing && <div className="breath-orb" aria-hidden="true" />}
        <button
          className="soft-button"
          onClick={() => setBreathing((value) => !value)}
        >
          {breathing ? "Stop breathing exercise" : "Start breathing"}
        </button>
      </div>
    </section>
  )
}
function Home({ go }: { go: (page: Page) => void }) {
  return (
    <main className="page home-page">
      <FlowBadge screen={1} name="Home" />
      <div className="readiness">
        <span>
          <i />
          Ready whenever you are
        </span>
        <button className="quiet-button" onClick={() => speak(pageCopy.home)}>
          <Icon src={icons.sound} />
          Listen
        </button>
      </div>
      <section className="greeting">
        <h1>Good morning, Maya.</h1>
        <p>How can I help you today?</p>
      </section>
      <section className="feature-grid" aria-label="Primary choices">
        <article className="feature-card">
          <div className="feature-top">
            <FeatureSticker kind="passport" />
            <div className="badge-row">
              <span className="mint-badge">◎ 2/3 rings</span>
              <span className="slate-badge">
                <i />3 tasks today
              </span>
            </div>
          </div>
          <p className="eyebrow">SKILL PASSPORT</p>
          <h2>Practice My Skills</h2>
          <p>Today's schedule, step-by-step guides, and progress logs.</p>
          <button className="primary-button" onClick={() => go("passport")}>
            Open Skill Passport <span>→</span>
          </button>
        </article>
        <article className="feature-card">
          <div className="feature-top">
            <FeatureSticker kind="point" />
            <span className="blue-badge">◉ Visual Help</span>
          </div>
          <p className="eyebrow">POINT & ASK</p>
          <h2>Visual Help Anywhere</h2>
          <p>
            Point your camera at appliances, signs, labels, or counters for
            instant guidance.
          </p>
          <button className="outline-button" onClick={() => go("point")}>
            <Icon src={icons.camera} />
            Open Point & Ask Camera <span>→</span>
          </button>
        </article>
      </section>
      <BreathingCard />
      <section className="coach-card">
        <span>
          <b className="verified">✓</b> Coach Marcus on standby
        </span>
        <b className="time">
          <i /> Until 4:00 PM
        </b>
      </section>
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
    setPhoto(URL.createObjectURL(file))
    setMessage("Photo ready. Tap Get simple guidance.")
  }
  return (
    <main className="page point-page">
      <FlowBadge screen={2} name="Point & Ask" />
      <section className="screen-intro">
        <span className="slate-badge">✦ Visual Helper</span>
        <h1>Show me what you need help with.</h1>
        <p>Point at any appliance, transit sign, menu, button, or label.</p>
      </section>
      <section className="read-bar">
        <span>
          <Icon src={icons.sound} />
          Need this screen read?
        </span>
        <button className="quiet-button" onClick={() => speak(pageCopy.point)}>
          <Icon src={icons.sound} />
          Listen
        </button>
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
          <b>
            {photo
              ? "Photo ready for guidance"
              : "Aim camera at any confusing item"}
          </b>
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
          <button
            className="guidance-button"
            onClick={() =>
              setMessage(
                "This looks like a control panel. Start by finding the large round power button. Take your time.",
              )
            }
          >
            Get simple guidance
          </button>
        )}
        {message && (
          <p className="guidance-message" role="status">
            {message}
          </p>
        )}
        <button
          className="safety-demo-button"
          onClick={() => go("safety-block")}
        >
          Check a stovetop safety example
        </button>
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
        <span className="shield">✓</span>
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
function Passport({ go }: { go: (page: Page) => void }) {
  const [highFive, setHighFive] = useState(false)
  return (
    <main className="page passport-page">
      <FlowBadge screen={3} name="Skill Passport" />
      <section className="passport-banner">
        <span className="book-badge">▣</span>
        <span>
          <small>Skill Passport</small>
          <b>Today's Practice</b>
        </span>
        <button
          className="quiet-button"
          onClick={() => speak(pageCopy.passport)}
        >
          <Icon src={icons.sound} />
          Listen
        </button>
      </section>
      <article className="routine-card">
        <div className="routine-photo">
          <img
            src={`${A}/b942e.png`}
            alt="A calm residential laundry room with front-loading machines"
          />
          <span className="duration">◷ 15 min</span>
          <span className="up-next">Up Next</span>
        </div>
        <div className="routine-body">
          <div className="routine-title">
            <span className="category-sticker washer">
              <i />
            </span>
            <span>
              <h1>Washing Machine Laundry</h1>
              <p>Wash towels and t-shirts.</p>
            </span>
          </div>
          <div className="level-card">
            <span className="level-ring">
              <Icon src={icons.levelRing} />
            </span>
            <span>
              <b>With a prompt</b>
              <small>Independence Level 2 of 3</small>
            </span>
            <strong>◉ Level 2</strong>
          </div>
          <div className="next-step">
            <span className="play">▶</span>
            <span>
              <b>NEXT: NORMAL DIAL</b>
              <p>Add 1 cup soap. Turn dial to Normal.</p>
            </span>
          </div>
          <button
            className="primary-button centered"
            onClick={() => go("guidance")}
          >
            Start Steps →
          </button>
        </div>
      </article>
      <section className="ring-legend" aria-label="Independence level legend">
        <span>
          <i className="rings one" />
          1. With help
        </span>
        <span className="selected">
          <i className="rings two" />
          2. With prompt
        </span>
        <span>
          <i className="rings three" />
          3. Mastered
        </span>
      </section>
      <section className="recent-section">
        <div className="section-heading">
          <h2>Recent Practice</h2>
          <span>3 Completed</span>
        </div>
        <div className="practice-list">
          {practices.map(([title, type, day, sticker]) => (
            <article className="practice-card" key={title}>
              <span className={`mini-sticker ${sticker}`} />
              <span className="practice-name">
                <b>{title}</b>
                <small>{type}</small>
              </span>
              <MasteryRing />
              <span className="mastered">
                <b>Mastered</b>
                <small>{day}</small>
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="monthly-summary-entry">
        <span>
          <small>NOVEMBER 2024</small>
          <h2>Monthly Summary</h2>
          <p>Review your routines, stamps, and progress.</p>
        </span>
        <button onClick={() => go("summary")}>Open Summary</button>
      </section>
      <section className="credential-entry-grid">
        <button onClick={() => go("credential")}>
          <span>OFFICIAL DOCUMENT</span>
          <b>Official Skill Passport</b>
          <small>View and export your verified credential.</small>
        </button>
        <button onClick={() => go("data-backup")}>
          <span>LOCAL-FIRST</span>
          <b>Backup Your Passport</b>
          <small>Save your progress to an offline file.</small>
        </button>
      </section>
      <section className="cheer-card">
        <div className="cheer-person">
          <img src={`${A}/1bb43.png`} alt="Jordan, job coach" />
          <span>
            <b>Jordan</b>
            <small>Job Coach</small>
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
      <section className="pause-card">
        <span>
          <b>Take a calm pause.</b>
          <small>Rest whenever you want.</small>
        </span>
        <button
          onClick={() =>
            speak(
              "Breathe in slowly. And breathe out slowly. Rest whenever you want.",
            )
          }
        >
          <Icon src={icons.breathe} />
          Breathe
        </button>
      </section>
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
            <p className="flow-label">INSTRUCTION</p>
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
                <b>Coach Sarah</b>
                <small>On standby for you</small>
              </span>
              <button onClick={() => speak("Coach Sarah is ready to help.")}>
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
    level: "●○○ With help",
    copy: "A supporter did the steps with me.",
  },
  {
    title: "I needed a reminder",
    level: "●●○ With a prompt",
    copy: "I used visual cards or a quick prompt.",
  },
  {
    title: "I did it on my own",
    level: "●●● On my own",
    copy: "I completed every step without reminders.",
  },
]
function Logging({ go }: { go: (page: Page) => void }) {
  const [choice, setChoice] = useState(1)
  const [confirmed, setConfirmed] = useState(true)
  return (
    <div className="flow-screen">
      <FlowTopBar
        title="Log Observation"
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
            <p>Every level builds your passport.</p>
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
            <p className="flow-label">PASSPORT ENTRY PREVIEW</p>
            <div className="stamp-preview">
              <strong>
                LEVEL {choice + 1}
                <small>STAMP</small>
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
              <img src={`${A}/c2624.png`} alt="Coach Sarah" />
              <span>
                <b>Coach Sarah says</b>
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
              {confirmed ? "ON" : "OFF"}
            </button>
          </div>
          {confirmed && (
            <div className="verified-coach">
              <span>CS</span>
              <p>
                <b>Coach Sarah ✓</b>
                <small>First Place AZ · In-person confirmed</small>
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
        <button className="flow-primary" onClick={() => go("celebration")}>
          Save to My Passport & Continue →
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
        title="Passport Updated"
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
          <span className="sage-badge">Passport Updated</span>
          <div className="celebration-heading">
            <span>
              <h1>Great work, Maya!</h1>
              <p>Your laundry log is now in your Passport.</p>
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
              <h2>Level 2 of 3 · With a prompt</h2>
              <span className="level-pill">●●○ Prompted autonomy</span>
              <p>My Apartment upgraded to Level 2.</p>
              <p>One independent routine earns full mastery.</p>
            </div>
          </section>
          <section className="metric-grid">
            <div>
              <small>Verified Routine</small>
              <b>✓ Wash & Fold Cycle</b>
            </div>
            <div>
              <small>Support Used</small>
              <b>1 Verbal Step Prompt</b>
            </div>
            <div>
              <small>Time Spent</small>
              <b>Self-paced. No timers.</b>
            </div>
          </section>
        </article>
        <section className="celebration-grid">
          <article>
            <span>
              <p className="flow-label">SKILL PASSPORT BALANCE</p>
              <h2>14 Stamps</h2>
            </span>
            <img src={`${A}/6d93e.png`} alt="Laundry stamp preview" />
            <p>+1 permanent laundry stamp</p>
          </article>
          <article className="supporter-note">
            <img src={`${A}/1bb43.png`} alt="Coach Jordan" />
            <span>
              <p className="flow-label">SUPPORTER NOTE</p>
              <h2>Coach Jordan</h2>
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
          View Updated Skill Passport →
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
          <span>STEP 1 OF 4 · MEMORY-ONLY SCAN</span>
          <button onClick={() => speak(pageCopy.scan)}>
            <Icon src={icons.sound} />
            Read aloud
          </button>
        </div>
        <p className="cafe-intro">
          Point your camera at the café screen. We help step by step.
        </p>
        <section className="cafe-viewfinder">
          <img
            src={photo || `${A}/502a5.png`}
            alt="Café self-order touchscreen kiosk"
          />
          <span className="camera-status">● Camera active</span>
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
          <div className="aim-prompt">
            <b>Aim at the order screen</b>
            <span>Keep screen inside the frame</span>
          </div>
        </section>
        <input
          ref={inputRef}
          className="file-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => choosePhoto(event.target.files?.[0])}
        />
        <div className="capture-actions">
          <button className="flow-primary" onClick={() => go("identify")}>
            <Icon src={icons.camera} />
            Capture Photo
          </button>
          <button
            className="flow-secondary"
            onClick={() => inputRef.current?.click()}
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
      </main>
      <nav className="cafe-bottom">
        <button className="flow-primary" onClick={() => go("identify")}>
          Scan Kiosk Screen →
        </button>
      </nav>
    </div>
  )
}
function CafeIdentify({ go }: { go: (page: Page) => void }) {
  const comparison =
    "The categories are across the top. The card reader is below the screen."
  return (
    <div className="flow-screen cafe-flow">
      <FlowTopBar
        title="Object Identification"
        back={() => go("scan")}
        close={() => go("home")}
      />
      <main className="flow-main cafe-main">
        <div className="cafe-landmark">
          <span>● CHECK-FIRST · 96% MATCH</span>
          <button onClick={() => speak(pageCopy.identify)}>
            <Icon src={icons.sound} />
            Read to me
          </button>
        </div>
        <figure className="scan-preview">
          <img src={`${A}/96e44.png`} alt="Scanned café ordering kiosk" />
          <b>✓ Scanned</b>
        </figure>
        <section className="recognition-card">
          <div>
            <h1>I think this is a Café Self-Order Touchscreen Kiosk.</h1>
            <button
              className="icon-audio"
              onClick={() => speak(pageCopy.identify)}
              aria-label="Read recognition aloud"
            >
              <Icon src={icons.sound} />
            </button>
          </div>
          <p>Does this look right to you?</p>
          <span className="level-pill">●●○ With a prompt</span>
          <button className="flow-primary" onClick={() => go("cafesteps")}>
            ✓ Yes, that's right
          </button>
          <button className="flow-secondary" onClick={() => go("scan")}>
            Try again / Retake
          </button>
        </section>
        <section className="comparison-card">
          <p className="flow-label">FAMILIAR MATCH</p>
          <div className="comparison-title">
            <h2>Comparing to your saved setup</h2>
            <span>Campus Café</span>
          </div>
          <article className="same-block">
            <h3>✓ Same as familiar ordering</h3>
            <p>Food and drink categories are across the top.</p>
          </article>
          <article className="different-block">
            <h3>What is different</h3>
            <p>The card reader is below the screen.</p>
          </article>
          <button className="audio-pill" onClick={() => speak(comparison)}>
            <Icon src={icons.sound} />
            Read comparison aloud
          </button>
        </section>
      </main>
      <nav className="cafe-bottom with-note">
        <button className="flow-primary" onClick={() => go("cafesteps")}>
          Start Step-by-Step Guidance →
        </button>
        <small>Take your time. Ask for help anytime.</small>
      </nav>
    </div>
  )
}
function CafeSteps({ go }: { go: (page: Page) => void }) {
  const [paused, setPaused] = useState(false)
  const [hint, setHint] = useState(false)
  return (
    <div className="flow-screen cafe-flow">
      <FlowTopBar
        title="Step Guidance"
        back={() => go("identify")}
        close={() => go("home")}
      />
      <main className="flow-main cafe-main">
        <div className="cafe-landmark">
          <span>● POINT & ASK GUIDANCE · SELF-PACED</span>
          <b>Live AR</b>
        </div>
        <section className="cafe-step-counter">
          <span>
            <b>Step 1 of 3</b>
            <small>Choosing your item</small>
          </span>
          <em>●○○</em>
          <p>Take your time. There is no time limit.</p>
        </section>
        <section className="ar-viewfinder">
          <img src={`${A}/83e74.png`} alt="Close-up of café kiosk menu" />
          <span className="ar-status">● Camera locked on category button</span>
          <div className="target-box">
            <b>Tap “Iced Drinks”</b>
            <span>Iced Drinks & Teas</span>
          </div>
          <small>Screen detects button in view</small>
        </section>
        <section className="cafe-instruction">
          <h1>Tap the Iced Drinks button on the screen.</h1>
          <p>Touch the cold drinks picture in the top row.</p>
          <button
            className="audio-pill"
            onClick={() => speak(pageCopy.cafesteps)}
          >
            <Icon src={icons.sound} />
            Read this step aloud
          </button>
        </section>
        <div className="assist-row">
          <button onClick={() => setHint(!hint)}>Show hint</button>
          <button onClick={() => speak("You can ask Coach Sarah for help.")}>
            Not sure
          </button>
        </div>
        {hint && (
          <p className="hint-card" role="status">
            Look at the first row. Find the cold drink cup.
          </p>
        )}
        <section className="cafe-coach">
          <span className="coach-initial">S</span>
          <span>
            <b>Coach Sarah</b>
            <small>Ready to help you</small>
          </span>
          <button onClick={() => speak("Coach Sarah is ready to help.")}>
            Ask Coach
          </button>
        </section>
      </main>
      {paused && (
        <div className="pause-notice" role="status">
          <b>Guidance paused.</b>
          <span>Continue when ready.</span>
        </div>
      )}
      <nav className="cafe-step-actions">
        <button disabled>← Back</button>
        <button onClick={() => setPaused(!paused)}>
          {paused ? "Continue" : "Pause"}
        </button>
        <button onClick={() => go("cafecomplete")}>Next →</button>
        <button onClick={() => go("scan")}>Ask something else</button>
      </nav>
    </div>
  )
}
function CafeComplete({ go }: { go: (page: Page) => void }) {
  return (
    <div className="flow-screen cafe-flow">
      <FlowTopBar
        title="Step By Step Complete"
        back={() => go("cafesteps")}
        close={() => go("home")}
      />
      <main className="flow-main cafe-main">
        <div className="cafe-landmark">
          <span>TASK COMPLETED · PASSPORT EXPANSION · SAFE STORAGE</span>
          <button onClick={() => speak(pageCopy.cafecomplete)}>
            <Icon src={icons.sound} />
            Read aloud
          </button>
        </div>
        <section className="cafe-done">
          <span className="done-badge">
            ✓<b>DONE</b>
          </span>
          <h1>You did it, Maya!</h1>
          <p>Café order completed at Uptown Coffee.</p>
          <small>Gentle celebration · No flashing animations</small>
        </section>
        <section className="cafe-passport-update">
          <div>
            <h2>Skill Passport Updated</h2>
            <span>Step 2 of 3</span>
          </div>
          <article>
            <Icon src={`${A}/71212.svg`} />
            <span>
              <b>●●○ Level 2: With a prompt</b>
              <p>Great consistency. You ordered independently!</p>
            </span>
          </article>
          <p>
            <b>New location earned:</b> Uptown Coffee.
          </p>
          <p>One more routine earns the On-My-Own stamp.</p>
        </section>
        <section className="kiosk-profile">
          <h2>Kiosk Profile Stored (Text Only)</h2>
          <div>
            <small>Saved details</small>
            <p>Touchscreen kiosk. Categories are along the top.</p>
            <p>The card reader is at the bottom center.</p>
          </div>
          <p>✓ Photo discarded immediately.</p>
          <p>Zero images or personal data stored.</p>
        </section>
      </main>
      <nav className="cafe-bottom dual">
        <button className="flow-primary" onClick={() => go("passport")}>
          View Updated Skill Passport →
        </button>
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
      "You did 3 routines with just a prompt.",
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
          label="MONTHLY SUMMARY · NOVEMBER 2024"
          copy={pageCopy.summary}
        />
        <header className="summary-intro">
          <h1>My November Progress</h1>
          <p>Created from your verified logs.</p>
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
              <small>Passport stamps</small>
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
                    With a prompt
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
          label="SUMMARY EDITOR · PER-LINE EDITING"
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
            <span className="line-tag">AI DRAFT</span>
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
            <span className="line-tag active">CURRENTLY EDITING</span>
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
            <span className="line-tag edited">EDITED BY YOU</span>
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
        ? "Coach Sarah"
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
          label="PRIVATE SHARING · RECIPIENT CONTROL"
          copy={pageCopy["summary-sharing"]}
        />
        <header className="summary-intro">
          <h1>Share My November Summary</h1>
          <p>Sharing is turned off by default.</p>
          <p>You choose who gets a private link.</p>
        </header>
        <aside className="sharing-off" role="status">
          <b>Sharing is Currently OFF</b>
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
                <b>Coach Sarah</b>
                <small>First Place Staff Coach</small>
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
                On my own
              </span>
            </article>
            <article>
              <b>No personal photos or passwords</b>
              <p>Your private notes stay safely on your device.</p>
            </article>
            <article>
              <b>Read-only view</b>
              <p>Nobody can edit or change your passport.</p>
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
  const [revoked, setRevoked] = useState<"Coach Jordan" | "Elena Lin" | null>(
    "Coach Jordan",
  )
  const undoRevocation = () => {
    if (revoked === "Elena Lin") setMomActive(true)
    setRevoked(null)
  }
  return (
    <div className="flow-screen summary-flow">
      <FlowTopBar
        title="Active Shares Revocation"
        back={() => go("summary-sharing")}
        close={() => go("home")}
      />
      <main className="summary-main">
        <SummaryLandmark
          label="SHARED LINKS · ACCESS MANAGEMENT"
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
            <p>Access was revoked instantly.</p>
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
            <li>Your on-device passport and logs are untouched.</li>
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
          label="MY PEOPLE · TRUSTED CIRCLE"
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
              CUP
            </span>
            <span>
              <small>REWARD GOAL</small>
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
              <span aria-hidden="true">CHEER</span>
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
                alt="Coach Sarah"
              />
              <span>
                <h3>Coach Sarah</h3>
                <p>First Place Staff Coach</p>
                <small>Active link · On standby</small>
              </span>
              <button
                className="flow5-menu"
                aria-label="Manage Coach Sarah's connection"
                onClick={() => speak("Coach Sarah is on standby.")}
              >
                <Flow5Asset group="hub" file="fdfad.svg" />
              </button>
            </header>
            <p className="supporter-note">
              <Flow5Asset group="hub" file="180d9.svg" />
              Standing by for handoffs and check-ins.
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
                onClick={() => speak("Coach Sarah's supporter link is active.")}
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
            <p>Coach or staff can tap in person.</p>
            <p>They confirm a routine you did together.</p>
          </span>
          <button onClick={() => go("confirmer")}>
            Open Confirmer Tap
            <Flow5Asset group="hub" file="d0c19.svg" />
          </button>
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
            Return to Skill Passport
          </button>
        </div>
      </main>
    </div>
  )
}
const relationshipOptions = [
  ["Family / Parent", "d27a5.svg"],
  ["Coach / Staff", "006e9.svg"],
  ["Friend / Peer", "e8a6d.svg"],
  ["Job Coach", "a8d91.svg"],
] as const
function AddSupporter({ go }: { go: (page: Page) => void }) {
  const [name, setName] = useState("Jordan Davis")
  const [relationship, setRelationship] = useState("Coach / Staff")
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
          label="STEP 2 · SUPPORTER LINK"
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
                  {label === "Coach / Staff" && (
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
          label="CHEER RECEIVED"
          action="Read Aloud"
          copy={pageCopy["cheer-detail"]}
        />
        <header className="flow5-intro">
          <h1>Cheer from Coach Jordan</h1>
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
                Coach Jordan <small>Staff Coach</small>
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
            <h2>You control your Passport</h2>
            <span>{visible ? "Visible on Stamp" : "Hidden from Stamp"}</span>
          </header>
          <p>You decide what stays on your record.</p>
          <p>You can change this anytime.</p>
          <button onClick={() => setVisible(!visible)}>
            <Flow5ButtonIcon group="cheer" file="b8eab.svg" />
            {visible
              ? "Hide this cheer from my Passport"
              : "Show this cheer on my Passport"}
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
            Done · Keep on Passport
          </button>
          <button onClick={() => go("supporters")}>Return to My People</button>
        </div>
      </main>
    </div>
  )
}
const confirmers = [
  ["Coach Sarah", "First Place Staff"],
  ["Coach Jordan", "Independent Living Coach"],
  ["Other staff member", "Tap to enter name"],
] as const
function ConfirmerTap({ go }: { go: (page: Page) => void }) {
  const [confirmer, setConfirmer] = useState("Coach Sarah")
  const [otherName, setOtherName] = useState("")
  const [physicallyConfirmed, setPhysicallyConfirmed] = useState(false)
  const confirmerName =
    confirmer === "Other staff member" ? otherName || "Other staff" : confirmer
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
          label="IN-PERSON VERIFICATION"
          action="Listen"
          copy={pageCopy.confirmer}
          darkAction
        />
        <header className="flow5-intro">
          <h1>In-Person Staff Confirmation</h1>
          <p>Hand phone to your coach.</p>
          <p>They tap to verify you did this together.</p>
        </header>
        <section className="handover-card">
          <span className="flow5-round-icon">
            <Flow5Asset group="confirm" file="83a82.svg" />
          </span>
          <p>
            <b>Please hand phone to your coach.</b>
            Staff confirmation records physical presence with Maya.
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
              With a prompt
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
          {confirmer === "Other staff member" && (
            <input
              value={otherName}
              onChange={(event) => {
                setOtherName(event.target.value)
                setPhysicallyConfirmed(false)
              }}
              placeholder="Enter staff member’s name"
              aria-label="Other staff member's name"
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
            disabled={confirmer === "Other staff member" && !otherName.trim()}
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
    "COMPANION - OFFICIAL SKILL PASSPORT",
    "Maya Lin - Member ID FP-2024-884",
    "Issued by First Place AZ - November 2024",
    "14 verified stamps - 4 life domains - 100% mastery",
    ...(includeStamps
      ? [
          "Household: Washing Machine Laundry - Level 3",
          "Nutrition: Stovetop Warm Meal and Pasta - Level 3",
          "Mobility: Light Rail Public Transit - Level 3",
          "Commerce: Grocery Store and Touchscreen Kiosk - Level 3",
        ]
      : []),
    ...(includeSignature
      ? ["Verified by Coach Sarah Martinez, Staff Lead"]
      : []),
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
  member: { name: "Maya Lin", id: "FP-2024-884" },
  logs: 18,
  stamps: 14,
  applianceProfiles: ["Uptown Coffee Kiosk", "First Place Washer"],
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
    domain: "HOUSEHOLD",
    title: "Washing Machine Laundry",
    copy: "Validated across 3 separate home laundry setups.",
    icon: "9476d.svg",
  },
  {
    domain: "NUTRITION",
    title: "Stovetop Warm Meal & Pasta",
    copy: "Safely completed burner controls and drainage.",
    icon: "6761f.svg",
  },
  {
    domain: "MOBILITY",
    title: "Light Rail Public Transit",
    copy: "Boarding, card tap, and destination transfer.",
    icon: "10d95.svg",
  },
  {
    domain: "COMMERCE",
    title: "Grocery Store & Touchscreen Kiosk",
    copy: "Self-scan checkout, bagging, and receipt checks.",
    icon: "9e7fd.svg",
  },
]
function CredentialPreview({ go }: { go: (page: Page) => void }) {
  const [shareStatus, setShareStatus] = useState("")
  const shareCredential = async () => {
    const shareData = {
      title: "Maya Lin’s Official Skill Passport",
      text: "View Maya Lin’s verified Companion credential.",
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setShareStatus("Credential sharing opened.")
        return
      } catch {
        setShareStatus("Sharing was canceled. Your credential stayed private.")
        return
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
      setShareStatus("Credential link copied.")
    } else {
      setShareStatus("Sharing is not available on this device.")
    }
  }
  return (
    <div className="flow-screen flow6-screen">
      <Flow6TopBar
        group="credential"
        title="Official Credential"
        back={() => go("passport")}
        close={() => go("home")}
      />
      <main className="flow6-main">
        <Flow6Landmark
          group="credential"
          icon="43bc6.svg"
          label="PRINTABLE PASSPORT · OFFICIAL CREDENTIAL · PDF EXPORT"
          copy={pageCopy.credential}
        />
        <header className="flow6-intro">
          <h1>Official Skill Passport</h1>
          <p>A verifiable summary of independent living routines.</p>
          <p>Earned by Maya Lin.</p>
        </header>
        <article className="credential-certificate">
          <header>
            <span className="credential-crest">
              <Flow6Asset group="credential" file="7a70b.svg" />
            </span>
            <span>
              <small>COMPANION · CREDENTIAL</small>
              <b>Independent Living Passport</b>
            </span>
            <strong>
              <Flow6Asset group="credential" file="463eb.svg" />
              VERIFIED
            </strong>
          </header>
          <section className="candidate-record">
            <small>Candidate Record</small>
            <h2>
              Maya Lin <span>Age 24</span>
            </h2>
            <p>
              Member ID: <b>#FP-2024-884</b>
            </p>
            <div className="credential-qr">
              <span>
                <Flow6Asset group="credential" file="45fcc.svg" />
              </span>
              <b>SCAN TO VERIFY</b>
              <small>Offline verification</small>
            </div>
          </section>
          <dl className="credential-meta">
            <div>
              <dt>Issuing Partner</dt>
              <dd>First Place AZ</dd>
              <dd>Transition Academy</dd>
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
              <small>Verified Stamps</small>
            </span>
            <span>
              <b>4</b>
              <small>Life Domains</small>
            </span>
            <span>
              <b>100%</b>
              <small>Mastery Rate</small>
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
                    <i /> Level 3 · On My Own
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
              <small>ATTESTATION</small>
              <b>Coach Sarah Martinez</b>
              <p>Staff Lead, First Place Transition Academy</p>
            </span>
            <strong>
              <Flow6Asset group="credential" file="4caf8.svg" />
              PASSPORT VERIFIED
            </strong>
          </footer>
        </article>
        <aside className="flow6-info">
          <Flow6Asset group="credential" file="be6ad.svg" />
          <p>
            <b>Data Sovereignty & Offline Portability</b>
            Survives device changes and network loss. Printable on standard
            paper or savable as a signed PDF.
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
            Print or Export PDF
          </button>
          <button onClick={shareCredential}>
            <Flow6Asset group="credential" file="85349.svg" />
            Share Credential Link
          </button>
        </div>
      </main>
    </div>
  )
}
const exportDestinations = [
  {
    id: "pdf",
    title: "Save as PDF Document",
    copy: "Saves to your phone’s Files. Works offline forever.",
    icon: "e2ac1.svg",
  },
  {
    id: "print",
    title: "Send to AirPrint / Network Printer",
    copy: "Print a paper copy for your binder or coach.",
    icon: "1162c.svg",
  },
  {
    id: "email",
    title: "Send via Email to Support Team",
    copy: "Attach the PDF to an email for your support team.",
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
        "mailto:?subject=Maya%20Lin%20Official%20Skill%20Passport&body=The%20credential%20PDF%20was%20saved%20to%20your%20device.%20Attach%20it%20to%20this%20email."
      setStatus("The PDF was saved. Attach it to your email.")
    } else {
      setStatus("Official credential PDF saved.")
    }
  }
  return (
    <div className="flow-screen flow6-screen">
      <Flow6TopBar
        group="export"
        title="Print & PDF Export"
        back={() => go("credential")}
        close={() => go("home")}
      />
      <main className="flow6-main">
        <Flow6Landmark
          group="export"
          label="DOCUMENT SETUP · PRINT & PDF"
          copy={pageCopy["credential-export"]}
        />
        <header className="flow6-intro">
          <h1>Print or Save as PDF</h1>
          <p>Choose how to save your official credential.</p>
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
            <b>Verified Completion Certificate</b>
            <strong>Independent Living Credential</strong>
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
              ["Include 14 earned stamp badges", "Shows your mastery icons"],
              [
                "Include coach confirmation signatures",
                "Includes mentor approval",
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
            Generate PDF Now
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
          label="LOCAL-FIRST STORAGE · BACKUP & RECOVERY"
          copy={pageCopy["data-backup"]}
        />
        <header className="flow6-intro">
          <h1>Backup Your Passport</h1>
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
              alt="A portable digital passport on a desk"
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
          label="DATA OWNERSHIP · PER-ITEM MANAGEMENT"
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
                Export CSV
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
                    ? "Uptown Coffee Kiosk & First Place Washer."
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
                    : "The shared link is revoked."}
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
                Revoke Link
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
          <p>Earned PDF credentials remain safe and valid.</p>
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
            Return to Passport
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
function SafetyBlock({ go }: { go: (page: Page) => void }) {
  const copy = pageCopy["safety-block"]
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
            <b>SAFETY GUARDRAIL</b>
            <small>Automatic safety rule active</small>
          </span>
          <button
            onClick={() => speak(copy)}
            aria-label="Listen to safety message"
          >
            <Flow7Asset group="block" file="5d5a8.svg" />
          </button>
        </section>
        <header className="flow7-intro">
          <h1>Stovetop Burner Detected</h1>
          <p>
            We do not guide stoves or heaters for your safety. A coach can help
            you in person.
          </p>
        </header>
        <figure className="flow7-hero safety-photo">
          <Flow7Asset
            group="block"
            file="65988.png"
            alt="Electric coil stovetop detected by the camera"
          />
          <figcaption className="blocked-badge">
            <Flow7Asset group="block" file="d132b.svg" />
            SAFETY BLOCKED TOPIC (R14.5)
          </figcaption>
          <span className="detection-card">
            <span className="flow7-round-icon">
              <Flow7Asset group="block" file="5d004.svg" />
            </span>
            <span>
              <b>Object: Electric Coil Stovetop</b>
              <small>Hazard: High heat & burn risk</small>
            </span>
          </span>
        </figure>
        <aside className="flow7-info">
          <Flow7Asset group="block" file="6e52b.svg" />
          <p>
            Stoves, ovens, heaters, and medication need a support person
            present. This rule keeps you safe.
          </p>
          <b>
            <i /> Coach Sarah is on standby at First Place
          </b>
        </aside>
        <Flow7Actions>
          <button
            className="flow7-primary"
            onClick={() => go("photo-confirmation")}
          >
            Request Coach Handoff
            <Flow7Asset group="block" file="d3302.svg" />
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
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(null)
    setConsent(false)
    go("coach-standby")
  }
  return (
    <div className="flow-screen flow7-screen">
      <Flow7TopBar
        group="consent"
        title="Sensory & Regulation Needs"
        copy={pageCopy["photo-confirmation"]}
        back={() => go("safety-block")}
        close={cancel}
      />
      <main className="flow7-main">
        <div className="flow7-progress">
          <span>
            <i /> STAFF HANDOFF · STEP 2 OF 2
          </span>
          <b>Photo Check</b>
        </div>
        <header className="flow7-intro">
          <h1>Share Photo with Coach Sarah?</h1>
          <p>
            Check your photo before sending. Coach Sarah will see what you see.
          </p>
        </header>
        <section className="photo-check-card">
          <div className="photo-check-preview">
            <img
              src={photo || `${A}/flow7-consent/ea664.png`}
              alt="Photo of the detected electric stovetop"
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
                "No faces or personal items detected",
                "Verified clean frame (R28.6)",
              ],
              [
                "Photo is sent only to Coach Sarah",
                "Encrypted direct staff handoff",
              ],
              [
                "Photo is erased immediately after help",
                "Never stored permanently (R28.2)",
              ],
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
            <b>MESSAGE PREVIEW</b>
            <span>Local preview</span>
          </header>
          <div className="coach-recipient">
            <Flow7Asset
              group="consent"
              file="624b9.png"
              alt="Coach Sarah Martinez"
            />
            <span>
              <b>Coach Sarah Martinez</b>
              <small>First Place Staff Lead · On Site Now</small>
            </span>
          </div>
          <blockquote>
            <b>System Message:</b>
            “Maya needs in-person help with the stovetop burner at Transition
            Kitchen.”
          </blockquote>
          <p className="resident-note">
            <Flow7Asset group="consent" file="5e7a5.svg" />
            <span>
              <b>Your note:</b> “I want to warm up pasta safely.”
            </span>
          </p>
          <p className="static-eta">
            <Flow7Asset group="consent" file="7f536.svg" />
            Estimated arrival: within 3 minutes
          </p>
        </section>
        <label className="consent-control">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            <b>I choose to share this photo with Coach Sarah.</b>
            <small>
              The photo stays local until I confirm. I can cancel instead.
            </small>
          </span>
        </label>
        <Flow7Actions>
          <button className="flow7-primary" disabled={!consent} onClick={send}>
            Confirm & Send to Coach Sarah
            <Flow7Asset group="consent" file="2ac9b.svg" />
          </button>
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
  return (
    <div className="flow-screen flow7-screen">
      <Flow7TopBar
        group="standby"
        title="Staff Verification & Confirmation"
        copy={pageCopy["coach-standby"]}
        back={() => go("photo-confirmation")}
        close={() => go("home")}
      />
      <main className="flow7-main">
        <div className="flow7-live">
          <span>
            <i /> LIVE SUPPORT · COACH NOTIFIED
          </span>
          <button onClick={() => speak(pageCopy["coach-standby"])}>
            <Flow7Asset group="standby" file="dc99e.svg" /> Listen
          </button>
        </div>
        <header className="flow7-intro">
          <h1>Coach Sarah Is On Her Way</h1>
          <p>
            Sarah received your photo. Take a seat and relax while you wait.
          </p>
        </header>
        <section className="coach-status-card">
          <header>
            <span className="coach-photo">
              <Flow7Asset group="standby" file="4d7d4.png" alt="Coach Sarah" />
              <i />
            </span>
            <span>
              <h2>Coach Sarah</h2>
              <b className="active-pill">
                <i /> Active · Arriving in ~2 min
              </b>
              <strong>First Place Staff Coach</strong>
              <small>
                <Flow7Asset group="standby" file="1dc61.svg" />
                Currently at First Place 3rd Floor Hub
              </small>
            </span>
          </header>
          <blockquote>
            <Flow7Asset group="standby" file="48b70.svg" />
            <span>
              <b>Sarah wrote just now:</b>
              “Hi Maya! I see your stove photo. Don’t touch the dials yet, I’m
              walking over right now!”
            </span>
          </blockquote>
          <p className="route-status">
            <b>Support Request Status</b>
            <span>
              <i />
              <i />
              <i /> Assigned & En Route
            </span>
          </p>
        </section>
        <a
          className="flow7-call"
          href="tel:"
          onClick={() => setCallStatus("Opening your phone call controls.")}
        >
          <Flow7Asset group="standby" file="5d6dd.svg" />
          Call Coach Sarah Martinez
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
          <button
            className="flow7-primary"
            onClick={() => go("safe-alternatives")}
          >
            View Safe Stovetop Alternatives
            <Flow7Asset group="standby" file="d3302.svg" />
          </button>
          <button onClick={() => go("home")}>
            <Flow7Asset group="standby" file="fb28f.svg" />
            Cancel Staff Call (I’m okay now)
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
    level: "●●● On my own",
    copy: "Press 1 minute. Safe door latch with zero open flame.",
    action: "Open Microwave Guide",
    icon: "8262e.svg",
    response:
      "Microwave guide opened. Use a microwave-safe dish. Press one minute, then check whether the food is warm.",
  },
  {
    title: "Electric Kettle",
    subtitle: "Warm Water Routine",
    level: "●●○ With a prompt",
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
              <Flow7Asset group="alternatives" file="b57b7.svg" /> SAFE
              ALTERNATIVES · ZERO PRESSURE
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
              Earns Confirmer Tap stamp
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
            as confirmed when you do it together with your coach.
          </p>
        </aside>
        <Flow7Actions>
          <button className="flow7-primary" onClick={() => go("home")}>
            Done · Return to Home
            <Flow7Asset group="alternatives" file="2ac9b.svg" />
          </button>
          <button onClick={() => go("coach-standby")}>
            <Flow7Asset group="alternatives" file="28fb6.svg" />
            Back to Coach Sarah Chat
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
        <strong>Skills Passport</strong>
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
  const [listening, setListening] = useState(true)
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0
  const review = () => {
    const text = draft.toLowerCase()
    const hazardous = hazardousVoiceTopics.some((topic) => text.includes(topic))
    if (hazardous) {
      go("safety-block")
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
          label="VOICE & TEXT · FREE-FORM LOGGING"
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
            onClick={() => setListening((value) => !value)}
            aria-pressed={listening}
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
              <b>{draft ? "Clear speech detected" : "Waiting for words"}</b>
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
            <b>Private on-device voice processing</b>
            Audio recordings are never saved or sent to any server. Your words
            stay on your phone.
          </p>
        </aside>
        <Flow8Buttons>
          <button
            className="flow8-primary"
            onClick={review}
            disabled={!draft.trim()}
          >
            Find My Skill & Review
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
  const transcript = draft || defaultVoiceDraft
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
          label="AI SKILL MAPPING · AUTO MATCH"
          copy={pageCopy["skill-mapping"]}
        />
        <header className="flow8-intro">
          <h1>Here Is What We Found</h1>
          <p>
            We mapped your words to an independent routine in your passport.
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
            <span>MOBILITY · COMMUNITY TRANSIT</span>
            <b>
              <i />
              96% Verified Match
            </b>
          </header>
          <div className="matched-title">
            <span>
              <Flow8Asset group="mapping" file="28637.svg" />
            </span>
            <div>
              <h2>Light Rail Public Transit</h2>
              <p>
                <Flow8Asset group="mapping" file="48aa6.svg" />
                Central Station → 8th Street
              </p>
            </div>
          </div>
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
        </section>
        <section className="detected-level">
          <h2>
            <Flow8Asset group="mapping" file="2ee68.svg" />
            Level 3 Detected: On My Own
          </h2>
          <div>
            <b>Help Level:</b>
            <span>
              <i />
              <i />
              <i /> On my own
            </span>
          </div>
          <p>
            You stated <b>“all by myself.”</b> We automatically logged full
            independence with no extra questions needed.
          </p>
        </section>
        <aside className="reward-preview">
          <span className="coffee-symbol" aria-hidden="true">
            ☕
          </span>
          <p>
            <b>STAMP GOAL PROGRESS</b>
            <strong>This log earns your 15th stamp!</strong>
            You will unlock your Coffee with Jordan reward goal.
          </p>
        </aside>
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
            Confirm & Log to Passport
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
  ["With help", 1],
  ["With a prompt", 2],
  ["On my own", 3],
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
          label="CLARIFICATION · ONE SIMPLE QUESTION"
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
  return (
    <div className="flow-screen flow8-screen confirmed-screen">
      <Flow8TopBar
        group="confirmed"
        title="Skills Passport"
        copy={pageCopy["voice-confirmed"]}
        home
      />
      <main className="flow8-main">
        <Flow8Landmark
          group="confirmed"
          icon="fe87c.svg"
          label="VOICE LOG SAVED · REWARD UNLOCKED"
          copy={pageCopy["voice-confirmed"]}
        />
        {saved ? (
          <>
            <section className="stamp-milestone">
              <span className="milestone-crest">
                <Flow8Asset group="confirmed" file="47883.svg" />
              </span>
              <div>
                <small>Stamp 15 of 15</small>
                <h1>🎉 15th Stamp Earned!</h1>
                <p>Your voice log was added to your official Skill Passport.</p>
              </div>
              <footer>
                <span>
                  <b>Passport Milestone</b>
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
                  <h2>REWARD UNLOCKED: Coffee with Jordan!</h2>
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
            <section className="saved-entry">
              <header>
                <b>SAVED ENTRY DETAILS</b>
                <span>
                  <Flow8Asset group="confirmed" file="4f6b0.svg" />
                  Verified Log
                </span>
              </header>
              <div className="saved-skill">
                <span>
                  <Flow8Asset group="confirmed" file="053ac.svg" />
                </span>
                <p>
                  <b>Light Rail Public Transit</b>
                  <small>Central Station to 8th Street</small>
                </p>
              </div>
              <div className="saved-level">
                <span>Skill Level:</span>
                <b>
                  <i />
                  <i />
                  <i />
                  On my own
                </b>
              </div>
              <p>
                <Flow8Asset group="confirmed" file="ca64c.svg" />
                Logged by Voice · Verified in Memory
              </p>
              <p>
                <Flow8Asset group="confirmed" file="63a43.svg" />
                Today at 3:30 PM
              </p>
              <aside>
                <Flow8Asset group="confirmed" file="fb8be.svg" />
                Self-reported log counts toward all passport rules.
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
              <p>Added to your passport just now. You can undo this action.</p>
              <button onClick={() => setSaved(false)}>
                <Flow8Asset group="confirmed" file="1cc3e.svg" />
                Undo Log
              </button>
            </aside>
          </>
        ) : (
          <section className="voice-log-removed" role="status">
            <h1>Voice log removed</h1>
            <p>Your passport and stamp total were restored.</p>
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
            View in Skill Passport
          </button>
        </Flow8Buttons>
      </main>
      <nav className="flow8-bottom-nav" aria-label="Passport navigation">
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
            <p>Job Coach · Available now</p>
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
          <span className="person-initial">M</span>
          <span>
            <h2>Coach Marcus</h2>
            <p>Skills Coach · Until 4:00 PM</p>
          </span>
          <button onClick={() => speak("Message sent to Coach Marcus.")}>
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
      <section className="privacy-card">
        <span className="shield">✓</span>
        <span>
          <h2>Your network is private</h2>
          <p>Only people you approve can connect with you here.</p>
        </span>
      </section>
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
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  return (
    <div className="app-shell">
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
