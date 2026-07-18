# Cultiva Progress

**История сада · A quiet history of the garden**  
*From the first static page to Linden · then Rowan*  
*Март–июль 2026*

Это не changelog и не список тикетов.  
Это рассказ — по-человечески — о том, откуда вырос Cultiva, почему он выглядит так, как выглядит, и чем запомнился каждый сезон. Английский и русский в одном файле: можно читать целиком или выбрать свой язык.

| | |
|:--|:--|
| **Latest** | [2.1.1 Rowan](https://github.com/krwg/cultiva/releases/tag/2.1.1) |
| **Philosophy** | Offline-first · No telemetry · Habits you can *see* grow |
| **License** | GPL-3.0 · by [krwg](https://github.com/krwg) |

---

<details>
<summary><strong>Contents · Содержание</strong></summary>

**English**
- [How it began](#how-it-began--not-a-changelog)
- [Timeline](#timeline-at-a-glance)
- [Before Maple](#before-maple--march-2026)
- [Maple 0.1](#maple--01--the-seed-in-the-browser)
- [Aspen 0.2](#aspen--02--roots-accounts-and-the-first-desktop)
- [Sequoia 0.3](#sequoia--03--the-foundation-and-the-fork-in-the-road)
- [Coconut 0.4](#coconut--04--one-repo-one-desktop-garden)
- [Cypress 1.1](#cypress--11--the-first-1x-season)
- [Linden 1.7](#linden--17--every-platform-every-evening)
- [Rowan 2.0+](#rowan--20-and-the-patches--graphite-and-care)
- [What never left](#what-never-left)
- [Where to go next](#where-to-go-next)

**Русский**
- [С чего всё началось](#с-чего-всё-началось--не-changelog)
- [Лента времени](#лента-времени)
- [До Клёна](#до-клёна--март-2026)
- [Клён 0.1](#клён--maple-01--семя-в-браузере)
- [Осина 0.2](#осина--aspen-02--корни-аккаунты-и-первый-десктоп)
- [Секвойя 0.3](#секвойя--sequoia-03--фундамент-и-развилка)
- [Кокос 0.4](#кокос--coconut-04--один-репозиторий-один-десктопный-сад)
- [Кипарис 1.1](#кипарис--cypress-11--первый-сезон-1x)
- [Липа 1.7](#липа--linden-17--каждая-платформа-каждый-вечер)
- [Рябина 2.0+](#рябина--rowan-20-и-патчи--графит-и-забота)
- [Что не ушло](#что-не-ушло)
- [Куда дальше](#куда-дальше)

</details>

---

# English

## How it began — not a changelog

Hello to anyone who opened this file.

This is a little of where the project grew from — and why it looks the way it looks now. No formalities. Just the story.

### Why write a habit tracker at all

One day there was an ad for a habit tracker. Clean design, pleasant interface — downloaded without thinking. It turned out to be paid. Then came more apps — five or eight; the exact number no longer matters. Each one asked for a compromise: a hard limit on habits, a design you could not change, thin features, or a subscription waiting behind the next screen.

At some point it became simpler to build something of one’s own than to keep living inside other people’s limits.

That is how the first Cultiva appeared. It has been used by its author every day since the beginning. That daily use is what keeps the work going — not an abstract audience, but a living personal tool that still feels worth making better.

### How the idea shifted

At first the **center of everything was meant to be a website**. The desktop build was planned as a companion. In practice, maintaining two products alone was heavy, and a real web product would only have matured around a 1.0 release.

Desktop was different. You could download it, install it, and use it *now* — without waiting for a perfect site.

### What changed at Sequoia — and after

An important structural decision landed in that season:

The **web version was set on a path to the archive**. Old web files would leave. The **CultivaDesktop** repository would move here — into **krwg/Cultiva** — as the single home for the project. No more splitting the garden across repos.

Everything in one place. Here.

### What Cultiva is today

Cultiva is an **offline-first desktop habit tracker**. Installer and portable builds. For a long stretch it was Windows-first; Linden later carried it to macOS and Linux as well.

Online, only two things matter by design:

1. **Auto-update** — on launch the app can check GitHub Releases and fetch a new build. You do not have to hunt tags by hand.
2. **Plugins** — through [cultiva-plugins](https://github.com/krwg/cultiva-plugins) you can extend the garden in a flexible way.

Everything else stays offline. No metrics. No telemetry. That matters on the road without signal — and for anyone who wants their data to remain theirs.

---

## Timeline at a glance

| Season | Version | Codename | Form | Remembered for |
|--------|---------|----------|------|----------------|
| Mar 29, 2026 | pre-tag | — | Static HTML | First “Plant a new habit” page |
| Apr 4–5 | **0.1.0 / 0.1.5** | **Maple** | Vite **browser** MPA | Growth stages, trophy garden, EN/RU, localStorage |
| Apr 5–9 | **0.2.0 / 0.2.1** | **Aspen** | Browser + sibling **CultivaDesktop** | IndexedDB (IBD2), accounts, GrowthKit; first Windows `.exe` |
| Apr 12 | **0.3.0** | **Sequoia** | Browser (desktop advertised) | Calendar, Settings 2, GrowthKit2; decision to unify on desktop |
| May 10 | **0.3.5** | Sequoia line | README points to desktop | Plugins & auto-update story; Weather as first official plugin |
| May 11–13 | **0.4.0** | **Coconut** | **Electron** in this repo | Orphan import from desktop backup; web pages leave; sandbox plugins |
| May 30 | **1.1.0** | **Cypress** | Electron | Search, live hotkeys, ZIP backup, Cypress theme |
| Jul 9 | **1.7.0** | **Linden** | Win · macOS · Linux | Onboarding, grace day, sha256 plugins, multi-platform |
| Jul 13+ | **2.0.x–2.1.x** | **Rowan** | Electron | Graphite UI, PLE1, schedules; Windows garden UX & critical fixes |

```
static page → Maple (browser) → Aspen (IDB + Desktop sibling)
     → Sequoia (calendar · unify decision) → Coconut (one Electron home)
     → Cypress → Linden → Rowan
```

---

## Before Maple — March 2026

On **29 March 2026** the repository was little more than a promise: an initial commit, then a tiny static page — `index.html`, `style.css`, an empty `script.js`, and the words **“Plant a new habit.”** A garden grid without a framework.

A few days later Vite arrived (`setup Vite`, CSS/JS modules). The metaphor was already clear: habits should *grow*, not merely be checked.

There was no Electron yet. No installer. To try Cultiva you opened it like any other front-end project — a browser tab, and often a local server you started yourself (`vite` on port **3000**). That is the honest beginning: pages in a browser, not a product on the Start Menu.

---

## Maple · 0.1 — the seed in the browser

**Tags:** `0.1.0-Maple` (4 Apr 2026) · `0.1.5-Maple` (5 Apr 2026)  
**Shape:** Vite multi-page app — `index.html` + `landing.html`  
**Storage:** `localStorage` JSON (`cultiva-habits`, `cultiva-settings`)  
**Engines (named later in spirit):** a simple habits module, not yet GrowthKit / IBD

### Remembered for
The moment Cultiva *became* itself. A quiet, Apple-inspired shell with a gamified heart: five visual stages ending in **Legacy at 365 days**.

### First appeared
- Growth: Seed → Sprout → Plant → Tree → **Legacy**
- **Trophy Garden** for trees that reached a year
- Focus Mode · custom avatars · Light / Dark / Auto
- Contribution-style calendar on habits · streak stats
- Full **English / Russian** switching without reload
- Landing page, changelog & error pages, early onboarding experiments
- Cap of **nine** active habits
- Tagline already present: *Grow your habits. Grow yourself.*

### 0.1.5 — still Maple, already widening
- Habit **categories** with fifteen colors  
- Avatar photo upload  
- Quantity-habit streak fixes  
- **GitHub Pages** landing under `docs/`  
- Early **auth** groundwork (users in localStorage, SHA-256 via Web Crypto)  
- Package rename from `cultiva-v2` → `cultiva`  
- MIT license in that era  

### What it felt like
A browser garden you could open after `npm run dev`. Beautiful, personal, still fragile in the way early localStorage apps are — but the metaphor was already finished in the heart.

### What had not arrived yet
No Electron. No true IndexedDB. “PWA installation” lived only as a dream in early roadmaps — not as shipping reality.

---

## Aspen · 0.2 — roots, accounts, and the first desktop

**Tags:** `0.2.0-Aspen` (5 Apr) · `0.2.1-Aspen` (9 Apr)  
**Branding:** CoreV2 · **GrowthKit** · **IBD2** · Aspen

### Remembered for
Putting **roots under the soil**. Habits stopped living only as loose JSON in localStorage. Accounts and IndexedDB made the garden durable — and, almost at the same time, a **native Windows build** appeared in a sibling home.

### First appeared in this repo (0.2.0)
- Optional **user accounts** (salted SHA-256), user-scoped habits  
- **IndexedDB** database `cultiva_v2_db` — stores for habits, settings, users, sessions  
- Session recovery after refresh  
- Migration flag from localStorage → IDB, with fallback if IDB failed  
- GrowthKit as the named streak / progress engine  
- Changelog **archive** for older Maple versions  

### 0.2.1 in the web tree
- Habit Tips carousel · Privacy page  
- Community themes **Pink** and **Moon**  
- ESLint / CI hardening  

### Aspen Desktop — the parallel story (≈ 8 Apr 2026)
While this repository was still a **Vite browser app**, a sibling project — **[CultivaDesktop](https://github.com/krwg/CultivaDesktop)** — shipped the first **native Windows** Cultiva: Electron 30, installer and portable `.exe`, taskbar presence, zero telemetry. Marketing later called it **“[0.2.1] Aspen Desktop · Windows 10/11”**.

So Aspen is a double memory: **roots in the database** on the web line, and **the first time you could install Cultiva like real software** on the desktop line.

### What got better
Persistence became intentional. Who owns which habits became clear. The dream of “just a tab” began to share space with “an app on my machine.”

---

## Sequoia · 0.3 — the foundation, and the fork in the road

**Tag:** `0.3.0-Sequoia` (12 Apr 2026)  
**Release line:** *The foundation update. Refined, rebuilt, and ready to grow.*  
**Engines:** GrowthKit**2** · Settings **2** · IBD2 · CoreV2

### Remembered for
Height. Cultiva stopped being only a garden grid. **Time** entered the room — month, week, and day. Settings became a calm two-column sheet. And behind the screenshots, a human decision: **the website would no longer be the center of gravity**.

### First appeared (0.3.0 in this repo)
- **Calendar** — month / week / day; colored events & notes; habit completion sync; timezones; holiday regions (five countries); 12h / 24h  
- **Settings 2** — iPadOS-style sidebar: Profile, Appearance, Garden, Calendar, Data, About (Notifications & Updates visible but still disabled on the web build)  
- **GrowthKit2** — cleaner streaks (`currentStreak` / `bestStreak`), timezone-aware edge cases, migration-ready model  
- Redesigned **Tips** (twelve strategies) · **Privacy** principles page · Apple-style **Landing** with a desktop CTA  
- More themes (Evergreen, Blossom, Ocean, Sunset…) and early ambient (Aurora, Rainfall, Starlight)

### The decision that still echoes

> At first the center was meant to be the web. Desktop was an addition.  
> Maintaining both alone was too much; a finished web 1.0 would have arrived late.  
> Desktop could be downloaded and used immediately.  
> So the web path was marked for archive. CultivaDesktop would move into **krwg/Cultiva**.  
> One home. Here.

Sequoia’s landing already pointed at Windows downloads and spoke of Cultiva Desktop in the present tense. The browser garden still existed — but the heart of the project was turning toward the app you install.

### Before Sequoia vs after — form of life
| Before | After (direction set here, finished in Coconut) |
|--------|--------------------------------------------------|
| Browser pages | Desktop application |
| Often: run a local server yourself | Download installer or portable |
| Web repo + Desktop repo | One Cultiva home (completed May) |

### 0.3.5 (10 May 2026) — three releases’ worth of intention
The tag itself mostly updated **README** and issue templates, but the story it told was large:

- **Plugins** from Settings → Plugins, sandboxed, from the CultivaPlugins registry  
- First official plugin: **Weather** (Open-Meteo, geocoding, header chip, garden widget)  
- **Auto-updates** from GitHub Releases  
- New themes (Frost and friends) · animated backgrounds · Discord rich presence in the desktop narrative  

Much of that code already lived — or was about to live — on the **desktop** line. The web tag was catching the documentation up to the product people were meant to install.

---

## Coconut · 0.4 — one repo, one desktop garden

**Tag:** `0.4.0` (13 May 2026 tip)  
**Codename:** Coconut · **CoreV3** · GrowthKit2 · **IDB2** · footer: *Coconut Desktop*  
**Form:** Electron in **this** repository at last

### Remembered for
The cutover. On **11 May 2026** commit `migrating a project from a backup` brought an **orphan Electron lineage** into `krwg/Cultiva` — the practical merge of CultivaDesktop into the main home. The old Vite web landing, tips, privacy, and changelog *pages* stepped aside. The garden kept its soul; the shell became an application.

Git history even shows the break: Maple→0.3.5 and Coconut→today do not share a merge-base. Two eras, one name.

### First appeared / hardened here
- `electron/main.cjs`, preload, plugin IPC, NSIS **Setup** + **Portable**  
- Plugin **sandboxed iframes** · safer HTTPS registry fetch · integrity checks  
- Plugin UI in the main window: sheets, header chips, garden HTML (bridge documented for authors)  
- Credential encryption via Electron **safeStorage**  
- Themes grouped Light / Dark / Auto — Orchard, Honeycrisp, Inkwell, Sequoia…  
- Shared ambient on garden **and** calendar: Petal Drift, Silicon Mist, Ember Glow, Breeze Glass, classic weather layers, **My Photo…** (stored locally)  
- Native OS notifications · more resilient auto-updater  
- Quantity habits with a proper desktop log flow  

### What left
The browser-marketing multipage shell (`landing.html`, standalone tips/privacy/changelog/error pages as the primary product surface). Cultiva was no longer “open the repo and raise a server.” It was “download Cultiva.”

### What got better
One repository. One mental model. Offline-first desktop with only the online doors you choose: updates and plugins.

---

## Cypress · 1.1 — the first 1.x season

**Tag:** `v1.1.0` (30–31 May 2026)  
**Engines:** CoreV5 · GrowthKit2 · IDB2 · **Cypress**  
**License path:** MIT → **GPL-3.0** in this era · version source: `cultiva.release.json`

### Remembered for
Breathing like a **1.x** product. Evergreen calm. Hands on the keyboard. A backup you can carry as a single ZIP.

### First appeared
- Theme **Cypress** (Кипарис) — deep evergreen  
- Ambient: **Cypress Drift**, **Morning Dew**, **Canopy Sunbeam**  
- Accent color · ambient intensity  
- Habit **search** (`Ctrl/Cmd+F`)  
- **Live hotkeys** — plant (`Ctrl/Cmd+N`), settings (`Ctrl/Cmd+,`), complete (`Ctrl/Cmd+Enter`), quantity log (`Ctrl/Cmd+L`), Escape  
- **ZIP** backup export beside JSON  
- Electron main split into clear modules (window, updater, backup, Discord, IPC)  
- Early Vitest coverage for habits / timezone helpers  

### What got better
Power users could stay in flow. Atmosphere became tunable. The project spoke of itself as something that ships seasons — not only experiments.

---

## Linden · 1.7 — every platform, every evening

**Tag:** `1.7.0` (9 Jul 2026) · Registry cultiva-plugins **3.0.2**  
**Line:** *More. Faster. On Every Platform.*

### Remembered for
Taking the Windows-loved garden and making it a **desktop citizen** everywhere: Windows, macOS (Intel + Apple Silicon), Linux — with an onboarding that guides instead of overwhelms.

### First appeared
- First-run wizard · habit templates · streak **grace day** · statistics dashboard  
- iCal export · rotating auto-backups (7) · import preview  
- Plugin **sha256** enforcement · richer sandbox · `cultiva-plugin.d.ts`  
- F1 contextual help · context menus · native shell chrome  
- Theme **Linden** · ambient **Linden Bloom** · GitHub Pages landing  
- CONTRIBUTING · SECURITY · CODE_OF_CONDUCT · SUPPORT · Dependabot · Vitest in CI  

### What got better
Incremental garden updates · lazy loading of heavy screens · custom dialogs · Electron 40 / Vite 6 · honest GPL-3.0 in the README.

### What left
Native `alert`/`confirm` as the main voice of the UI. The idea that “desktop” meant Windows only.

---

## Rowan · 2.0 and the patches — graphite and care

**2.0.0** (13 Jul) — *Graphite. Extensible. Still Offline.*  
Rowan & Birch themes · Rowan Cluster canvas · **PLE1** plugin contributions (themes, backgrounds, sounds, settings nav) · habit schedules & reminders · tray quick-complete · calendar plugin rail · performance sprint (lazy CSS, coalesced IDB writes). Catalog pruned of redundant streak/focus-session plugins.

**2.0.1** — macOS evening: locales, Cluster resume, dock/tray lifecycle, updater restart, branded DMG.  
**2.0.2** — trust: habits no longer orphan after calendar; plugins start again; no zombie close on macOS; flush before navigate.  
**2.1.0** — Windows garden UX: all-habits heatmap, paused section, next Legacy card, icons & NSIS Rowan branding.  
**2.1.1** — critical care: soft garden reload, safe habit flushes, centered footer, heatmap toggle.

Still offline-first. Still no telemetry. The Sequoia promise — one home, a tool you download — holds.

---

## What never left

| Promise | Why it matters |
|---------|----------------|
| **Offline-first** | The garden lives on your device |
| **Visual growth** | Progress without a lecture |
| **Legacy at 365** | A year becomes a keepsake |
| **EN + RU** | Two languages, one product |
| **No telemetry** | Attention stays yours |
| **Open license** | The code remains a commons |

Features change. The metaphor does not: plant something, show up, watch it grow.

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

Хочется рассказать, откуда вырос этот проект — и почему он выглядит именно так. Без формальностей. Просто история.

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

**Офлайн-первый** десктопный трекер привычек. Установщик и портативная сборка. Долгое время — с упором на Windows; позже Linden унесла сад и на macOS, и на Linux.

Из «онлайна» по задумке всего две двери:

1. **Автообновление** — при запуске приложение само может проверить GitHub Releases и скачать новую версию. Не нужно охотиться за тегами вручную.  
2. **Плагины** — через [cultiva-plugins](https://github.com/krwg/cultiva-plugins) можно гибко расширять сад под себя.

Всё остальное — полностью офлайн. Никаких метрик, никакого сбора данных. Это важно и в дороге без сети, и просто тем, кому важно, что данные остаются у них.

**До Секвойи** Cultiva жила как страницы в браузере: чтобы пользоваться, часто нужно было самому поднять локальный сервер. **После** — первый настоящий десктоп и сознательный уход от браузерной версии в пользу приложения. Секвойя зафиксировала развилку; Кокос завершил переезд в один дом.

---

## Лента времени

| Сезон | Версия | Имя | Форма | Чем запомнилась |
|-------|--------|-----|-------|-----------------|
| 29 мар 2026 | до тега | — | Static HTML | Первая страница «Plant a new habit» |
| 4–5 апр | **0.1.0 / 0.1.5** | **Клён** | Vite **в браузере** | Стадии роста, трофеи, EN/RU, localStorage |
| 5–9 апр | **0.2.0 / 0.2.1** | **Осина** | Браузер + **CultivaDesktop** | IndexedDB, аккаунты, GrowthKit; первый Windows `.exe` |
| 12 апр | **0.3.0** | **Секвойя** | Браузер (десктоп уже зовут) | Календарь, Settings 2, GrowthKit2; решение собрать всё в десктоп |
| 10 мая | **0.3.5** | линия Секвойи | README про десктоп | Плагины, автообновление, Weather |
| 11–13 мая | **0.4.0** | **Кокос** | **Electron** в этом репо | Переезд десктопа; веб-страницы уходят; песочница плагинов |
| 30 мая | **1.1.0** | **Кипарис** | Electron | Поиск, живые шорткаты, ZIP, тема Cypress |
| 9 июл | **1.7.0** | **Липа** | Win · macOS · Linux | Онбординг, день милости, sha256, все платформы |
| 13 июл+ | **2.0.x–2.1.x** | **Рябина** | Electron | Графит, PLE1, расписания; UX сада и критичные фиксы |

```
статика → Клён (браузер) → Осина (IDB + соседний Desktop)
    → Секвойя (календарь · развилка) → Кокос (один Electron-дом)
    → Кипарис → Липа → Рябина
```

---

## До Клёна — март 2026

**29 марта 2026** репозиторий был почти обещанием: initial commit, затем крошечная статическая страница — `index.html`, `style.css`, пустой `script.js` и слова **«Plant a new habit»**. Сетка сада без фреймворка.

Через несколько дней появился Vite. Метафора уже звучала ясно: привычки должны *расти*, а не только отмечаться галочкой.

Electronа ещё не было. Установщика не было. Cultiva открывали как обычный фронтенд: вкладка браузера и часто локальный сервер, который поднимаешь сам (`vite`, порт **3000**). Честное начало — страницы, а не ярлык в меню «Пуск».

---

## Клён · Maple 0.1 — семя в браузере

**Теги:** `0.1.0-Maple` (4 апр) · `0.1.5-Maple` (5 апр)  
**Форма:** Vite MPA — `index.html` + `landing.html`  
**Хранилище:** JSON в `localStorage`

### Чем запомнилась
Момент, когда Cultiva *стала* собой. Спокойная оболочка в духе Apple и игровое сердце: пять стадий до **Legacy на 365 дней**.

### Появилось впервые
- Семя → Росток → Растение → Дерево → **Legacy**
- **Сад трофеев**
- Режим фокуса · аватары · Light / Dark / Auto
- Календарь вкладов и стрики
- Полный **английский / русский** без перезагрузки
- Лендинг, changelog, error-страницы, ранний онбординг
- Лимит **девяти** активных привычек
- Уже тогда слоган: *Grow your habits. Grow yourself.*

### 0.1.5 — всё ещё Клён, уже шире
Категории с пятнадцатью цветами · загрузка фото аватара · правки стриков для quantity · **GitHub Pages** · зачатки **auth** (пользователи в localStorage) · переименование пакета `cultiva-v2` → `cultiva` · MIT в ту эпоху.

### Ощущение
Браузерный сад после `npm run dev`. Личный, красивый, ещё хрупкий — как всё на чистом localStorage — но метафора уже была целой.

### Чего ещё не было
Ни Electron, ни настоящего IndexedDB. «PWA» мелькала в ранних мечтах, не в поставке.

---

## Осина · Aspen 0.2 — корни, аккаунты и первый десктоп

**Теги:** `0.2.0-Aspen` · `0.2.1-Aspen`  
**Движки:** CoreV2 · **GrowthKit** · **IBD2**

### Чем запомнилась
**Корни под почвой.** Привычки перестали жить только россыпью JSON. Аккаунты и IndexedDB сделали сад устойчивым — и почти тогда же появился **нативный Windows-билд** в соседнем доме.

### В этом репозитории (0.2.0)
- Опциональные **аккаунты**, привычки с привязкой к пользователю  
- **IndexedDB** `cultiva_v2_db` — habits, settings, users, sessions  
- Восстановление сессии после обновления страницы  
- Миграция с localStorage и запасной путь, если IDB недоступна  
- GrowthKit как имя движка стриков  
- Архив старых Maple в changelog  

### 0.2.1 на веб-линии
Страницы Tips и Privacy · темы Pink и Moon · ESLint / CI.

### Aspen Desktop — параллельная история (≈ 8 апр 2026)
Пока этот репозиторий оставался **Vite-приложением в браузере**, соседний **[CultivaDesktop](https://github.com/krwg/CultivaDesktop)** выпустил первую **нативную Windows**-Cultiva: Electron 30, установщик и portable, иконка в панели задач, без телеметрии. Позже это звали **«[0.2.1] Aspen Desktop»**.

Осина — двойная память: **корни в базе** на веб-линии и **первый раз, когда Cultiva ставится как настоящее приложение**.

---

## Секвойя · Sequoia 0.3 — фундамент и развилка

**Тег:** `0.3.0-Sequoia` (12 апр 2026)  
**Девиз релиза:** *The foundation update. Refined, rebuilt, and ready to grow.*  
**Движки:** GrowthKit**2** · Settings **2**

### Чем запомнилась
Высота. Cultiva перестала быть только сеткой сада. В комнату вошло **время**. Настройки стали спокойным двухколоночным листом. А за скриншотами — человеческое решение: **сайт больше не центр тяжести**.

### Появилось впервые (0.3.0)
- **Календарь** — месяц / неделя / день; события с цветами и заметками; синхрон с привычками; часовые пояса; праздники пяти стран; 12/24 часа  
- **Settings 2** — боковая панель: Профиль, Внешний вид, Сад, Календарь, Данные, О проекте  
- **GrowthKit2** — аккуратные стрики, таймзоны, модель «на вырост»  
- Tips · Privacy · лендинг с призывом к десктопу  
- Новые темы и ранний ambient  

### Решение, которое всё ещё слышно

Изначально центром должен был быть веб; десктоп — дополнением. Два продукта в одиночку — тяжело; вебу до «настоящего 1.0» было далеко. Десктоп можно скачать и пользоваться сразу. Поэтому веб пометили к архиву, а **CultivaDesktop** — к переезду в **krwg/Cultiva**. Один дом. Здесь.

Лендинг Секвойи уже вёл на Windows-загрузки и говорил о Cultiva Desktop как о настоящем. Браузерный сад ещё существовал — но сердце проекта поворачивалось к приложению, которое ставят.

### До и после — форма жизни
| До | После (курс задан здесь, завершён в Coconut) |
|----|-----------------------------------------------|
| Страницы в браузере | Десктопное приложение |
| Часто: сам поднимаешь сервер | Скачал Setup или Portable |
| Веб-репо + Desktop-репо | Один дом Cultiva (завершено в мае) |

### 0.3.5 (10 мая) — три релиза намерения
Сам тег в основном обновил README и шаблоны issues, но рассказал большую историю: плагины из настроек, первый официальный **Weather**, автообновления, новые темы и фоны. Код этой жизни уже жил — или вот-вот должен был жить — на **десктопной** линии. Веб-тег подтягивал слова к продукту, который люди должны были ставить.

---

## Кокос · Coconut 0.4 — один репозиторий, один десктопный сад

**Тег:** `0.4.0` · **CoreV3** · подпись: *Coconut Desktop*

### Чем запомнилась
Переезд. **11 мая 2026** коммит `migrating a project from a backup` принёс **отдельную Electron-линию** в `krwg/Cultiva` — практическое слияние CultivaDesktop с главным домом. Старые vite-страницы лендинга, tips, privacy, changelog отошли. Душа сада осталась; оболочка стала приложением.

Даже git это помнит: у Maple→0.3.5 и у Coconut→сегодня нет общего merge-base. Две эпохи, одно имя.

### Появилось / укрепилось здесь
Electron, NSIS Setup и Portable · песочница плагинов · safeStorage · темы Orchard / Honeycrisp / Inkwell… · общие ambient на саде и календаре · «Моё фото…» · нативные уведомления · устойчивее автоапдейт · нормальный log для quantity-привычек.

### Что ушло
Браузерная «витрина» как главный способ жить с Cultiva. Больше не «открой репозиторий и подними сервер», а «скачай Cultiva».

### Что стало лучше
Один репозиторий. Одна модель в голове. Офлайн-first с двумя выбранными дверями наружу: обновления и плагины.

---

## Кипарис · Cypress 1.1 — первый сезон 1.x

**Тег:** `v1.1.0` (30–31 мая 2026) · GPL-3.0 · `cultiva.release.json`

### Чем запомнилась
Дыхание **1.x**. Вечнозелёное спокойствие. Руки на клавиатуре. Бэкап одним ZIP.

### Появилось впервые
Тема **Cypress** · фоны Cypress Drift / Morning Dew / Canopy Sunbeam · акцент и интенсивность · **поиск** · **живые** шорткаты · ZIP рядом с JSON · разбор electron main на модули · ранний Vitest.

### Что стало лучше
Можно оставаться в потоке. Атмосфера настраивается. Проект говорит о себе как о том, что выпускает сезоны — не только эксперименты.

---

## Липа · Linden 1.7 — каждая платформа, каждый вечер

**Тег:** `1.7.0` (9 июля 2026)

### Чем запомнилась
Сад, который любили на Windows, стал **гражданином рабочего стола** везде: Windows, macOS, Linux. Онбординг ведёт, а не давит.

### Появилось впервые
Мастер первого запуска · шаблоны · день милости стрика · статистика · iCal · автобэкапы · превью импорта · sha256 плагинов · F1 · Linden / Linden Bloom · SECURITY и соседние docs · Vitest и Dependabot в CI.

### Что стало лучше
Точечные обновления карточек · ленивая загрузка · свои диалоги · Electron 40 / Vite 6.

### Что ушло
Системные `alert`/`confirm` как главный голос. Мысль, что десктоп = только Windows.

---

## Рябина · Rowan 2.0 и патчи — графит и забота

**2.0.0** — графит Rowan и Birch · Rowan Cluster · **PLE1** (темы, фоны, звуки, настройки от плагинов) · расписания и напоминания · трей · рельс календаря · спринт производительности.  
**2.0.1** — вечер на macOS.  
**2.0.2** — привычки не сиротеют после календаря; плагины снова стартуют.  
**2.1.0** — теплокарта сада, пауза/архив, карточка Legacy, иконки Windows.  
**2.1.1** — мягкое «Обновить сад», безопасный flush, центрированный подвал, тоггл активности.

Офлайн-first и без телеметрии — как обещали у Секвойи: один дом, инструмент, который скачивают.

---

## Что не ушло

| Обещание | Зачем |
|----------|--------|
| **Офлайн-first** | Сад на вашем устройстве |
| **Визуальный рост** | Прогресс без лекции |
| **Legacy на 365** | Год становится реликвией |
| **EN + RU** | Два языка, один продукт |
| **Без телеметрии** | Внимание остаётся вашим |
| **Открытая лицензия** | Код остаётся общим |

Фичи меняются. Метафора — нет: посади, приходи, смотри, как растёт.

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
