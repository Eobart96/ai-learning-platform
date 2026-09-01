# Project report

## Current summary — 2026-09-01

Все 14 тем Module 1, их материалы, упражнения и тесты вручную проверены и
одобрены владельцем; приёмка Module 1 завершена. Публичное название продукта
изменено на **SlovoKrok** в UI, metadata, launcher, backend metadata и
актуальной документации. GitHub repository URL, npm package name,
browser-storage keys, API routes, lesson slugs, activity IDs и физические
SQLite table names намеренно сохранены. Следующий продуктовый этап — Module 2.

## Previous summary — 2026-08-30

Начато архитектурное расширение в форме модульного монолита. До изменений
созданы и проверены snapshot текущих 193 кандидатных файлов и Git bundle
полной истории. Первый behavior-preserving шаг завершён: проверка ответов,
парных заданий, закрепления и итоговых вопросов вынесена из React-компонента в
чистый `frontend/app/data/coursePractice.ts`; UI, API, SQLite, compatibility
ключи и activity ID не менялись.

Подтверждено: content/TypeScript validation, Playwright `29 passed`, Next.js
production build, backend `11 passed` и compileall. Следующий архитектурный
шаг — typed actions для CourseState и отделение persistence/hydration от
`CourseScreen.tsx` без перехода на новую схему хранения.

## Earlier summary — 2026-08-29

Все 83 темы Modules 1–8 разделены на самостоятельные файлы с общими фабриками
и индексами порядка для каждого модуля. Активные компоненты, типы,
CSS, frontend route и FastAPI route переименованы из временной схемы в универсальную
`Course*`; API теперь расположен под `/api/v1/course/*`. Физические имена
существующих SQLite-таблиц и прежние browser-storage key не мигрировались и
сохранены ради прогресса.

Проверки этапа: content/TypeScript validation, Next.js build, backend
`11 passed` и compileall проходят. Playwright: 22 из 23 проходят; единственная
ошибка — существующее содержательное ожидание для ответа `žena` в теме
`soft-hard-consonants`, не связанное с архитектурным разделением.

## Earlier summary — 2026-08-28

Modules 3–4 сверены с PDF владельца и больше не являются общими техническими
черновиками. Module 4 перенесён из 11 PDF объёмом 77 страниц в общий
data-driven runtime без изменения slug и существующих `m4-*` activity ID.
Ручная лингвистическая/UI-приёмка владельцем назначена на следующую сессию;
до неё Modules 3–4 не считаются окончательно принятыми. Modules 5–6 остаются
следующими на содержательный аудит. Открытые security-задачи по прежнему
credential и frontend dependency advisories не изменились.

## Checkpoint — приёмка Module 1 и бренд SlovoKrok, 2026-09-01

### Что изменилось и почему

- по прямому отчёту владельца все 14 тем Module 1 отмечены как проверенные и
  согласованные; материалы, упражнения, тесты и работа модуля приняты;
- публичный бренд `AI Learning Platform` заменён на **SlovoKrok** в интерфейсе,
  metadata, backend OpenAPI metadata, Windows launcher и актуальных
  пользовательских/проектных документах;
- совместимые технические идентификаторы и имя/URL GitHub-репозитория не
  изменялись;
- roadmap и checkpoint переключены на следующий продуктовый этап — Module 2;
- проектный `$a1-course-progress-tracker` сохранён как воспроизводимый способ
  учитывать следующие владельческие проверки без изменения контента.

### Проверка

| Команда или проверка | Результат |
|---|---|
| `backend/.venv/Scripts/python.exe -m pytest -q` | `11 passed`, 1 известное Starlette warning |
| `python -m compileall -q app tests` | успешно |
| `npm.cmd run validate:a1` | 8 модулей, 83 lesson-файла; TypeScript успешно |
| `npm.cmd run build` | Next.js production build успешно |
| `npm.cmd run test:ui` | `46 passed` |
| `platform.ps1 -Mode SelfTest` | launcher decision tests успешно |
| `check-repository.ps1` | 206 кандидатных файлов; запрещённых путей и credential-like значений нет |
| `python -m pip check` | broken requirements не найдены |
| `npm.cmd audit --omit=dev --audit-level=high` | выполнен; 6 high advisories, breaking-fix не применялся |
| `git diff --check` | успешно |

### Аудит и границы

- **high — открыт:** отзыв прежнего credential из Git-истории по-прежнему не
  подтверждён; значение не читалось и не переносилось в diff;
- **high — открыт:** ранее подтверждённые 6 high frontend dependency
  advisories не исправлялись в рамках переименования;
- **info — подтверждено:** `.env`, SQLite, `.ai/private/`, runtime/build output,
  recovery artifacts и локальный `tmp/` исключены из commit-кандидата;
- **info — подтверждено:** старое название сохранено только в исторических
  именах backup/repository и стабильных технических строках, где переименование
  нарушило бы совместимость или вышло бы за разрешённый scope.

### Roadmap delta и следующий checkpoint

Module 1 завершён и принят. Следующая точка входа —
`frontend/app/data/modules/module2/`: сверить и пересобрать семь тем Module 2
по документам владельца, сохраняя slugs/activity IDs, затем выполнить content
validation и релевантную ручную/UI-проверку.

---

## Checkpoint — старт архитектурного расширения, 2026-08-30

### Что изменилось и почему

- по запросу владельца в `ROADMAP.md` записан четырёхэтапный план: безопасная
  декомпозиция, идентичность/версия курса, учебные события и новые типы
  активностей;
- перед редактированием создан ZIP текущего кандидатного дерева:
  `_git-package/checkpoints/ai-learning-platform-working-tree-20260830-095300.zip`,
  193 файла, SHA-256
  `E4BA0875A1450B9A6EB1949666C73F80D3FA55C1EEB9A53270610234FBB7F312`;
- отдельно создан и `git bundle verify`-проверен полный Git bundle:
  `_git-package/checkpoints/ai-learning-platform-history-20260830-095300.bundle`,
  SHA-256
  `D769A77C29F1E797E3A86557A583E05A32CE7E8D23CF4165E18062F97D5C76BF`;
- чистые функции проверки ответов, pair compatibility, обязательной практики,
  закрепления и финальных вопросов перенесены из `CourseScreen.tsx` в
  `frontend/app/data/coursePractice.ts`;
- Playwright-тесты теперь импортируют эти функции из domain/data-модуля, а не
  из React-компонента.

### Проверка

| Команда или проверка | Результат |
|---|---|
| ZIP listing и SHA-256 | 193 из 193 кандидатных файлов, архив читается |
| `git bundle verify` и SHA-256 | полная история и 19 refs подтверждены |
| `npm.cmd run validate:a1` | успешно: 8 модулей, 83 урока, TypeScript без ошибок |
| `npm.cmd run test:ui` | `29 passed` |
| `npm.cmd run build` | Next.js production build успешно |
| `.venv\\Scripts\\python.exe -m pytest -q` | `11 passed`, 1 Starlette deprecation warning |
| `.venv\\Scripts\\python.exe -m compileall -q app tests` | успешно |
| `platform.ps1 -Mode SelfTest` | launcher decision self-tests успешно |
| `check-repository.ps1` | успешно: 194 текущих candidate-файла, запрещённых путей и credential-like значений нет |
| `git diff --check` | успешно; только предупреждения о будущей нормализации LF → CRLF |

Реальный AI-provider и ручной smoke интерфейса в этом checkpoint не
проверялись. Commit, push, PR и публикация не выполнялись.

### Audit findings

- **high — открыт, без изменений:** отзыв прежнего provider credential не
  подтверждён; значение не читалось и не копировалось;
- **high — открыт, без изменений:** последний dependency audit сообщал 6 high
  advisories; breaking-обновление не выполнялось;
- **low — открыт:** backend сохраняет Starlette deprecation warning;
- **info — подтверждено:** первый рефакторинг не меняет HTTP/SQLite/state
  contracts и покрыт существующими frontend/backend проверками.

### Roadmap delta и следующий checkpoint

- добавлены четыре архитектурных этапа, продуктовая и security-очередь не
  переупорядочена;
- backup и вынос чистой practice/assessment логики отмечены завершёнными;
- следующий старт — `frontend/app/components/CourseScreen.tsx`, блоки
  hydration/persistence и локального CourseState.

Следующие действия:

1. определить typed state/actions без изменения wire-format CourseState v1;
2. вынести restore/serialize/persistence в отдельный hook или adapter;
3. повторить Playwright/build и только затем делить feature-view.

---

## Checkpoint — пауза перед ручной проверкой Modules 3–4, 2026-08-28

### Что изменилось и почему

- runtime Modules 3–4 в этом checkpoint не менялся: зафиксирована завершённая
  техническая интеграция материалов владельца и подготовлена точка паузы;
- статус уточнён: PDF прочитаны и перенесены, автоматические проверки проходят,
  но окончательная ручная приёмка владельцем состоится в следующую сессию;
- roadmap и agent current state теперь начинают продолжение именно с проверки
  Modules 3–4, а аудит документов Modules 5–6 следует после неё.

### Проверка

- подтверждён актуальный runtime-путь `modules/moduleN/lessons/` →
  `modules/moduleN/index.ts` → `a1Course.ts` → общий экран `/`;
- последний полный набор текущего дерева: `npm.cmd run validate:a1` успешно,
  Playwright `23 passed`, `npm.cmd run build` успешно, bundled Python
  `compileall` успешно, launcher self-test и repository audit успешно;
- перед завершением checkpoint повторяются content validation, repository
  audit, `git diff --check` и `git status --short`;
- backend pytest не проверен: локальный venv ссылается на отсутствующий Python
  3.12, а в bundled Python пакет `pytest` не установлен.

### Audit findings

- **high — открыт, без изменений:** прежний provider credential в Git-истории
  не имеет подтверждённого отзыва; значение не читалось и не переносилось;
- **high — открыт, без изменений:** последний `npm audit` содержит 6 high
  advisories; автоматический breaking-переход на Next.js 16 не выполнялся;
- **low — открыт:** backend venv требует восстановления для повторного pytest;
- **info — ожидает владельца:** лингвистическая точность и удобство каждого
  урока Modules 3–4 ещё не подтверждены ручным прохождением.

### Roadmap delta и точка продолжения

Следующий старт — `/` и каталоги `frontend/app/data/modules/module3/lessons/`
и `frontend/app/data/modules/module4/lessons/`:

1. пройти все уроки Modules 3–4 и записывать замечания с указанием lesson slug;
2. проверить формулировки, нормативные ответы, порядок практик и сохранение
   прогресса;
3. внести согласованные исправления со стабильными slug/activity ID, повторить
   test matrix и только после приёмки перейти к материалам Modules 5–6.

Коммит, push, PR и публикация не выполнялись.

---

## Checkpoint — приёмка Module 4 по материалам владельца, 2026-08-28

### Источник и граница переноса

- полностью прочитаны, извлечены и визуально проверены 77 страниц из 11 PDF
  каталога `E:\Sync\Словацкий язык\Roadmap\Module 4 — Cases and Prepositions`;
- каждому PDF сопоставлен существующий урок Module 4 в исходном порядке;
- исходные PDF не копировались в репозиторий: материал адаптирован к пяти
  секциям, пяти пошаговым практикам, проверкам и итоговому заданию каждого
  урока;
- сохранена граница A1: вместо полной академической парадигмы используются
  вопросы, контрасты и частотные бытовые модели.

### Что изменилось

- Nominatív отделён от объектного Akuzatív; отдельно закреплены окончания
  существительных, полное согласование группы и местоимения после предлога;
- Lokál покрывает `v/vo`, `na` и частотные окончания единственного и
  множественного числа;
- Genitív разделён на количество, общее отсутствие через `niet` и направление
  с `do`, включая различие `domov`/`do domu`;
- добавлена карта управления Akuzatív, Lokál, Genitív, Datív и Inštrumentál,
  триады `Kde? — Kam? — Odkiaľ?` и контраст `s`/`z`;
- маршрут различает положение `naľavo/napravo` и направление
  `doľava/doprava`, вводит ориентиры, команды и последовательность шагов;
- content validator и Playwright contract test фиксируют ключевые фрагменты
  всех 11 источников; API, SQLite и интерфейс хранения прогресса не менялись.

### Проверка

| Команда или проверка | Результат |
|---|---|
| `npm.cmd run validate:a1` | успешно: 8 модулей, 83 урока, TypeScript без ошибок |
| `npm.cmd run test:ui` | `23 passed` |
| `npm.cmd run build` | production build успешно |
| bundled Python `-m compileall -q app tests` | успешно |
| `platform.ps1 -Mode SelfTest` | успешно |
| `check-repository.ps1` | успешно: запрещённых путей и credential-like значений нет |
| `git diff --check` | успешно; только предупреждения о будущей нормализации LF → CRLF |
| backend venv pytest | недоступен: venv ссылается на отсутствующий Python 3.12 |
| bundled Python pytest | недоступен: пакет `pytest` не установлен |

Временные PNG и контактные листы визуальной проверки удалены. Backend, API,
SQLite и настройки AI-provider не изменялись. Коммит, push и публикация не
выполнялись.

---

## Checkpoint — приёмка Module 3 по материалам владельца, 2026-08-28

### Источник и граница переноса

- полностью прочитаны и визуально проверены 42 страницы из шести PDF каталога
  `E:\Sync\Словацкий язык\Roadmap\Module 3 — Adjectives`;
- каждому PDF сопоставлен существующий урок Module 3 в том же порядке;
- исходные PDF не копировались в репозиторий: их содержание адаптировано к
  интерактивным секциям, практикам, проверкам и финальным заданиям;
- падежные формы из отдельных диалогов не превращались в грамматику Module 3:
  склонение остаётся зоной Module 4, а частотный вопрос о цвете явно помечен как
  готовая модель.

### Что изменилось

- добавлены вопросы `aký/aká/aké` и `akí/aké`, орфографические переходы
  `veľký → veľkí`, `rýchly → rýchli` и мягкая модель `cudzí/cudzie`;
- урок указательных и притяжательных слов приведён к материалу владельца:
  `ten/tá/to`, `tí/tie`, полные модели `môj/tvoj`, `náš/váš` и неизменяемые
  `jeho/jej/ich`;
- описание расширено до 11 цветов, шести пар размера, различия
  `nový študent`/`mladý študent`, оценочных пар и нескольких согласованных
  признаков;
- выбор и связность дополнены моделями `A a B`, `nie A, ale B`,
  `aj A, aj B` и схемой `najprv → potom → nakoniec`;
- content validator и Playwright contract test теперь фиксируют ключевые
  source-grounded фрагменты Module 3, чтобы они не потерялись при рефакторинге;
- документация обновлена: Module 3 принят, а Modules 4–6 остаются черновыми.

### Проверка

| Команда или проверка | Результат |
|---|---|
| `npm.cmd run validate:a1` | успешно: 8 модулей, 83 урока, TypeScript без ошибок |
| `npm.cmd run test:ui` | `23 passed` |
| `npm.cmd run build` | production build успешно |
| bundled Python `-m compileall -q app tests` | успешно |
| `platform.ps1 -Mode SelfTest` | успешно |
| `check-repository.ps1` | успешно: 102 candidate files, запрещённых путей и credential-like значений нет |
| `git diff --check` | успешно; только предупреждения о будущей нормализации LF → CRLF |
| backend venv pytest/compileall | недоступны: venv ссылается на отсутствующий Python 3.12 |
| bundled Python pytest | недоступен: пакет `pytest` не установлен |

Backend, API, SQLite и настройки AI-provider не изменялись. Коммит, push и
публикация не выполнялись.

---

## Checkpoint — расширение Module 6, 2026-08-27

- создан `frontend/app/data/module6ExpandedLessons.ts` для 18 бытовых
  сценариев со стабильными `m6-*` ID;
- сценарии разделены на людей/дом, покупки/еду, движение/расписание,
  работу/самочувствие и практические тексты;
- каждый урок содержит пять секций, пять практик, проверки и итоговую задачу;
- общий runtime/state API сохранён без новых endpoints или таблиц.

| Проверка | Результат |
|---|---|
| `npm.cmd run validate:a1` | expanded Modules 1–6, TypeScript успешно |
| `npm.cmd run test:ui` | 23 passed |
| `npm.cmd run build` | успешно |

Ручная приёмка Modules 3–6 отложена владельцем. Следующий milestone —
содержательный аудит по документам владельца; Module 7 следует после него.
Backend venv остаётся сломанным; credential/dependency риски не изменились.

### Пауза и точка продолжения

Владелец завершил работу на сегодня и в следующей сессии предоставит учебные
документы в формате, ранее использованном для Modules 1–2. До их приёма
Modules 3–6 следует считать технически рабочим, но лингвистически не
утверждённым черновиком. Следующий агент должен:

1. принять документы и определить, к каким slug/секциям они относятся;
2. сверить каждое правило, пример, нормативный ответ и границу A1;
3. заменить черновой контент без изменения slug/activity ID и повторить
   validation, UI tests и build.

Module 7 до этого аудита не начинать. Отдельно обнаружены незакоммиченные
изменения `course-content/slovak-a1/learning/learning_roadmap.md`; они не
создавались в текущей реализации Modules 3–6 и сохранены как пользовательские.

---

## Checkpoint — расширение Module 5, 2026-08-27

### Что изменилось и почему

- создан `frontend/app/data/module5ExpandedLessons.ts` для 11 уроков со
  стабильными `m5-*` activity ID;
- расширены настоящее время, частотные неправильные глаголы, `sa/si`,
  отрицание/вопросы, `chcieť`, `môcť`, `musieť`, `vedieť`, вежливые просьбы и
  базовый императив;
- Module 5 разделён на четыре группы и подключён к общему runtime/state API;
- validation и Playwright проверяют структуру, словарь, итоговое покрытие,
  группы и восстановление прогресса.

### Проверка

| Команда или проверка | Результат |
|---|---|
| `npm.cmd run validate:a1` | 11 expanded Module 5 lessons, TypeScript успешно |
| `npm.cmd run test:ui` | 21 passed |
| `npm.cmd run build` | production build успешно |
| `python -m compileall -q app tests` через системный Python 3.14 | успешно |
| `platform.ps1 -Mode SelfTest` | успешно |
| `check-repository.ps1` | успешно |
| backend pytest и `pip check` | недоступны из-за сломанного локального venv |

Ручная приёмка Modules 3–5 отложена владельцем до завершения всего пакета.

### Аудит и roadmap delta

- открытые credential/dependency риски не изменились;
- backend venv всё ещё требует восстановления;
- Module 5 не добавляет endpoints, таблицы или новую механику чата;
- следующим продуктовым milestone назначен Module 6.

### Следующий checkpoint

После общей ручной приёмки исправить замечания Modules 3–5 и создать один
связный коммит только с разрешения владельца. Контентный старт — 18 уроков
Module 6 в `frontend/app/data/a1CourseRoadmap.ts`.

---

## Checkpoint — расширение Module 4, 2026-08-27

### Что изменилось и почему

- создан `frontend/app/data/module4ExpandedLessons.ts` для 11 утверждённых
  уроков со стабильными `m4-*` activity ID;
- каждый урок получил пять секций, пять практик, три проверки и итоговый
  вопрос на основе предметной карты правил и существующего course content;
- раскрыты Nominatív, Akuzatív, Lokál, частотные модели Genitív,
  Datív/Inštrumentál, управление предлогами, вопросы места и простой маршрут;
- Module 4 разделён на четыре группы и подключён к общему runtime/state API без
  отдельных компонентов, endpoints или SQLite-таблиц;
- validation и Playwright проверяют структуру, словарь, итоговое покрытие,
  отображение групп и восстановление прогресса.

### Проверка

| Команда или проверка | Результат |
|---|---|
| `npm.cmd run validate:a1` | 11 expanded Module 4 lessons, TypeScript успешно |
| `npm.cmd run test:ui` | 19 passed |
| `npm.cmd run build` | production build успешно |
| `python -m compileall -q app tests` через системный Python 3.14 | успешно |
| `platform.ps1 -Mode SelfTest` | успешно |
| `check-repository.ps1` | успешно, запрещённых путей и credential-like значений не найдено |
| backend pytest и `pip check` | недоступны из-за сломанного локального venv |

Ручной smoke всех 11 уроков и реальный AI-provider не проверялись по решению владельца:
общая ручная приёмка будет выполнена после завершения модуля.

### Аудит и roadmap delta

- **high — открыт, без изменений:** прежний credential в Git-истории не имеет
  подтверждённого отзыва.
- **high — открыт, без изменений:** dependency audit содержит 6 high
  advisories; breaking-обновление не выполнялось.
- **low — открыт:** backend venv остаётся привязан к отсутствующему Python 3.12.
- **info — подтверждено:** Module 4 не изменяет API, БД или security boundary.
- Modules 3–4 реализованы; следующим продуктовым milestone назначен Module 5.

### Следующий checkpoint

После общей ручной приёмки исправить замечания Modules 3–4 и только затем
создать коммит. Следующий контентный старт — 11 уроков Module 5 в
`frontend/app/data/a1CourseRoadmap.ts`.

---

## Checkpoint — расширение Module 3, 2026-08-27

### Что изменилось и почему

- создан `frontend/app/data/module3ExpandedLessons.ts` для шести утверждённых
  уроков Module 3 со стабильными `m3-*` activity ID;
- каждый урок получил не менее пяти секций и пяти практик, три проверки и
  отдельный итоговый вопрос;
- подробно раскрыты род и число прилагательных, указательные и притяжательные
  формы, описание, выбор/контраст и связки `a`, `ale`, `aj`, `potom`;
- граница сохранена на именительном падеже A1: склонение и степени сравнения не
  добавлялись;
- Module 3 подключён к общему экрану и state API без отдельного UI/backend;
- validation и Playwright проверяют структуру, словарь, тематические группы и
  восстановление сохранённого урока Module 3.

### Проверка

| Команда или проверка | Результат |
|---|---|
| `npm.cmd run validate:a1` | 6 expanded Module 3 lessons, TypeScript успешно |
| `npm.cmd run test:ui` | 17 passed |
| `npm.cmd run build` | production build успешно |
| `python -m compileall -q app tests` через системный Python 3.14 | успешно |
| `platform.ps1 -Mode SelfTest` | успешно |
| `check-repository.ps1` | успешно, запрещённых путей и credential-like значений не найдено |
| backend pytest и `pip check` | недоступны: локальный venv ссылается на отсутствующий Python 3.12; в системном Python 3.14 нет pytest |

Ручной smoke всех заданий и реальный AI-provider не проверялись.

### Аудит и roadmap delta

- **high — открыт, без изменений:** прежний credential в Git-истории не имеет
  подтверждённого отзыва.
- **high — открыт, без изменений:** последний `npm audit` сообщил 6 high
  advisories; breaking-обновление не выполнялось.
- **info — подтверждено:** Module 3 использует существующие slug и общий
  data-driven runtime; отдельные таблицы или API не создавались.
- **low — открыт:** backend pytest нельзя повторить до восстановления venv;
  последний успешный результат до текущего этапа — 11 passed, 1 warning.
- Module 3 завершён технически; следующим milestone назначен Module 4.

### Следующий checkpoint

После ручной приёмки Module 3 начать с Module 4 в
`frontend/app/data/a1CourseRoadmap.ts`: определить границы падежей A1,
тематические группы и порядок расширения 11 уроков. Коммит и push Module 3 без
отдельного разрешения не выполнять.

---

## Checkpoint — расширение Module 2, 2026-08-27

### Что изменилось и почему

- создан отдельный `frontend/app/data/module2ExpandedLessons.ts` для семи
  утверждённых уроков Module 2;
- добавлены подробная теория, пять секций и пять пошаговых практик на урок,
  проверки знаний, итоговые вопросы и стабильные `m2-*` activity ID;
- Module 2 разделён на группы рода, числа/словарной формы и
  называния/наличия, подключён к общему data-driven экрану без копирования UI,
  API или SQLite-таблиц;
- content validation и Playwright расширены проверками структуры, словаря,
  открытия Module 2 и восстановления сохранённого прогресса;
- README, roadmap, course format и agent current state обновлены перед
  переходом к Module 3.

Владелец запросил довести Module 2 до глубины Module 1, исключив новую
разговорную механику, затем проверить результат и зафиксировать этап коммитом.

### Проверка

| Команда или проверка | Результат |
|---|---|
| `backend/.venv/Scripts/python.exe -m pytest -q` | 11 passed, 1 deprecation warning |
| `python -m compileall -q app tests` | успешно |
| `npm.cmd run validate:a1` | 8 модулей, 83 урока, 7 expanded Module 2 lessons, TypeScript успешно |
| `npm.cmd run test:ui` | 15 passed |
| `npm.cmd run build` | production build успешно |
| `platform.ps1 -Mode SelfTest` | launcher decision tests успешно |
| `check-repository.ps1` | успешно, запрещённых путей и credential-like значений не найдено |
| `git diff --check` | успешно |
| `npm.cmd audit --omit=dev --audit-level=high` | 6 high advisories; полный fix требует breaking Next.js 16 |
| `backend/.venv/Scripts/python.exe -m pip check` | недоступно: локальный venv ссылается на отсутствующий старый путь Python |

Ручной smoke каждого задания и реальный AI-provider в этом checkpoint не
проверялись. Владелец просмотрел результат Module 2 и подтвердил, что в целом
он его устраивает.

### Аудит и roadmap delta

- **high — открыт, без изменений:** прежняя строка формата credential остаётся
  в Git-истории; подтверждения отзыва нет.
- **high — открыт, без изменений:** последний dependency audit сообщал 6 high
  advisories; breaking-обновление автоматически не выполнялось.
- **low — открыт:** backend сохраняет известную Starlette deprecation warning.
- **low — открыт:** локальный backend venv требует пересоздания или исправления
  базового Python для повторного `pip check`; зависимости не переустанавливались.
- **info — подтверждено:** новый контент использует существующие slug, общий
  state/API и проходит repository audit.
- Module 2 завершён; следующим продуктовым milestone назначен Module 3.

### Следующий checkpoint

Начать с `frontend/app/data/a1CourseRoadmap.ts` и компактных записей Module 3 в
`frontend/app/data/a1CourseContent.json`:

1. согласовать границы и тематические группы шести уроков Module 3;
2. создать `module3ExpandedLessons.ts` со стабильными `m3-*` ID;
3. подключить его к `a1Course.ts` и повторить validation/UI/build matrix.

---

## Предыдущий current summary — 2026-08-26

Compact Slovak A1 runtime опубликован в GitHub `origin/main` коммитом
`3214334`; GitHub CI прошёл, локальное рабочее дерево после push было чистым.
Приложение остаётся локальным однопользовательским MVP без auth/deployment.
Следующий приоритет — отзыв прежнего credential и контролируемое обновление
frontend-зависимостей после 6 high advisories.

## Checkpoint — публикация и AI-настройки, 2026-08-26

### Что изменилось

- compact runtime, очистка classic-кода и актуальная документация отправлены в
  `Eobart96/ai-learning-platform` ветку `main`;
- добавлен локальный экран выбора Codex CLI, OpenAI API или Polza API;
- backend сохраняет AI-настройки атомарно в ignored
  `backend/data/ai_settings.json` и возвращает только признаки наличия ключей;
- README, roadmap, testing/open-source docs и `.ai/` приведены к состоянию
  после публикации.

### Почему

Владелец запросил полностью очистить проект, подготовить его к Git, добавить
настройки AI-provider, опубликовать результат и завершить этап проверяемым
checkpoint для следующего продолжения.

### Проверка

| Команда или проверка | Результат |
|---|---|
| `backend/.venv/Scripts/python.exe -m pytest -q` | 11 passed, 1 deprecation warning |
| `python -m compileall -q app tests` | успешно |
| `python -m pip check` | broken requirements не найдены |
| `npm.cmd run validate:a1` | 8 модулей, 83 урока, TypeScript успешно |
| `npm.cmd run test:ui` | 12 passed |
| `platform.ps1 -Mode SelfTest` | launcher decision tests успешно |
| `check-repository.ps1` и `git diff --check` перед публикацией | успешно, current candidate без credential-like значений |
| GitHub Actions для `3214334` | успешно: backend tests/compileall, frontend validation/build |
| `npm.cmd audit --omit=dev --audit-level=high` | не пройден: 6 high advisories |

Production deployment и публичная доступность приложения не проверялись и не
заявляются; проект рассчитан только на loopback-запуск.

### Результаты аудита

- **high — открыт:** Git-история содержит прежнюю строку формата API-ключа в
  старой версии `.env.example`. Значение не читалось и не выводилось. Текущий
  snapshot чист, но отзыв credential владельцем не подтверждён.
- **high — открыт:** `npm audit` сообщает advisories для `nanoid`, `postcss`,
  `sharp` и `playwright` (6 high суммарно). Предложенный полный fix включает
  breaking-переход на Next.js 16, поэтому автоматически не применялся.
- **medium — ограничено архитектурой:** tutor settings и Codex login не имеют
  auth. Это соответствует локальному single-user scope только при сохранении
  binding на `127.0.0.1`; bridge нельзя выставлять в сеть.
- **low — открыт:** backend tests дают Starlette deprecation warning из-за
  текущей связки `TestClient/httpx`; функциональные тесты проходят.
- **info — подтверждено:** текущие `.env`, SQLite, AI settings, dependencies,
  build/cache/recovery paths игнорируются и не вошли в опубликованный снимок.

### Возможные улучшения

1. Сначала отозвать прежний credential — высокий эффект, малое усилие.
2. В отдельной ветке обновить Next.js/Playwright и transitive dependencies,
   затем повторить backend, UI, build и audit — высокий эффект, среднее усилие.
3. Добавить Playwright job в GitHub CI — средний эффект, малое/среднее усилие;
   сейчас UI suite подтверждён локально, но CI запускает только validation/build.
4. После security work провести ручной smoke с реальным provider и проверить
   Modules 2–8 относительно эталонного Module 1.

### Изменение roadmap

- завершены публикация `origin/main`, AI settings и повторная test matrix;
- dependency audit выполнен и превратился в отдельный remediation milestone;
- отзыв credential остаётся первым незакрытым security-действием;
- product-приоритет Modules 2–8 сохранён, но следует после security/smoke.

### Текущее состояние проекта

Confirmed: курс, локальное SQLite-состояние, AI settings, structured tutor
contract, launcher, тесты и GitHub CI работают в заявленной границе. Partial:
Modules 2–8 менее глубоки, чем Module 1. Blocked: нет. Intentionally deferred:
auth, multi-user, PostgreSQL, deployment и переписывание Git-истории.

### Следующий checkpoint

Начать с `frontend/package.json` и `frontend/package-lock.json`:

1. подобрать совместимый dependency update без слепого `audit fix --force`;
2. подтвердить отзыв прежнего credential без записи его значения;
3. выполнить реальный AI/UI smoke и обновить этот отчёт и `ROADMAP.md`.

---

## Историческая запись: итог очистки до публикации, 2026-08-26

Проект сведён к одному активному продукту: интерактивному Slovak A1. Classic
frontend, старые API-домены, прежние схемы/сервисы, исторические отчёты,
PostgreSQL Docker-конфигурация и дублирующие launcher-файлы перенесены в
`del/full-cleanup-2026-08-26/`. Перемещение восстановимо; пользовательские
SQLite-данные не удалялись.

Backend startup в той версии регистрировал прежние физические `module1_beta_*` таблицы.
Старые таблицы в существующей SQLite-базе остаются нетронутыми, но больше не
создаются, не засеиваются и не обслуживаются текущим runtime.

Актуальная документация пересобрана вокруг фактических frontend, API,
хранилища, тестов и локального запуска. История разработки вынесена из
public-ready дерева.

## Подтверждено

- до переноса зависимостей: backend `9 passed, 1 warning`, Playwright
  `11 passed`, TypeScript/content validation, Next.js build и compileall;
- после сужения backend: Python `compileall` проходит;
- repository audit и launcher self-test запускаются без зависимостей;
- локальные секреты, SQLite, dependency/build/cache и recovery-пути исключены
  `.gitignore`.

После финального compact refactor сохранённые в `del/` зависимости были
подключены только на время проверки, без установки: backend — `9 passed,
1 warning`; content/TypeScript validation — успешно; Playwright — `11 passed`;
Next.js production build — успешно; Python compileall — успешно. Временная
junction и generated output после проверки убраны из active tree.

## Не было выполнено на момент этой записи

До финальной проверки commit, push, очистка `.git` и удаление пользовательской
базы не выполнялись. 26 августа владелец отдельно разрешил публикацию
проверенного compact runtime в существующий GitHub remote. `.git` остаётся крупным локальным
каталогом с recovery/temp-артефактами и требует отдельной резервной копии перед
любой обработкой.
