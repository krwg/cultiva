# Cultiva Progress

**A quiet history of the garden**  
*From Maple to Rowan · April–July 2026*

This is one place to read the whole story — not every changelog line, but the *feeling* of each era: what arrived first, what stepped aside, what became kinder, and what each version is remembered for.

| | |
|:--|:--|
| **Latest** | [2.1.1 Rowan](https://github.com/krwg/cultiva/releases/tag/2.1.1) |
| **Philosophy** | Offline-first · No telemetry · Habits you can *see* grow |
| **License** | GPL-3.0 |

---

<details>
<summary><strong>Contents · Содержание</strong></summary>

**English**
1. [Opening](#opening--a-garden-that-stays-with-you)
2. [Timeline at a glance](#timeline-at-a-glance)
3. [Maple · 0.1](#maple--01--the-seed)
4. [Aspen · 0.2](#aspen--02--roots-and-accounts)
5. [Sequoia · 0.3](#sequoia--03--calendar-and-height)
6. [Coconut · 0.4](#coconut--04--atmosphere-and-plugins)
7. [Cypress · 1.1](#cypress--11--shortcuts-and-evergreen)
8. [Linden · 1.7](#linden--17--every-platform-every-evening)
9. [Rowan · 2.0](#rowan--20--graphite-extensible-still-offline)
10. [Rowan patches · 2.0.1–2.1.1](#rowan-patches--201--211--polish-and-care)
11. [What never left](#what-never-left)
12. [Where to go next](#where-to-go-next)

**Русский**
1. [Вступление](#вступление--сад-который-остаётся-с-вами)
2. [Лента времени](#лента-времени)
3. [Клён · Maple](#клён--maple-01--семя)
4. [Осина · Aspen](#осина--aspen-02--корни-и-аккаунты)
5. [Секвойя · Sequoia](#секвойя--sequoia-03--календарь-и-высота)
6. [Кокос · Coconut](#кокос--coconut-04--атмосфера-и-плагины)
7. [Кипарис · Cypress](#кипарис--cypress-11--горячие-клавиши-и-вечнозелёное)
8. [Липа · Linden](#липа--linden-17--каждая-платформа-каждый-вечер)
9. [Рябина · Rowan 2.0](#рябина--rowan-20--графит-расширяемость-всё-ещё-офлайн)
10. [Патчи Rowan](#патчи-rowan--201--211--полировка-и-забота)
11. [Что не ушло](#что-не-ушло)
12. [Куда дальше](#куда-дальше)

</details>

---

# English

## Opening — a garden that stays with you

Cultiva began as a simple idea: habit tracking should feel like **tending something living**, not filling a spreadsheet. Five visual stages — Seed, Sprout, Plant, Tree, Legacy — turn consistency into something you can glance at on a quiet evening and understand without a dashboard lecture.

Every major version has a **codename** taken from a tree. The metaphor is intentional. Releases are not just numbers; they are seasons. Some seasons plant new systems. Some prune. Some only water what was already there — and somehow, that care is what you remember most.

This document walks those seasons in order. It is warmer than a changelog, clearer than a marketing page, and meant to be read slowly — like notes left on a kitchen table for anyone who wants to know *how we got here*.

---

## Timeline at a glance

| Era | Version | Codename | Remembered for |
|-----|---------|----------|----------------|
| Spring ’26 | **0.1.x** | Maple | The first garden — growth stages, trophy trees, EN/RU, local JSON |
| Early | **0.2.x** | Aspen | Accounts, IndexedDB, GrowthKit streaks |
| Mid | **0.3.x** | Sequoia | Calendar, Settings 2, plugins & auto-update |
| Late spring | **0.4.x** | Coconut | Ambient layers, richer themes, safer plugins, Windows polish |
| May | **1.1.0** | Cypress | Search, shortcuts, ZIP backup, evergreen look |
| July | **1.7.0** | Linden | True multi-platform, onboarding, grace day, sha256 plugins |
| July | **2.0.0** | Rowan | Graphite UI, PLE1 contributions, schedules, tray |
| July | **2.0.1–2.0.2** | Rowan | macOS & data-integrity patches |
| July | **2.1.0–2.1.1** | Rowan | Windows garden UX + critical reload/storage fixes |

```
Maple → Aspen → Sequoia → Coconut → Cypress → Linden → Rowan
  seed     roots    canopy     weather     keys      world      graphite
```

---

## Maple · 0.1 — the seed

**Released:** April 2026 · Tags `0.1.0-Maple`, `0.1.5-Maple`

### Remembered for
The moment Cultiva *became* Cultiva. A minimalist, Apple-inspired shell with a gamified heart: habits that **look** like they grow.

### First appeared
- Five growth stages → **Legacy at 365 days**
- **Trophy Garden** for trees that made it
- Focus Mode, custom avatars, light / dark / auto
- Per-habit contribution calendar & streak stats
- Local JSON backup — no cloud required
- Full **English / Russian** switching without reload

### What it felt like
Clean. A little ambitious. The kind of first release that already knows its metaphors.

### Quietly set in stone
Offline-first. Visual growth. Bilingual from day one. Those three threads still run through 2.1.x.

---

## Aspen · 0.2 — roots and accounts

**Released:** April 2026 · Tags `0.2.0-Aspen`, `0.2.1-Aspen`

### Remembered for
Moving the garden from “a beautiful page” to **durable local software** — storage with real ownership boundaries, and the first GrowthKit streak engine.

### First appeared
- Optional **user accounts** (salted SHA-256) with user-scoped data
- **IndexedDB** as the primary home for habits
- GrowthKit: streaks and gamified progress plumbing
- Early multi-page shell & theme expansion

### What got better
Persistence stopped being “hope the browser remembers.” Sessions and gardens could survive restarts with clearer identity.

### What stepped aside
Pure “open a file and hope” as the mental model — IDB became the quiet backbone (localStorage stayed as a helpful mirror for years of patches to come).

---

## Sequoia · 0.3 — calendar and height

**Released:** April–May 2026 · Tags `0.3.0-Sequoia`, `0.3.5`

### Remembered for
Cultiva growing **tall**: a real calendar, a second generation of settings, plugins, and the first auto-update path.

### First appeared
- Dedicated **Calendar** experience
- **Settings 2** — structured, sectioned preferences
- **GrowthKit2** refinements
- Plugin surface & **auto-updates** (0.3.5)
- Broader theme families (Sequoia among them)

### What got better
The app stopped being only a garden grid. Time — days, events, planning — entered the room.

### Trade-offs of growing up
More surface area meant more places for polish. Later Linden and Rowan would spend evenings making that surface feel calm again.

---

## Coconut · 0.4 — atmosphere and plugins

**Released:** May 2026 · Tag `0.4.0`

### Remembered for
How Cultiva *feels* on screen: ambient motion shared between garden and calendar, grouped light/dark themes, and plugins that run with clearer boundaries.

### First appeared / blossomed
- Ambient presets: Petal Drift, Silicon Mist, Ember Glow, Breeze Glass…
- **Custom photo** backgrounds stored locally
- Theme grouping (light / dark / auto) with names like Orchard, Honeycrisp, Inkwell
- Notifications & plugin refinements
- Windows shipping fixes (including portable installers)

### What got better
Atmosphere stopped being decoration glued to one page. Garden and calendar shared the same sky.

### What people kept
“My Photo…” — still one of the most personal touches in the app.

---

## Cypress · 1.1 — shortcuts and evergreen

**Released:** 2026-05-30 · Tag `v1.1.0`

### Remembered for
The first **1.x** breath after the 0.x forest: Cypress green, keyboard fluency, and backups you can carry in one ZIP.

### First appeared
- Theme **Cypress** + backgrounds: Cypress Drift, Morning Dew, Canopy Sunbeam
- Accent color & ambient intensity
- Habit **search** (`Ctrl/Cmd+F`)
- Keyboard shortcuts for plant / settings / complete / log
- **ZIP** export beside JSON
- Version source of truth: `cultiva.release.json`

### What got better
Power users could stay in flow without hunting the mouse. Atmosphere became tunable, not just on/off.

### What left the foreground
The “everything is 0.x experiment” feeling — Cypress quietly said: this is a product that ships seasons.

---

## Linden · 1.7 — every platform, every evening

**Released:** 2026-07-09 · Tag `1.7.0`  
**Registry:** cultiva-plugins **3.0.2**

### Remembered for
**“More. Faster. On Every Platform.”** Linden is the release that took Cultiva from a Windows-loved garden to a **desktop citizen** on Windows, macOS, and Linux — with a first-run wizard that guides instead of overwhelms.

### First appeared
- First-run **onboarding** (language, theme, timezone, first habit, backup opt-in)
- Habit **templates** (Read, Exercise, Meditate, Water, Journal)
- Optional **streak grace day** (one skip per month)
- **Statistics** dashboard (weekly / monthly trends)
- **iCal** export · rotating **auto-backups** (7) · import **preview**
- Plugin **sha256** enforcement · sandbox permissions · `cultiva-plugin.d.ts`
- Native shell chrome, F1 contextual help, context menus, delayed tooltips
- Theme **Linden** · ambient **Linden Bloom**
- GitHub Pages landing · CONTRIBUTING / SECURITY / CODE_OF_CONDUCT / SUPPORT
- CI Vitest battery · Dependabot · `npm audit`

### What got better
- Incremental garden card updates (not a full DOM rebuild)
- Deferred lazy loads (plugins, stats, Discord, updates)
- Custom dialogs instead of native `alert` / `confirm`
- Electron 40 · Vite 6 · clearer GPL-3.0 licensing in the README

### What left / was replaced
- Native browser dialogs for confirmations
- The idea that “desktop” meant Windows-only forever

### Numbers that still feel warm
~285 EN/RU string pairs · 18 themes · 13 ambients · 7 install formats · **0** required accounts or telemetry.

Linden is the evening you realize the garden travels with you — Dock, AppImage, or Start Menu.

---

## Rowan · 2.0 — graphite, extensible, still offline

**Released:** 2026-07-13 · Tag `2.0.0`  
**Companion:** PLE1 · CoreV6 · GrowthKit3 · IDB3

### Remembered for
**“Graphite. Extensible. Still Offline.”** The largest creative leap since Linden: a strict black-and-white **Rowan** identity, plugins that can ship **themes and backgrounds**, and habits that finally understand **schedules and reminders**.

### First appeared
- **Rowan** theme (`#0b0b0b` / `#f4f4f4`) · **Birch** light monochrome
- **Rowan Cluster** canvas ambient — trembling branches, berry probes, radar rings
- **PLE1 contributions** — `registerTheme` / `registerBackground` / `registerSound` / Settings nav
- Habit **schedules** (daily · weekdays · N×/week) · per-habit **native reminders**
- System **tray** quick-complete · hide-to-tray
- Calendar **plugin rail** · expanded RPC (~57 allowlisted methods)
- Completion **undo** · CSV export · raised active habit slots (**12**)
- Performance sprint: lazy CSS chunks, ambient pause when hidden, coalesced IDB writes

### What got better
Plugin store became product-like: full descriptions, min-version badges, Get → Install from local history. Cold start felt lighter. The garden updated in smaller, calmer strokes.

### What left the catalog
Redundant registry plugins (**streak**, **focus-session**) were pruned so the shelf stayed intentional.

### What stayed sacred
Still no telemetry. Still no cloud lock-in. Extensibility without surrendering the offline soul.

Rowan is the night the lights dim to graphite — and the plugins start bringing their own weather.

---

## Rowan patches · 2.0.1–2.1.1 — polish and care

Small version numbers. Large kindness.

### 2.0.1 — macOS evening
- i18n / Russian locale applying immediately  
- Rowan Cluster resume after mount  
- Ghost windows & dock/tray lifecycle  
- Auto-updater restart reliability  
- Branded macOS **DMG** background & volume icon  

*Remembered for:* making the graphite build feel *at home* on Apple silicon and Intel Macs.

### 2.0.2 — trust restored
- Habits no longer orphan after calendar navigation (`userId` preservation)  
- Plugins start again (CSP `unsafe-eval` for the sandbox — documented in SECURITY)  
- macOS close no longer leaves a zombie process  
- Storage flush before garden ↔ calendar navigation  

*Remembered for:* the patch you install so the garden **doesn’t vanish** when you open the calendar.

### 2.1.0 — Windows garden UX
- Calendar **all-habits heatmap** (GitHub-style year)  
- **Paused / archived** section with resume & restore  
- **Next Legacy tree** card when Trophy Garden is empty  
- NSIS branding synced to Rowan · Windows icon reliability  
- Footer trimmed to version only  

*Remembered for:* the Windows patch that made the empty Trophy Garden hopeful again — and the calendar show the whole grove at once.

### 2.1.1 — critical care
- **Reload garden** soft-refresh + storage recovery (no more wiped list on Ctrl+R)  
- Habit write **snapshot flush** · empty mirrors can’t clobber good backups  
- Compact, **centered** footer (garden + calendar)  
- Settings toggle for **Garden activity** heatmap  

*Remembered for:* the quiet fix that protects the garden when you only meant to refresh the view.

---

## What never left

Across every codename, a few promises held:

| Promise | Why it matters |
|---------|----------------|
| **Offline-first** | Your garden is a file on *your* machine |
| **Visual growth** | Progress you can feel without a lecture |
| **Legacy at 365** | A finish line that becomes a keepsake |
| **EN + RU** | Two languages, one product |
| **No telemetry** | Attention stays yours |
| **GPL-3.0** | The code remains a commons |

Features come and go. The metaphor does not.

---

## Where to go next

| | |
|:--|:--|
| **Download** | [Latest release](https://github.com/krwg/cultiva/releases/latest) |
| **Changelog** | [CHANGELOG.md](CHANGELOG.md) |
| **Per-release notes** | [docs/](docs/) |
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

## Вступление — сад, который остаётся с вами

Cultiva началась с простой мысли: трекер привычек должен ощущаться как **уход за живым**, а не как таблица. Пять стадий — Семя, Росток, Растение, Дерево, Legacy — превращают постоянство в то, на что можно взглянуть тихим вечером и сразу понять, без лекции от дашборда.

У каждой большой версии есть **кодовое имя дерева**. Это не украшение. Релизы — сезоны: одни сажают системы, другие обрезают лишнее, третьи только поливают то, что уже растёт — и именно эту заботу чаще всего запоминают.

Этот файл — история сезонов целиком. Теплее changelog’а, яснее рекламной страницы. Его можно читать медленно — как записку на кухонном столе для тех, кому важно знать, *как мы сюда пришли*.

---

## Лента времени

| Эпоха | Версия | Имя | Чем запомнилась |
|-------|--------|-----|-----------------|
| Весна ’26 | **0.1.x** | Клён / Maple | Первый сад — стадии роста, трофеи, EN/RU, локальный JSON |
| Ранняя | **0.2.x** | Осина / Aspen | Аккаунты, IndexedDB, стрики GrowthKit |
| Середина | **0.3.x** | Секвойя / Sequoia | Календарь, Settings 2, плагины и автообновление |
| Поздняя весна | **0.4.x** | Кокос / Coconut | Атмосфера, темы, безопаснее плагины, Windows |
| Май | **1.1.0** | Кипарис / Cypress | Поиск, шорткаты, ZIP, вечнозелёный вид |
| Июль | **1.7.0** | Липа / Linden | Все платформы, онбординг, день милости, sha256 |
| Июль | **2.0.0** | Рябина / Rowan | Графит, PLE1, расписания, трей |
| Июль | **2.0.1–2.0.2** | Rowan | Патчи macOS и целостности данных |
| Июль | **2.1.0–2.1.1** | Rowan | UX сада на Windows + критичные фиксы reload |

```
Клён → Осина → Секвойя → Кокос → Кипарис → Липа → Рябина
 семя    корни    крона     погода    клавиши   мир     графит
```

---

## Клён · Maple 0.1 — семя

**Релиз:** апрель 2026

### Чем запомнилась
Момент, когда Cultiva *стала* собой. Минималистичная оболочка в духе Apple и игровое сердце: привычки, которые **выглядят** растущими.

### Появилось впервые
- Пять стадий роста → **Legacy на 365 дней**
- **Сад трофеев** для тех, кто дошёл
- Режим фокуса, аватары, светлая / тёмная / авто
- Календарь вкладов и статистика стриков
- Локальный JSON-бэкап без облака
- Полный **английский / русский** без перезагрузки

### Ощущение
Чисто. Немного смело. Первый релиз, который уже знает свои метафоры.

### Что осталось навсегда
Офлайн-first. Визуальный рост. Два языка с первого дня.

---

## Осина · Aspen 0.2 — корни и аккаунты

### Чем запомнилась
Переход от «красивой страницы» к **надёжному локальному ПО** — хранилище с границами владения и первый движок стриков GrowthKit.

### Появилось впервые
- Опциональные **аккаунты** и данные по пользователю
- **IndexedDB** как основной дом привычек
- GrowthKit: стрики и прогресс
- Ранний многостраничный shell и расширение тем

### Что стало лучше
Данные перестали жить на «надежде браузера». Сад переживает перезапуски яснее.

### Что отошло на второй план
Модель «просто открой файл и молись» — IDB стала тихим каркасом (localStorage остался зеркалом — и героем многих поздних патчей).

---

## Секвойя · Sequoia 0.3 — календарь и высота

### Чем запомнилась
Cultiva **вытянулась вверх**: настоящий календарь, второе поколение настроек, плагины и первый путь автообновления.

### Появилось впервые
- Отдельный **Календарь**
- **Settings 2** — структурированные разделы
- **GrowthKit2**
- Плагины и **auto-update** (0.3.5)
- Семейства тем, включая Sequoia

### Что стало лучше
Приложение перестало быть только сеткой сада. В комнату вошло **время**.

### Цена взросления
Больше поверхностей — больше мест для полировки. Linden и Rowan потом долгими вечерами возвращали спокойствие.

---

## Кокос · Coconut 0.4 — атмосфера и плагины

### Чем запомнилась
То, как Cultiva *ощущается* на экране: общее ambient-небо у сада и календаря, собранные светлые/тёмные темы, плагины с более ясными границами.

### Расцвело
- Пресеты: Petal Drift, Silicon Mist, Ember Glow, Breeze Glass…
- **Своё фото** как фон — локально
- Группы тем (Orchard, Honeycrisp, Inkwell…)
- Уведомления и доработка плагинов
- Полировка Windows-сборок (в т.ч. portable)

### Что стало лучше
Атмосфера перестала быть украшением одной страницы.

### Что люди сохранили
«Моё фото…» — до сих пор одна из самых личных деталей.

---

## Кипарис · Cypress 1.1 — горячие клавиши и вечнозелёное

**Релиз:** 30 мая 2026

### Чем запомнилась
Первый вдох **1.x** после леса 0.x: кипарисовая зелень, свобода от мыши и бэкап одним ZIP.

### Появилось впервые
- Тема **Cypress** и фоны Cypress Drift / Morning Dew / Canopy Sunbeam
- Акцент и интенсивность атмосферы
- **Поиск** привычек (`Ctrl/Cmd+F`)
- Горячие клавиши: посадить / настройки / отметить / записать
- Экспорт **ZIP** рядом с JSON
- Источник версии: `cultiva.release.json`

### Что стало лучше
Можно оставаться в потоке. Атмосфера настраивается, а не только включается.

### Что ушло с переднего плана
Ощущение вечного «0.x-эксперимента» — Cypress тихо сказала: теперь это продукт с сезонами.

---

## Липа · Linden 1.7 — каждая платформа, каждый вечер

**Релиз:** 9 июля 2026  
**Реестр:** cultiva-plugins **3.0.2**

### Чем запомнилась
**«Больше. Быстрее. На каждой платформе.»** Linden вывела сад из «любимого Windows-приложения» в **гражданина рабочего стола** — Windows, macOS, Linux — с онбордингом, который ведёт, а не давит.

### Появилось впервые
- Мастер **первого запуска**
- **Шаблоны** привычек
- Опциональный **день милости** стрика
- **Статистика** по неделям и месяцам
- Экспорт **iCal** · автобэкапы (**7**) · превью импорта
- Проверка плагинов по **sha256** · песочница · `cultiva-plugin.d.ts`
- F1-справка, контекстное меню, нативная оболочка
- Тема **Linden** · фон **Linden Bloom**
- Лендинг на GitHub Pages · SECURITY / CONTRIBUTING / CoC
- Vitest в CI · Dependabot · `npm audit`

### Что стало лучше
- Карточки сада обновляются точечно
- Ленивая загрузка тяжёлых экранов
- Свои диалоги вместо системных `alert` / `confirm`
- Electron 40 · Vite 6 · явная GPL-3.0 в README

### Что ушло
Системные confirm-диалоги. Идея, что «десктоп» = только Windows.

### Тёплые цифры
~285 пар строк EN/RU · 18 тем · 13 фонов · 7 форматов установки · **0** обязательных аккаунтов и телеметрии.

Linden — вечер, когда понимаешь: сад ездит с тобой — в Dock, AppImage или меню «Пуск».

---

## Рябина · Rowan 2.0 — графит, расширяемость, всё ещё офлайн

**Релиз:** 13 июля 2026  
**Движки:** PLE1 · CoreV6 · GrowthKit3 · IDB3

### Чем запомнилась
**«Графит. Расширяемость. Всё ещё офлайн.»** Самый большой творческий шаг со времён Linden: строгая чёрно-белая **Rowan**, плагины со своими **темами и фонами**, привычки с **расписанием и напоминаниями**.

### Появилось впервые
- Тема **Rowan** · светлая **Birch**
- Фон **Rowan Cluster** — дрожь ветвей, ягодные «радары»
- **Вклады плагинов** — темы, фоны, звуки, пункты настроек
- **Расписания** и нативные **напоминания**
- **Трей** с быстрым «готово» · скрытие в трей
- Рельс плагинов в календаре · ~57 RPC-методов
- Отмена отметки · CSV · до **12** активных привычек
- Спринт производительности: чанки CSS, пауза ambient, пакетные записи IDB

### Что стало лучше
Магазин плагинов стал «продуктовым». Холодный старт легче. Сад обновляется спокойнее.

### Что ушло из каталога
Лишние плагины **streak** и **focus-session** — полка стала намеренной.

### Что осталось святым
Без телеметрии. Без облачного замка. Расширяемость без потери офлайн-души.

Rowan — ночь, когда свет гаснет до графита, а плагины приносят свою погоду.

---

## Патчи Rowan · 2.0.1–2.1.1 — полировка и забота

Маленькие номера. Большая доброта.

### 2.0.1 — вечер на macOS
Локали без `undefined`, оживление Rowan Cluster, призрачные окна и Dock/tray, надёжный автоапдейт, брендированный **DMG**.

*Запомнилась тем,* что графит наконец почувствовал себя дома на Mac.

### 2.0.2 — восстановленное доверие
Привычки больше не «сиротеют» после календаря, плагины снова стартуют, закрытие на macOS не оставляет зомби, сброс записей перед навигацией сад ↔ календарь.

*Запомнилась тем,* что сад **не исчезает**, когда открываешь календарь.

### 2.1.0 — UX сада на Windows
Теплокарта **всех** привычек за год, секция **паузы/архива**, карточка **следующего Legacy**, брендинг NSIS и иконки, компактный подвал.

*Запомнилась тем,* что пустой сад трофеев снова даёт надежду — а календарь показывает всю рощу сразу.

### 2.1.1 — критичная забота
Мягкое «Обновить сад» с восстановлением данных, безопасный flush, центрированный подвал, тоггл **Активности сада**.

*Запомнилась тем,* что бережёт сад, когда вы хотели лишь обновить вид.

---

## Что не ушло

Сквозь все имена деревьев держались обещания:

| Обещание | Зачем |
|----------|--------|
| **Офлайн-first** | Сад — на *вашем* устройстве |
| **Визуальный рост** | Прогресс без лекции |
| **Legacy на 365** | Финиш, который становится реликвией |
| **EN + RU** | Два языка, один продукт |
| **Без телеметрии** | Внимание остаётся вашим |
| **GPL-3.0** | Код остаётся общим |

Фичи приходят и уходят. Метафора — нет.

---

## Куда дальше

| | |
|:--|:--|
| **Скачать** | [Последний релиз](https://github.com/krwg/cultiva/releases/latest) |
| **Changelog** | [CHANGELOG.md](CHANGELOG.md) |
| **Заметки релизов** | [docs/](docs/) |
| **Лендинг** | [krwg.github.io/cultiva](https://krwg.github.io/cultiva/) |
| **Плагины** | [cultiva-plugins](https://github.com/krwg/cultiva-plugins) |
| **Wiki** | [Wiki проекта](https://github.com/krwg/cultiva/wiki) |

*С заботой — [krwg](https://github.com/krwg). Растите привычки. Растите себя.*

---

<div align="center">

*Maple → Aspen → Sequoia → Coconut → Cypress → Linden → Rowan*  
*Клён → Осина → Секвойя → Кокос → Кипарис → Липа → Рябина*

**Cultiva Progress** · one garden, many seasons

</div>
