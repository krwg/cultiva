# Cultiva Progress

**История сада · A quiet history of the garden**  
*From the first static page to Linden · then Rowan*  
*Март–июль 2026*

Это не changelog и не список тикетов.  
Это рассказ — по-человечески — о том, откуда вырос Cultiva, почему он выглядит так, как выглядит, и чем запомнился каждый сезон. Написано так, чтобы было понятно и тому, кто только что скачал приложение впервые, а не только автору, который помнит каждый коммит.

Английский и русский в одном файле: можно читать целиком или выбрать свой язык.

| | |
|:--|:--|
| **Latest** | [**2.3.3 Rowan**](https://github.com/krwg/cultiva/releases/tag/2.3.3) · PE2 tray merge · Radio 2.5 |
| **In short** | Offline-first habit garden · no telemetry · habits you can *see* grow |
| **License** | GPL-3.0 · by [krwg](https://github.com/krwg) |

---

<details>
<summary><strong>Contents · Содержание</strong></summary>

**English** — [How it began](#how-it-began--not-a-changelog) · [Timeline](#timeline-at-a-glance) · [Before Maple](#before-maple--march-2026) · [Maple](#maple--01--the-seed-in-the-browser) · [Aspen](#aspen--02--roots-accounts-and-the-first-desktop) · [Sequoia](#sequoia--03--the-foundation-and-the-fork-in-the-road) · [Coconut](#coconut--04--one-repo-one-desktop-garden) · [Cypress](#cypress--11--when-the-app-started-to-feel-like-home) · [Linden](#linden--17--every-platform-every-evening) · [Rowan](#rowan--20-and-the-patches--graphite-and-care) · [What never left](#what-never-left)

**Русский** — [С чего всё началось](#с-чего-всё-началось--не-changelog) · [Лента](#лента-времени) · [До Клёна](#до-клёна--март-2026) · [Клён](#клён--maple-01--семя-в-браузере) · [Осина](#осина--aspen-02--корни-аккаунты-и-первый-десктоп) · [Секвойя](#секвойя--sequoia-03--фундамент-и-развилка) · [Кокос](#кокос--coconut-04--один-репозиторий-один-десктопный-сад) · [Кипарис](#кипарис--cypress-11--когда-приложение-стало-похожим-на-дом) · [Липа](#липа--linden-17--каждая-платформа-каждый-вечер) · [Рябина](#рябина--rowan-20-и-патчи--графит-и-забота) · [Что не ушло](#что-не-ушло)

</details>

---

# English

## How it began — not a changelog

Hello to anyone who opened this file.

If you just installed Cultiva, you may only see a quiet window with a garden of habits. This page is the story behind that window — where it came from, why it looks this way, and what each season changed for ordinary evenings, not for developers’ checklists.

### Why write a habit tracker at all

One day there was an ad for a habit tracker. Clean design, pleasant interface — downloaded without thinking. It turned out to be paid. Then came more apps — five or eight; the exact number no longer matters. Each one asked for a compromise: a hard limit on habits, a design you could not change, thin features, or a subscription waiting behind the next screen.

At some point it became simpler to build something of one’s own than to keep living inside other people’s limits.

That is how the first Cultiva appeared. Its author has used it every day since the beginning. That daily use is what keeps the work going — not an abstract audience, but a living personal tool that still feels worth making better.

### How the idea shifted

At first the **center of everything was meant to be a website**. The desktop build was planned as a companion. In practice, maintaining two products alone was heavy, and a real web product would only have matured around a 1.0 release.

Desktop was different. You could download it, install it, and use it *now* — without waiting for a perfect site.

### What changed at Sequoia — and after

An important structural decision landed in that season:

The **web version was set on a path to the archive**. Old web files would leave. The **CultivaDesktop** repository would move here — into **krwg/Cultiva** — as the single home for the project. No more splitting the garden across repos.

Everything in one place. Here.

### What Cultiva is today

Cultiva is an **offline-first desktop habit tracker**. You install it (or run the portable `.exe`), plant habits, and watch them grow through visual stages until a year-old habit becomes a **Legacy** tree in the Trophy Garden.

“Offline-first” simply means: your garden lives on *your* computer. You do not need an account to start. You do not send your streak history to a company’s servers. For a long stretch Cultiva was Windows-first; later Linden carried the same garden to macOS and Linux as well.

Online, only two doors are intentional:

1. **Auto-update** — when you open the app, it can check GitHub for a newer build and offer to install it, so you do not have to hunt release pages by hand.
2. **Plugins** — optional extensions from [cultiva-plugins](https://github.com/krwg/cultiva-plugins) (weather, radio, and more) that you choose to install.

Everything else stays offline. No metrics. No telemetry. That matters on the road without signal — and for anyone who wants their data to remain theirs.

---

## Timeline at a glance

A short map before the longer walk. Each row is a *season*, not a feature dump.

| When | Version | Name | What you would have held in your hands |
|------|---------|------|----------------------------------------|
| 29 Mar 2026 | — | — | A tiny web page that said “Plant a new habit” |
| early Apr | **0.1** | **Maple** | A browser garden with growing plants and Russian/English |
| early Apr | **0.2** | **Aspen** | The same idea, but habits finally *stayed*; plus a separate Windows app |
| mid Apr | **0.3** | **Sequoia** | Calendar and real settings; decision to bet on desktop |
| mid May | **0.4** | **Coconut** | One downloadable Windows app in this repo; web pages step aside |
| late May | **1.1** | **Cypress** | The app starts to feel like a daily tool — search, keys, backups |
| early Jul | **1.7** | **Linden** | Same garden on Windows, Mac, and Linux; gentler first launch |
| mid Jul | **2.0–2.3** | **Rowan** | Graphite, beds, search, Discord, Developer Mode, Weather Neo skies |

```
static page → Maple (browser) → Aspen (IDB + Desktop sibling)
     → Sequoia (calendar · unify) → Coconut (one Electron home)
     → Cypress → Linden → Rowan
```

---

## Before Maple — March 2026

On **29 March 2026** the repository was little more than a promise: an initial commit, then a tiny static page — a garden grid, almost no logic, and the words **“Plant a new habit.”**

A few days later a modern web toolchain (Vite) arrived so the page could grow into a real interface. The metaphor was already clear: habits should *look* like they grow, not merely sit in a checklist.

There was no installer. No icon in the Start Menu. To try Cultiva you opened it like any other website project — a browser tab, and often a local server you started yourself. That is the honest beginning: pages on a screen, not a product you download.

---

## Maple · 0.1 — the seed in the browser

**When:** 4–5 April 2026 · tags `0.1.0-Maple`, `0.1.5-Maple`

### What it felt like to open it

Imagine opening a calm window in the browser and seeing not a spreadsheet of habits, but a **garden**. Each habit is a living thing with a stage: seed, sprout, plant, tree — and after roughly a year of showing up, a **Legacy** tree that moves into a Trophy Garden. That idea is still the heart of Cultiva today.

You could switch the whole interface between **English and Russian** without reloading. You could hide distractions in Focus Mode. You could pick a simple light or dark look, choose an avatar, and export a JSON backup so your garden was never locked inside someone else’s cloud.

Under the hood it was still fragile in a human sense: data lived mainly in the browser’s local storage. Close the wrong profile, clear site data, and you could scare yourself. But the *feeling* was already finished — plant something, come back tomorrow, watch it change.

A short while later (**0.1.5**) the garden gained colored categories, photo avatars, a public page on GitHub Pages, and the first careful steps toward sign-in. The package even stopped calling itself an internal `cultiva-v2` and simply became **cultiva**.

### What had not arrived yet

No real desktop app in this repository. No solid database. “Install as an app on your phone” was a dream written in early notes — not something you could download.

Maple is remembered as the season when Cultiva *became itself*.

---

## Aspen · 0.2 — roots, accounts, and the first desktop

**When:** 5–9 April 2026

### Why “roots” matters in plain language

In Maple, habits were like notes pinned to a browser. In Aspen they got a proper cellar: **IndexedDB** — a local database on your machine — so the garden could survive restarts with more confidence. Optional **accounts** meant different people (or a guest and a signed-in you) could keep gardens apart. The streak engine gained a name — **GrowthKit** — because streaks stopped being a casual counter and became something the app tried to calculate carefully.

If you never think about databases, the only thing that mattered was: *closing the tab hurt less*. Your progress was meant to stay.

### The parallel story you could actually install

While this repository was still a browser project, a sibling home — **CultivaDesktop** — shipped the first **Windows** Cultiva you could install like ordinary software: a Setup.exe, a portable build, a window in the taskbar, still no telemetry. People later called it **Aspen Desktop**.

So Aspen is a double memory. On one side, the web garden learned to keep data. On the other, for the first time, someone could download Cultiva and open it without starting a developer server.

Aspen is remembered as the season the garden put roots in the ground — and the season the Start Menu became a real option.

---

## Sequoia · 0.3 — the foundation, and the fork in the road

**When:** 12 April 2026 (0.3.0) · early May notes (0.3.5)

### What changed on the screen

Sequoia is when Cultiva stopped being “only a garden grid.”

A full **Calendar** appeared — month, week, and day — so you could plan life beside habits, add colored events with notes, see completed habits reflected in time, pick a timezone, and even show public holidays for a few countries. Settings were rebuilt into a calm two-column sheet (the era called **Settings 2**): profile, appearance, garden, calendar, data, about — the kind of layout that feels closer to a tablet settings app than to a random pile of toggles.

Under the hood, streaks were rewritten again (**GrowthKit2**) so “I missed a day across midnight in another timezone” would hurt less. There were tips pages, a clearer privacy page, a prettier landing — and more themes and soft moving backgrounds beginning to share the sky of the garden.

### The decision behind the screenshots

This is also the season of the human fork in the road — the one from the opening of this file.

The website was no longer going to be the center of gravity. Maintaining web *and* desktop alone was too much. A finished web 1.0 would have arrived late. Desktop could be downloaded and used immediately. So the web path was marked for the archive, and **CultivaDesktop** was marked to move into **krwg/Cultiva**. One home. Here.

Before Sequoia, using Cultiva often meant: browser pages, and sometimes raising a local server yourself.  
After Sequoia’s decision (finished in Coconut), the intended path became: download the application.

### 0.3.5 — words catching up to the desktop life

In early May the project published a larger story in documentation: plugins you install from Settings, a first official **Weather** widget, automatic updates from GitHub, more themes and motion. Much of that life already belonged — or was about to belong — to the **desktop** line. The web tag was aligning the words with the product people were meant to install.

Sequoia is remembered as height — time entered the room — and as the evening the project chose one road home.

---

## Coconut · 0.4 — one repo, one desktop garden

**When:** 11–13 May 2026 · tag `0.4.0` · “Coconut Desktop”

### What actually happened

On **11 May** the desktop project was brought into this repository for real — not as a polite link on a landing page, but as the application itself. From that day, **krwg/Cultiva** is where you build the Windows installer and portable exe. The old browser “storefront” pages (marketing landing, standalone tips/privacy/changelog as the main product) stepped aside. The garden’s soul stayed; the shell became something you download.

Even the git history remembers the break: the early Maple→Sequoia line and the Coconut→today line do not share a single ancestor. Two eras, one name.

### What it felt like as a user

You no longer needed to “run the project.” You downloaded **Setup** or **Portable**, opened Cultiva, and the garden was a normal desktop window. Themes were grouped into light and dark families with warmer names (Orchard, Honeycrisp, Inkwell, Sequoia…). Moving skies — rain, starlight, petal drift, mist, ember, breeze — could fill both the garden and the calendar so switching pages did not feel like switching apps. You could set **your own photo** as a background; it stayed on your machine.

Plugins became something you install carefully: they run in a sandbox, fetch from a registry over HTTPS, and can show small pieces of UI (a chip in the header, a card in the garden, a sheet) without owning the whole window. Sign-in secrets could be protected with the operating system’s secure storage. Quantity habits (glasses of water, pages read) got a proper logging flow. Notifications could appear as real OS notifications. Updates could arrive more calmly from GitHub Releases.

Coconut is remembered as the move: one repository, one mental model, a garden you install.

---

## Cypress · 1.1 — when the app started to feel like home

**When:** 30–31 May 2026 · tag `v1.1.0`

Cypress is easy to summarize badly — “new theme, shortcuts, ZIP.” For someone who just downloaded Cultiva, that sentence means almost nothing. Here is what the season actually changed in an ordinary evening.

### A quieter green to come home to

The release took its name from **Cypress** (кипарис) — a deep evergreen look. Not a loud redesign for screenshots, more a mood: darker greens, a sense of a garden at dusk. Alongside it came three moving backgrounds meant to sit behind your habits without shouting: a slow cypress drift, a soft morning dew, a canopy of sunbeam light. You could also tint the accent color and turn the intensity of those backgrounds up or down — so the room could be calm or a little more alive, without turning the motion off entirely.

If you never open Settings → Appearance, you still feel Cypress as “the app got a season.” If you do open it, you discover the garden can match the hour of day you actually live in.

### Finding a habit when the garden grows

Early Cultiva is lovely when you have three habits. It becomes harder when you have a full row. Cypress added a **search field** in the header: start typing a name or a scrap of description, and the garden narrows to what you meant. The familiar shortcut **Ctrl+F** (or **Cmd+F** on a Mac) focuses that search — the same reflex many people already have in a browser.

This is not a “power-user feature.” It is the difference between scanning every card with your eyes and simply asking the garden for *Journal* or *GitHub*.

### Hands on the keyboard — without learning a manual

Before Cypress, many actions lived mainly behind the mouse: open the plant dialog, open settings, mark today done, log a number. The release made those paths available as ordinary desktop shortcuts — the kind you already use in other apps:

- create a new habit without hunting the plus button  
- open Settings the way many apps do (comma with Ctrl/Cmd)  
- mark the highlighted habit complete, or open the quantity log when a habit is “20 pages,” not just yes/no  
- press Escape to close whatever sheet is on top  

You do not need to memorize a poster of keybindings on day one. Over a week of use, the same fingers that finish a note in another program start finishing a habit here. That is what “hands on the keyboard” meant — not a badge for experts, but fewer tiny interruptions between “I did it” and the card updating.

### A backup you can hold

JSON export already existed for the careful. Cypress added a **ZIP** export on the desktop build: one file you can drop on a USB stick, mail to yourself, or keep beside tax documents — habits and settings together. For someone who does not speak “JSON,” a zip is simply *a copy of my garden I can see in File Explorer*.

### Under the calm surface

The application’s engine room was tidied (the Electron main process split into clearer pieces — window, updates, backup, and so on), and the first automatic tests began to watch habit logic. The license path moved toward **GPL-3.0**, and versions began to sync from a single release file so the number in the footer matched the number on GitHub. None of that is visible when you plant a habit — and that is the point. Cypress tried to make the *daily* surface kinder while the basement got sturdier.

### How Cypress is remembered

Not as a list of commands. As the first **1.x** season when Cultiva stopped feeling like a clever prototype you babysit, and started feeling like a tool you return to after dinner: find what you need, mark it without friction, keep a copy you understand, sit in a quieter green while you do.

---

## Linden · 1.7 — every platform, every evening

**When:** 9 July 2026 · tag `1.7.0`

### What “every platform” means if you are not a developer

Until Linden, many people met Cultiva as a **Windows** download. Linden is the season the same garden could sit on a Mac (Intel or Apple Silicon) and on Linux (AppImage or deb) with official builds — so “I switched machines” no longer meant “I left my tracker behind.”

### The first evening, gentler

A **first-run wizard** walks through language, theme, timezone, your first habit, and whether you want automatic local backups. You can also start from simple **templates** (reading, sport, meditation, water, journal) instead of a blank form. That sounds small until you remember how cold an empty garden feels on night one.

### Life is imperfect — streaks can be, too

Optional **grace day**: one missed day per calendar month does not have to shatter a streak. It is not cheating written into marketing; it is an admission that real months contain travel, illness, and evenings that simply end.

### Seeing the month, not only today

A **statistics** view shows weekly and monthly trends — so progress is not only “did I tap today?” but “how did this month actually look?” Exports grew to include **iCal** for calendars elsewhere, and the app can keep a rotating set of **automatic backups** on disk, with a preview before you restore (so you see habit count and date before you overwrite anything).

### Trust around plugins and the house rules

Official plugins are checked by **checksum** before install. Help is a keypress away (**F1**) with text that depends on whether you are in the garden, settings, or calendar. Context menus, clearer empty states, and project documents (security, contributing, conduct, support) made the house feel less like a private workshop and more like something strangers could enter safely.

### What got quieter

Marking a habit no longer rebuilt the entire garden on screen — only the card that changed. Heavy screens load when you need them. Confirmations use the app’s own calm dialogs instead of the operating system’s abrupt boxes. The stack underneath moved forward (newer Electron and Vite), and the README finally said **GPL-3.0** without confusion.

Linden is remembered as the evening the garden learned to travel — and to welcome you on the first night without raising its voice.

---

## Rowan · 2.0 and the patches — graphite and care

**From 13 July 2026**

### 2.0.0 — a new face, still offline

Rowan is a strict graphite black-and-white look (with **Birch** as a light monochrome twin) and a living background called **Rowan Cluster** — branches and berry-like lights that move softly behind the garden. Plugins stepped up: authors can ship their own themes, backgrounds, ambient sounds, and even extra Settings sections, without waiting for a core release. Habits learned **schedules** (every day, certain weekdays, or N times a week) and optional **reminders** at a time you choose. The system tray can complete a habit quickly; the calendar can host plugin widgets. The app got faster to open and kinder to the disk when saving. A few redundant catalog plugins were pruned so the shelf stayed intentional.

The line on the release was honest: *Graphite. Extensible. Still Offline.*

### The patches that followed — small numbers, large kindness

**2.0.1** made macOS feel at home: language quirks fixed, the Cluster background waking up correctly, dock and tray behaving when you close the window, updates restarting cleanly, a branded disk image for installers.

**2.0.2** protected trust: habits no longer “vanished” after a trip to the calendar because of account ownership bugs; plugins could start again after a security tightening; closing on a Mac no longer left a ghost process; saves flush before you navigate away.

**2.1.0** (Windows-focused) gave the calendar a **year heatmap for all habits together**, a place for **paused and archived** habits instead of a black hole, and a **next Legacy** card when the Trophy Garden is empty — so an empty trophy shelf still shows hope. Installer branding and Windows icons were fixed to say Rowan clearly.

**2.1.1** fixed a painful evening bug: “Reload garden” no longer wiped the list; pending saves stopped racing into empty backups; the footer became a short, centered version line; and the calendar heatmap can be turned off in Settings if you simply do not like the look.

**2.1.2** lets you **drag cards** and group habits into custom **beds** — your layout, not just the category strip. The Weather plugin gained opt-in **Weather Neo**: richer gradients, time-of-day tint, soft in-card rain/snow/glow, and a longer forecast sheet — still fine on Cultiva 1.7+, fancy when you flip the switch.

**2.1.3** brought a Cultiva-styled **plugin store**, a local **glyph search** index (habits, plugins, beds, events, settings), a compact centered footer line, and companion Radio Neo on the player sheet.

**2.2.0** is the layout and presence chapter: beds become **horizontal rows** under plugin widgets (three habits each), the **footer pins to the window**, Settings grow clearer rooms (Focus, Storage, Updates, per-plugin notifies), **glyph-s 2.7** powers search with a rebuild progress bar, and **Discord** finally shows what you are growing — activity, streaks, Focus sessions — with Get Cultiva and GitHub buttons. Quote ships **500 + 500** curated lines. The garden stays offline; only the doors you open (updates, plugins, optional Discord) reach the network.

**2.3.0** opens the workshop door: tap the footer version seven times for **Developer Mode** — flags, session overrides for Legacy/bed caps, `window.cultivaDev`, an RPC log, and a few playful tools — while lint is green again (vendored glyph-s ignored). Weather Neo learns the sun: sunrise/sunset from Open-Meteo, sunset and blue-hour skies, and light text on dark nights so the forecast stays readable.

**2.3.1** tunes the dials: Discord presence gets display modes and per-field toggles; Developer Mode starts hidden each session (hide/turn-off, animated backdrop, habit disable); PE2 exposes tray tooltip and menu hooks so Weather can show degrees in the tray.

**2.3.2** seals two leaks: Developer Mode finally disappears from Settings after Hide/Off (flex was fighting `hidden`), and Weather **2.7.2** puts °C in the tray tooltip and menu.

**2.3.3** lets plugins share the tray without stomping each other, and ships Radio **2.5** — playlist paste that actually works, stream history, ten more SomaFM rooms, and the station name in the tray. Radio **2.5.1** fixes store install when Windows CRLF hashes disagreed with GitHub LF bytes.

**2.3.4** vendors **[glyph-s 2.7.2](https://github.com/FlokeStudio/glyph-s)** so body text reaches the search fast-path (paragraph-only hits work again), and hardens plugin installs against stale CDN hashes (jsDelivr first, LF sha256). The Glyph family link lives in the release notes and Settings → Search.

Through all of that, the Sequoia promise held: one home, a tool you download, data that stays yours.

---

## What never left

| Promise | In human words |
|---------|----------------|
| **Offline-first** | Your garden lives on your device |
| **Visual growth** | You see progress without a lecture |
| **Legacy at 365** | A year of showing up becomes a keepsake |
| **EN + RU** | Two languages, one product |
| **No telemetry** | The app is not studying you |
| **Open license** | The code remains a commons |

Features come and go. The metaphor does not: plant something, show up, watch it grow.

---

## Where to go next

| | |
|:--|:--|
| **Download** | [Latest release](https://github.com/krwg/cultiva/releases/latest) |
| **Changelog** | [CHANGELOG.md](CHANGELOG.md) |
| **Release notes** | [docs/](docs/) |
| **Landing** | [krwg.github.io/cultiva](https://krwg.github.io/cultiva/) |
| **Plugins** | [cultiva-plugins](https://github.com/krwg/cultiva-plugins) |
| **Wiki** | [Project wiki](https://github.com/krwg/cultiva/wiki) |

*Built with care by [krwg](https://github.com/krwg). Grow your habits. Grow yourself.*

---

<div align="center">

✦ · ✦ · ✦

</div>

---

# Русский

## С чего всё началось — не changelog

Привет всем, кто заглянул сюда.

Если вы только что установили Cultiva, вы, возможно, видите просто тихое окно с садом привычек. Этот файл — история за этим окном: откуда всё выросло, почему выглядит именно так, и что менял каждый сезон в обычный вечер, а не в чеклисте разработчика.

### Зачем вообще писать трекер

Однажды попалась реклама трекера привычек. Красивый дизайн, приятный интерфейс — скачал, не раздумывая. Оказался платным. Попробовал ещё несколько — штук пять–восемь, точно уже не вспомнить. У каждого был свой компромисс: лимит на число привычек, навязанный вид, скудный функционал, подписка за следующим экраном.

В какой-то момент стало ясно: проще написать своё, чем мириться с чужими ограничениями.

Так появилась первая Cultiva. Автор пользуется ею сам каждый день с самого начала — и именно это держит в разработке. Не абстрактная аудитория, а живой личный инструмент, который хочется делать лучше.

### Как менялась идея

Изначально **центром всего должен был быть веб-сайт**. Десктоп — как дополнение. На практике поддерживать сразу два продукта в одиночку тяжело, а полноценная веб-версия всё равно вызрела бы ближе к релизу 1.0.

Десктоп — другое дело. Его можно скачать прямо сейчас, установить и пользоваться. Без бесконечного ожидания «идеального сайта».

### Что изменилось к Секвойе — и после

Тогда же приняли важное решение по структуре:

**Веб-версия уходит в архив.** Старые веб-файлы будут удалены. Репозиторий **CultivaDesktop** переезжает сюда — в **krwg/Cultiva** — как единое место развития. Больше никакой раздробленности между репозиториями.

Всё в одном месте. Здесь.

### Чем Cultiva является сейчас

**Офлайн-первый** десктопный трекер привычек. Вы ставите установщик (или запускаете portable), сажаете привычки и смотрите, как они растут по стадиям — пока годовалая привычка не станет деревом **Legacy** в саду трофеев.

«Офлайн-первый» по-простому значит: сад живёт на *вашем* компьютере. Аккаунт не обязателен, чтобы начать. История стриков не уезжает на чужие серверы. Долгое время Cultiva была в первую очередь про Windows; позже Липа унесла тот же сад на macOS и Linux.

Из «онлайна» по задумке всего две двери:

1. **Автообновление** — при запуске приложение может само проверить GitHub и предложить новую версию, чтобы не охотиться за релизами вручную.  
2. **Плагины** — необязательные расширения из [cultiva-plugins](https://github.com/krwg/cultiva-plugins) (погода, радио и другое), которые вы сами решаете поставить.

Всё остальное — полностью офлайн. Никаких метрик, никакого сбора данных. Это важно и в дороге без сети, и просто тем, кому важно, что данные остаются у них.

**До Секвойи** Cultiva часто жила как страницы в браузере: чтобы пользоваться, иногда нужно было самому поднять локальный сервер. **После** — путь «скачай приложение». Секвойя зафиксировала развилку; Кокос завершил переезд в один дом.

---

## Лента времени

Короткая карта перед длинной прогулкой. Каждая строка — *сезон*, а не список фич.

| Когда | Версия | Имя | Что было бы у вас в руках |
|-------|--------|-----|---------------------------|
| 29 мар 2026 | — | — | Крошечная веб-страница «Plant a new habit» |
| нач. апр | **0.1** | **Клён** | Браузерный сад с растущими растениями и EN/RU |
| нач. апр | **0.2** | **Осина** | То же, но привычки наконец *остаются*; плюс отдельное Windows-приложение |
| сер. апр | **0.3** | **Секвойя** | Календарь и нормальные настройки; ставка на десктоп |
| сер. мая | **0.4** | **Кокос** | Одно скачиваемое Windows-приложение в этом репо; веб-страницы уходят |
| кон. мая | **1.1** | **Кипарис** | Приложение начинает ощущаться ежедневным инструментом |
| нач. июл | **1.7** | **Липа** | Тот же сад на Windows, Mac и Linux; мягче первый запуск |
| сер. июл | **2.0–2.3** | **Рябина** | Графит, грядки, поиск, Discord, Dev Mode, Погода Нео |

```
статика → Клён (браузер) → Осина (IDB + соседний Desktop)
    → Секвойя (календарь · развилка) → Кокос (один Electron-дом)
    → Кипарис → Липа → Рябина
```

---

## До Клёна — март 2026

**29 марта 2026** репозиторий был почти обещанием: initial commit, затем крошечная статическая страница — сетка сада, почти без логики, и слова **«Plant a new habit»**.

Через несколько дней появился Vite — чтобы страница могла вырасти в настоящий интерфейс. Метафора уже звучала ясно: привычки должны *выглядеть* растущими, а не сидеть галочками в списке.

Установщика не было. Ярлыка в «Пуске» не было. Cultiva открывали как обычный сайт-проект: вкладка браузера и часто локальный сервер, который поднимаешь сам. Честное начало — страницы на экране, а не продукт, который скачивают.

---

## Клён · Maple 0.1 — семя в браузере

**Когда:** 4–5 апреля 2026

### Каково было открыть

Представьте спокойное окно в браузере — и не таблицу привычек, а **сад**. Каждая привычка — живое с стадией: семя, росток, растение, дерево — и примерно через год регулярности дерево **Legacy** уходит в сад трофеев. Эта идея до сих пор — сердце Cultiva.

Можно было переключить весь интерфейс между **английским и русским** без перезагрузки. Спрятать лишнее в режиме фокуса. Выбрать светлый или тёмный вид, аватар и выгрузить JSON-бэкап — чтобы сад не запирался в чужом облаке.

Внутри всё ещё было хрупко по-человечески: данные жили в основном в хранилище браузера. Очистили данные сайта — и можно было себя напугать. Но *ощущение* уже было целым: посади, приди завтра, посмотри, как изменилось.

Чуть позже (**0.1.5**) появились цветные категории, фото аватара, страница на GitHub Pages и первые шаги к входу в аккаунт. Пакет перестал называться внутренним `cultiva-v2` и стал просто **cultiva**.

### Чего ещё не было

Настоящего десктоп-приложения в этом репозитории. Надёжной базы. «Поставь как приложение на телефон» жило в ранних мечтах, не в загрузках.

Клён запомнился сезоном, когда Cultiva *стала собой*.

---

## Осина · Aspen 0.2 — корни, аккаунты и первый десктоп

**Когда:** 5–9 апреля 2026

### Почему «корни» — простыми словами

В Клёне привычки были как записки, приколотые к браузеру. В Осине у них появился погреб: **IndexedDB** — локальная база на компьютере, — чтобы сад увереннее переживал перезапуски. Опциональные **аккаунты** разделяли сады разных людей (или гостя и вас). Движок стриков получил имя **GrowthKit**: счётчики перестали быть «на глаз» и стали считаться осторожнее.

Если база данных вам неинтересна, важно одно: *закрыть вкладку стало менее страшно*. Прогресс должен был оставаться.

### Параллельная история, которую можно было поставить

Пока этот репозиторий оставался браузерным проектом, соседний дом — **CultivaDesktop** — выпустил первую **Windows**-Cultiva как обычную программу: Setup.exe, portable, окно в панели задач, без телеметрии. Позже это звали **Aspen Desktop**.

Осина — двойная память. С одной стороны веб-сад научился хранить данные. С другой — впервые можно было скачать Cultiva и открыть её, не поднимая сервер разработчика.

Осина запомнилась сезоном, когда сад пустил корни — и когда «Пуск» стал настоящим вариантом.

---

## Секвойя · Sequoia 0.3 — фундамент и развилка

**Когда:** 12 апреля 2026 (0.3.0) · начало мая (0.3.5)

### Что изменилось на экране

Секвойя — момент, когда Cultiva перестала быть «только сеткой сада».

Появился полноценный **календарь** — месяц, неделя, день, — чтобы планировать жизнь рядом с привычками, добавлять цветные события с заметками, видеть отмеченные дни во времени, выбрать часовой пояс и даже праздники нескольких стран. Настройки стали спокойным двухколоночным листом (**Settings 2**): профиль, внешний вид, сад, календарь, данные, о проекте — ближе к настройкам планшета, чем к случайной куче переключателей.

Стрики переписали ещё раз (**GrowthKit2**), чтобы «пропустил день из‑за полуночи в другом поясе» било реже. Появились советы, понятнее страница о приватности, красивее лендинг — и больше тем с мягким движением фона.

### Решение за скриншотами

Это ещё и сезон человеческой развилки — той, с которой начинается этот файл.

Сайт больше не должен был быть центром тяжести. Два продукта в одиночку — слишком тяжело. До «настоящего веб‑1.0» было далеко. Десктоп можно скачать и пользоваться сразу. Поэтому веб пометили к архиву, а **CultivaDesktop** — к переезду в **krwg/Cultiva**. Один дом. Здесь.

До Секвойи пользоваться часто значило: страницы в браузере и иногда свой локальный сервер.  
После решения Секвойи (завершённого в Кокосе) задуманный путь стал: скачать приложение.

### 0.3.5 — слова догоняют десктопную жизнь

В начале мая в документации рассказали большую историю: плагины из настроек, первый официальный **Weather**, автообновления, новые темы и движение. Многое из этой жизни уже принадлежало — или вот‑вот должно было принадлежать — **десктопной** линии. Веб‑тег подтягивал слова к продукту, который люди должны были ставить.

Секвойя запомнилась высотой — в комнату вошло время — и вечером, когда проект выбрал одну дорогу домой.

---

## Кокос · Coconut 0.4 — один репозиторий, один десктопный сад

**Когда:** 11–13 мая 2026 · «Coconut Desktop»

### Что произошло на самом деле

**11 мая** десктопный проект переехал в этот репозиторий по‑настоящему — не как вежливая ссылка на лендинге, а как само приложение. С того дня **krwg/Cultiva** — место, где собирают Windows‑установщик и portable. Старые браузерные «витринные» страницы отошли. Душа сада осталась; оболочка стала тем, что скачивают.

Даже git это помнит: ранняя линия Клён→Секвойя и линия Кокос→сегодня не имеют общего предка. Две эпохи, одно имя.

### Каково было пользователю

Больше не нужно было «запускать проект». Скачали **Setup** или **Portable**, открыли Cultiva — и сад стал обычным окном на рабочем столе. Темы собрали в светлые и тёмные семьи с тёплыми именами. Движущееся небо — дождь, звёзды, лепестки, туман, угольки, ветерок — могло быть и в саду, и в календаре, чтобы смена страницы не ощущалась сменой приложения. Можно было поставить **своё фото** фоном; оно оставалось на компьютере.

Плагины стали тем, что ставят осторожно: песочница, загрузка из реестра по HTTPS, маленькие кусочки интерфейса (значок в шапке, карточка в саду, панель) без захвата всего окна. Секреты входа можно было беречь системным хранилищем. Привычки «по количеству» (стаканы воды, страницы) получили нормальный способ записать число. Уведомления могли быть настоящими системными. Обновления — спокойнее с GitHub Releases.

Кокос запомнился переездом: один репозиторий, одна модель в голове, сад, который ставят.

---

## Кипарис · Cypress 1.1 — когда приложение стало похожим на дом

**Когда:** 30–31 мая 2026 · тег `v1.1.0`

Кипарис легко свести к плохой фразе — «новая тема, шорткаты, ZIP». Для человека, который только скачал Cultiva, в этом почти ничего не сказано. Вот что сезон менял в обычный вечер.

### Спокойнее зелень, к которой возвращаешься

Релиз взял имя у **кипариса** — глубокий вечнозелёный вид. Не громкий редизайн «для скриншотов», а настроение: более тёмная зелень, сад ближе к сумеркам. Рядом — три фона, которые могут жить за привычками, не крича: медленный drift кипариса, мягкая утренняя роса, свет сквозь крону. Можно подкрутить акцентный цвет и силу движения фона — чтобы комнате было тише или чуть живее, не выключая атмосферу совсем.

Если вы никогда не зайдёте в «Внешний вид», Кипарис всё равно ощутится как «у приложения появился сезон». Если зайдёте — сад сможет ближе совпасть с часом дня, в котором вы реально живёте.

### Найти привычку, когда сад разрастается

Ранняя Cultiva прекрасна с тремя привычками. С полным рядом карточек глазами искать уже тяжелее. В Кипарисе в шапке появился **поиск**: начинаете набирать имя или кусок описания — и сад сужается к тому, что вы имели в виду. Привычный **Ctrl+F** (на Mac — **Cmd+F**) ставит курсор в это поле — тот же рефлекс, что в браузере.

Это не «фича для гиков». Это разница между перебором всех карточек глазами и простой просьбой к саду: *Дневник* или *GitHub*.

### Руки на клавиатуре — без учебника

До Кипариса многое жило в основном за мышью: открыть посадку, открыть настройки, отметить день, записать число. Релиз сделал эти пути обычными десктопными сочетаниями — такими же, какими вы уже пользуетесь в других программах:

- посадить новую привычку, не отыскивая плюс глазами  
- открыть настройки так, как во многих приложениях принято (Ctrl/Cmd и запятая)  
- отметить подсвеченную привычку или открыть запись количества, если это «20 страниц», а не просто да/нет  
- нажать Escape, чтобы закрыть верхнюю панель  

В первый день не нужно учить плакат с горячими клавишами. За неделю те же пальцы, что заканчивают заметку в другой программе, начинают заканчивать привычку здесь. Вот что значило «руки на клавиатуре» — не значок для экспертов, а меньше крошечных пауз между «я сделал» и обновлением карточки.

### Бэкап, который можно подержать в руках

JSON‑экспорт для осторожных уже был. Кипарис на десктопе добавил выгрузку **ZIP**: один файл, который можно положить на флешку, отправить себе или держать рядом с важными документами — привычки и настройки вместе. Для человека, которому «JSON» ничего не говорит, zip — просто *копия моего сада, которую видно в Проводнике*.

### Под спокойной поверхностью

«Машинное отделение» приложения привели в порядок, появились первые автоматические проверки логики привычек, лицензия увереннее шла к **GPL‑3.0**, номер версии в подвале начал совпадать с номером на GitHub. Ничего из этого не видно, когда вы сажаете привычку — и в этом смысл. Кипарис старался сделать *ежедневную* поверхность добрее, пока подвал становился крепче.

### Чем запомнился Кипарис

Не списком команд. Первым сезоном **1.x**, когда Cultiva перестала ощущаться умным прототипом, за которым нужно присматривать, и стала инструментом, к которому возвращаются после ужина: найти нужное, отметить без трения, сохранить копию, которую понимаешь, посидеть в более тихой зелени.

---

## Липа · Linden 1.7 — каждая платформа, каждый вечер

**Когда:** 9 июля 2026

### Что значит «каждая платформа», если вы не разработчик

До Липы многие встречали Cultiva как загрузку для **Windows**. Липа — сезон, когда тот же сад официально сел на Mac (Intel и Apple Silicon) и на Linux — чтобы смена компьютера не означала «я оставил трекер».

### Первый вечер — мягче

**Мастер первого запуска** проводит через язык, тему, часовой пояс, первую привычку и вопрос про автоматические локальные бэкапы. Можно начать с простых **шаблонов** (чтение, спорт, медитация, вода, дневник), а не с пустой формы. Это кажется мелочью — пока не вспомнишь, каким холодным бывает пустой сад в первую ночь.

### Жизнь неидеальна — стрик тоже может быть

Опциональный **день милости**: один пропуск в календарном месяце не обязан обнулять серию. Это не «чит из рекламы», а признание, что в реальных месяцах есть дороги, болезни и вечера, которые просто кончаются.

### Видеть месяц, а не только сегодня

**Статистика** показывает недели и месяцы — чтобы прогресс был не только «нажал ли сегодня», а «как на самом деле прошёл месяц». Появился экспорт в **iCal**, набор **автобэкапов** на диске и превью перед восстановлением (чтобы видеть число привычек и дату до перезаписи).

### Доверие к плагинам и правилам дома

Официальные плагины проверяются **контрольной суммой** перед установкой. Справка — на **F1**, с текстом в зависимости от того, где вы: сад, настройки или календарь. Контекстные меню, понятнее пустые состояния, документы про безопасность и участие сделали дом менее похожим на частную мастерскую и более — на место, куда можно войти незнакомцу.

### Что стало тише

Отметка привычки больше не пересобирала весь сад на экране — только нужную карточку. Тяжёлые экраны подгружаются, когда нужны. Подтверждения — спокойные окна самого приложения, а не резкие системные. Стек обновился; в README без путаницы сказано **GPL‑3.0**.

Липа запомнилась вечером, когда сад научился путешествовать — и встречать в первую ночь, не повышая голоса.

---

## Рябина · Rowan 2.0 и патчи — графит и забота

**С 13 июля 2026**

### 2.0.0 — новое лицо, всё ещё офлайн

Рябина — строгий графитовый чёрно‑белый вид (и светлая **Birch**) и живой фон **Rowan Cluster** — ветви и ягодный свет за садом. Плагины выросли: авторы могут приносить свои темы, фоны, звуки и даже разделы настроек, не дожидаясь релиза ядра. У привычек появились **расписания** (каждый день, выбранные дни недели или N раз в неделю) и необязательные **напоминания** в выбранное время. Из трея можно быстро отметить привычку; в календаре — виджеты плагинов. Приложение быстрее открывается и аккуратнее пишет на диск. Лишние плагины из каталога убрали, чтобы полка оставалась намеренной.

Честная строка релиза: *Graphite. Extensible. Still Offline.*

### Патчи следом — маленькие номера, большая доброта

**2.0.1** подружила графит с macOS: языки, фон Cluster, Dock и трей при закрытии, перезапуск после обновления, брендированный образ диска.

**2.0.2** вернула доверие: привычки больше не «пропадали» после календаря из‑за привязки к аккаунту; плагины снова могли стартовать; закрытие на Mac не оставляло призрака; сохранения сбрасываются перед уходом со страницы.

**2.1.0** (с упором на Windows) дала календарю **теплокарту всех привычек за год**, место для **паузы и архива** вместо чёрной дыры и карточку **следующего Legacy**, когда сад трофеев пуст — чтобы пустая полка всё ещё давала надежду. Брендинг установщика и иконки поправили под Rowan.

**2.1.1** исправила больной вечерний баг: «Обновить сад» больше не стирало список; сохранения перестали гонкой затирать хорошие бэкапы; подвал стал короткой центрированной строкой версии; теплокарту в настройках можно выключить, если она просто не нравится глазу.

**2.1.2** даёт **перетаскивание карточек** и свои **грядки** — раскладка сада как хочется, а не только по категориям. У плагина «Погода» появился опциональный режим **Погода Нео**: более живые градиенты, тонировка по времени суток, мягкий дождь/снег/сияние в карточке и более длинное окно прогноза — на Cultiva 1.7+ всё работает, а «крутой» вид включается переключателем.

**2.1.3** принесла магазин плагинов в стиле Cultiva, локальный индекс **glyph-поиска** (привычки, плагины, грядки, события, настройки), компактную строку версии в подвале и Radio Neo на листе плеера.

**2.2.0** — глава про раскладку и присутствие: грядки стали **горизонтальными рядами** под виджетами плагинов (по три привычки), **подвал прибит к окну**, в настройках появились понятные комнаты (Фокус, Хранилище, Обновления, мьюты уведомлений плагинов), **glyph-s 2.7** крутит поиск с прогрессом пересборки, а **Discord** наконец показывает, что вы растите — активность, серии, сессии Фокуса — с кнопками Get Cultiva и GitHub. Quote отдаёт **500 + 500** отобранных цитат. Сад остаётся офлайн; в сеть выходят только двери, которые вы сами открываете.

**2.3.0** открывает мастерскую: семь нажатий по версии в подвале — **режим разработчика** (флаги, оверрайды Legacy/грядок, `window.cultivaDev`, лог RPC и пара шуток), а линт снова зелёный. Погода Нео учится солнцу: восход/закат из Open-Meteo, закат и синий час, светлый текст на тёмном небе.

**2.3.1** крутит тонкие ручки: Discord — режимы и тумблеры полей; Dev Mode скрыт до анлока (скрыть/выключить, аним-фон, отключение привычек); PE2 даёт трей-хуки, и Weather выводит градусы в tooltip.

**2.3.2** закрывает два бага: пункт Developer снова прячется после Hide/Off, а Weather **2.7.2** показывает °C в tooltip и меню трея.

**2.3.3** делит трей между плагинами без войны, а Radio **2.5** наконец переваривает вставленные `.m3u`/`.pls`, помнит историю потоков, добавляет десять станций и пишет текущую волну в трей. **2.5.1** чинит установку из магазина (хеши LF vs CRLF).

**2.3.4** подтягивает **[glyph-s 2.7.2](https://github.com/FlokeStudio/glyph-s)** — тело текста снова проходит fast-path поиска — и чинит установку плагинов со stale CDN (сначала jsDelivr, sha256 по LF). Ссылка на семейство Glyph — в релиз-нотах и в Settings → Search.

Сквозь всё это держалось обещание Секвойи: один дом, инструмент, который скачивают, данные, которые остаются вашими.

---

## Что не ушло

| Обещание | По-человечески |
|----------|-----------------|
| **Офлайн-first** | Сад живёт на вашем устройстве |
| **Визуальный рост** | Прогресс видно без лекции |
| **Legacy на 365** | Год регулярности становится реликвией |
| **EN + RU** | Два языка, один продукт |
| **Без телеметрии** | Приложение вас не изучает |
| **Открытая лицензия** | Код остаётся общим |

Фичи приходят и уходят. Метафора — нет: посади, приходи, смотри, как растёт.

---

## Куда дальше

| | |
|:--|:--|
| **Скачать** | [Последний релиз](https://github.com/krwg/cultiva/releases/latest) |
| **Changelog** | [CHANGELOG.md](CHANGELOG.md) |
| **Заметки релизов** | [docs/](docs/) |
| **Лендинг** | [krwg.github.io/cultiva](https://krwg.github.io/cultiva/) |
| **Плагины** | [cultiva-plugins](https://github.com/krwg/cultiva-plugins) |
| **Wiki** | [Wiki](https://github.com/krwg/cultiva/wiki) |

*С заботой — [krwg](https://github.com/krwg). Растите привычки. Растите себя.*

---

<div align="center">

*static → Maple → Aspen → Sequoia → Coconut → Cypress → Linden → Rowan*  
*статика → Клён → Осина → Секвойя → Кокос → Кипарис → Липа → Рябина*

**Cultiva Progress** · один сад, много сезонов

</div>
