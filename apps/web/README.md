# Companion

**Help with anything new, anywhere, and proof of what you can do.**

Companion is a calm, plain-language app that helps autistic adults and people with intellectual or developmental disabilities (IDD) do everyday tasks with confidence. Point your camera at something unfamiliar and get short, step-by-step help. Practice skills and see your progress. Share wins with the people who support you.

Built by Team Spectrum & Waves, with feedback from First Place AZ and our advisor.

> **Status: prototype.** Companion is a working, installable web app. Point & Ask, voice and text logging, and read aloud use real AI through our AWS backend (see the [main README](../../README.md)); some screens, like stamp totals and My People, still show sample data. There is no account system yet.

---

## Why we built it

Our visit to First Place showed us two gaps.

1. **Skills are hard to track.** There is no simple record of what someone can do and how much help they needed.
2. **Skills do not always travel.** In the teaching kitchen, the stove is the exact same model as the one in the apartment. That helps. But after someone moves, the washer is different, the stove is gas instead of electric, or the buttons are a touchscreen. A skill learned in one place is hard to use in another.

Companion answers both. **Point & Ask** helps in the moment when something is new. **My Skills** keeps a record that belongs to the person and goes with them.

## Who it is for

Maya is our example user. She might live in a residential program, with family, or on her own with occasional support. No feature assumes a staff member or a particular provider is around. Programs like First Place can be a partner, but they are not the frame of the app.

The people around her matter too. Supporters can be a parent, a coach, a therapist, a support coordinator, or a friend. They cheer her on. Maya stays in control.

---

## What exists today

### Point & Ask
- Open the camera or upload a photo, then choose what you want to do
- Walk-through example: a café self-order kiosk (scan, "Does this look right?", one step at a time, "You did it")
- Short sentences, 12 words or fewer
- **Safety block:** stoves, heaters, and medication are never guided. The app suggests asking a support person and offers safer alternatives.
- Photos stay in memory only and are never saved

### My Skills
- Today's practice, with step-by-step guidance you can pause and resume (example: washing machine laundry)
- Log how it went with three levels of help (**With someone**, **With AI help**, **By myself**), and a celebration when you finish
- Voice or text logging that matches what you did to your skills
- Monthly summary you can edit and share privately with links you control
- My Skills record, with print / save as PDF
- Data backup and per-item storage control, so your data stays on your device

### My People
- Add trusted supporters (family, coaches, friends) with private links. No accounts needed.
- Receive cheers and work toward rewards you choose (for example, "Coffee with Jordan")
- In-person confirmation: a supporter can confirm a task you did together

### App experience
- **Installable PWA:** add it to your home screen on phone or desktop
- **Works offline:** all screens, images, and fonts are cached
- **Calm updates:** a "new version is ready" banner. It never reloads on its own.
- **Responsive navigation:** bottom tab bar on phones, side panel on screens 1024px and wider
- **Read to me** on every screen

---

## How Companion is different

Good tools already exist for executive functioning, task sequencing, habit tracking, and independent-living skills. Companion is not trying to replace them. It puts three things together that we have not seen in one place:

- **Help right now, with no setup.** Point at something new and get help, even if you have never used the app before.
- **Practice in your own places.** Steps can show your washer or your stove, with a photo or video you record.
- **A record you own.** It shows what you can do, how much help you used, and where. It goes with you when you change providers or homes.

---

## Design principles

These came directly from First Place and our advisor.

**Plain language**
- Write at an 8th-grade reading level or lower, in short, direct sentences.
- Offer a choice of plain or more detailed wording, so each person gets the level that fits.
- No therapy words. "With a prompt" becomes "With AI help". "Mastered" becomes "Learned" or "By myself".

**Levels of help, never failure**
- Every level counts as progress: **With someone**, **With AI help**, and **By myself**.
- Doing it with AI guidance is shown as different from doing it by yourself.
- No "failed", "incomplete", or "not yet" anywhere.

**Rewarding for the person, not only the people supporting them**
- Connect small skills to personal goals, like "cook a meal I love" or "live in my own place".
- After a skill, show what it makes possible: "Now you can have friends over for dinner."
- Cheers, stamps, and rewards the user chooses. No timers, no streaks that punish a missed day.

**The user stays in control**
- Supporters can suggest or confirm a log entry, but the user approves it.
- Supporters can only send reminders if the user allows it. The user can mute anyone. Cheers are always welcome.
- Nobody nags. A reminder that feels like pressure makes people delete the app.

**Honest about what it does not know**
- When Companion cannot tell what something is, it says so: "I'm not sure. Try another photo or ask someone you trust."
- It never guesses on safety items.

**Accessibility rules (from DESIGN.md)**
- No all-caps text. Text is at least 16px, body text at least 18px, and line height at least 1.5x.
- No flashing or fast motion. Animations start only when you tap, and respect reduced motion.
- One focus per screen, tap targets at least 56px, and plain sentences.

---

## Coming next (roadmap)

Based on feedback from First Place and our advisor. Our advisor suggested one initial focus, so we are building Point & Ask first and the My Skills depth after.

### First: Point & Ask for everyone
1. **No setup needed.** Point & Ask works without My Skills or sign-up, so it helps people living with family or with occasional support. After a task, an optional "Save this to My Skills".
2. **Knowing when it does not know.** An "I'm not sure" screen with: take another photo, describe it, or ask someone you trust.
3. **Plain language pass.** Every screen, at an 8th-grade level or lower.
4. **Learn your way.** Pictures, read aloud, shorter steps, or more detail. Each person chooses how they like help.

### Next: lighter logging and clearer levels
5. **Clearer levels of help.** The app now uses three: With someone, With AI help, and By myself. Next, we are checking with users that the names and order feel natural.
6. **Light-touch logging.** One tap to log after a guided task. Supporters can suggest or confirm entries, and the user approves.
7. **Your own photos and videos.** Steps show *your* washer or stove, placed above the instruction. Video helps people remember and practice better than a photo. One skill can cover more than one place, like the teaching kitchen and your apartment. A "Watch me do it" video can be shared with your people.

### Then: goals, meaning, and a record that travels
8. **Personal goals at setup.** Pick what matters to you. Companion links small skills to those goals.
9. **What this makes possible.** After each skill, show how it connects to the life you want: hosting friends, cooking a meal you love, living in your own place.
10. **Progress across places.** Each skill shows times done, level of help, places practiced, and whether it was logged by you or confirmed together. Doing something once is different from doing it in many places.
11. **Your record goes with you.** A clear "Take My Skills with me" option for when you change providers or homes.

### Later: real AI guidance
12. **Connect a vision AI model** for Point & Ask.
13. **Measure how often the steps are right** on real appliances and kiosks. We want to report a success rate, not just a demo.

---

## Questions we are still testing

- Are the three levels of help, and their order, obvious to the people using them?
- Can supporter reminders help without becoming nagging?
- How should My Skills tell the difference between doing a task once and doing it in different places?
- How can people with different reading levels each get wording that fits?

---

## Run it locally

Requirements: Node 22 or newer, **git-lfs** (the repo stores images and fonts in Git LFS), and pnpm 10.

```bash
git lfs install
git clone https://github.com/skbosire-art/Companion.git
cd Companion
corepack pnpm@10.34.3 install
corepack pnpm@10.34.3 run dev        # http://localhost:8443 by default
corepack pnpm@10.34.3 run build      # production build, including the offline service worker
```

If you cloned before installing git-lfs, images and fonts will be small placeholder files. Run `git lfs pull` inside the folder to download the real ones.

The service worker only runs in production builds. To test install and offline behavior, run `corepack pnpm@10.34.3 exec vite preview` after a build.

## Tech stack

Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · vite-plugin-pwa (Workbox) · Public Sans and Nova Square (self-hosted, OFL)

## Working with Figma Make

This repo is connected to a Figma Make file.
- Make pulls from `main` and pushes its edits to a `figma/…` branch.
- To bring Make edits in, merge that branch into `main`, then pull `main` again in Make before editing further.
- Keep `.figma/make/` and the Figma plugins in `vite.config.ts` intact so the sync keeps working.

## Thanks

To First Place AZ for the tour, the time, and honest feedback, and to our advisor Josh for pushing us to ask what makes this worth coming back to.
