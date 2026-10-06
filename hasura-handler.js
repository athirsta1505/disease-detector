<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>Fertilizer Management — AgriNova</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&family=Sora:wght@600;700&display=swap" rel="stylesheet">
<style>
/* ===================================================
   AgriNova — Fertilizer Management (app edition)
   Palette: forest green, leaf green, soil brown,
   pale sage background. All body text is pure black.
=================================================== */

:root {
  --forest: #1F4D36;
  --forest-deep: #0F2A1D;
  --leaf: #4CAF6D;
  --leaf-soft: #E2F2E7;
  --soil: #6B4423;
  --soil-soft: #F3EADD;
  --bg: #F0F4EC;
  --paper: #FFFFFF;
  --field: #F5F7F2;
  --ink: #000000;
  --ink-soft: #1E1E1E;
  --line: #D3D9CC;
  --amber: #B4620F;
  --amber-soft: #FBEBD8;
  --danger: #B3261E;
  --danger-soft: #FDECEC;
  --low: #B94A2C;
  --mid: #B4620F;
  --good: #1F7A48;
  --radius-sm: 12px;
  --radius-md: 20px;
  --shadow: 0 1px 2px rgba(15, 42, 29, 0.07), 0 12px 30px -16px rgba(15, 42, 29, 0.35);
  --font-head: "Sora", "Segoe UI", sans-serif;
  --font-body: "Inter", "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-weight: 500;
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
  padding-bottom: 130px;
}

a { color: inherit; }
img, svg { max-width: 100%; }

.ico { display: inline-flex; width: 20px; height: 20px; flex: none; }
.ico svg { width: 100%; height: 100%; display: block; }

/* ---------- Top bar ---------- */

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  background: var(--forest);
  color: #F4FBF6;
  box-shadow: 0 6px 18px -10px rgba(0, 0, 0, 0.5);
}

.topbar__brand { display: flex; align-items: center; gap: 10px; min-width: 0; justify-self: start; }
.topbar__logo { width: 30px; height: 30px; border-radius: 9px; background: var(--leaf); color: var(--forest-deep); display: grid; place-items: center; flex: none; }
.topbar__logo .ico { width: 18px; height: 18px; }
.topbar__wordmark { font-family: var(--font-head); font-weight: 700; font-size: 1.08rem; letter-spacing: 0.01em; white-space: nowrap; }
.topbar__wordmark-agri { color: #FFFFFF; }
.topbar__wordmark-nova { color: var(--leaf); }

.topbar__title {
  grid-column: 2;
  justify-self: center;
  margin: 0;
  font-family: var(--font-head);
  font-weight: 700;
  font-size: 1.32rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  color: #FFFFFF;
}

.langswitch {
  grid-column: 3;
  justify-self: end;
  display: inline-flex;
  padding: 3px;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  gap: 2px;
}
.langswitch button {
  border: none;
  background: transparent;
  color: #FFFFFF;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.78rem;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.langswitch button.is-active { background: var(--leaf); color: #04140B; }
.langswitch button:not(.is-active):hover { background: rgba(255, 255, 255, 0.14); }

/* ---------- Layout ---------- */

.page { max-width: 860px; margin: 0 auto; padding: 22px 20px 0; }
.sec { scroll-margin-top: 84px; }

.sec__label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 34px 2px 14px;
  font-family: var(--font-head);
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--ink);
}
.sec__label .ico { width: 36px; height: 36px; padding: 8px; border-radius: 12px; background: var(--forest); color: #FFFFFF; }

/* ---------- Hero ---------- */

.hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 30px 26px 26px;
  color: #FFFFFF;
  background:
    radial-gradient(420px 220px at 100% 0%, rgba(76, 175, 109, 0.42), transparent 70%),
    radial-gradient(360px 240px at 0% 100%, rgba(139, 94, 52, 0.35), transparent 70%),
    linear-gradient(160deg, #1F4D36 0%, #0F2A1D 100%);
  box-shadow: var(--shadow);
}
.hero__eyebrow { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.85rem; color: #CDEBD6; margin-bottom: 10px; }
.hero__eyebrow .ico { width: 18px; height: 18px; }
.hero h2 { margin: 0 0 10px; font-family: var(--font-head); font-weight: 700; font-size: 1.9rem; line-height: 1.2; max-width: 520px; }
.hero p { margin: 0 0 20px; font-size: 0.98rem; line-height: 1.6; color: #E6F4EA; max-width: 520px; }
.hero__ask { font-weight: 700; font-size: 0.9rem; margin-bottom: 10px; color: #FFFFFF; }
.hero__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.hero__chips button {
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 9px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.hero__chips button:hover { background: #FFFFFF; color: var(--forest-deep); }

/* ---------- Cards ---------- */

section.card {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 24px;
  margin-bottom: 18px;
  box-shadow: var(--shadow);
}

.card__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.card__head h2 { font-family: var(--font-head); font-size: 1.1rem; font-weight: 700; color: var(--ink); margin: 0; }
.card__hint { font-size: 0.82rem; color: var(--ink-soft); font-weight: 600; }

/* ---------- Form ---------- */

.form-top { display: grid; grid-template-columns: 1.2fr 1.2fr 0.8fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label, .field-label { font-size: 0.85rem; font-weight: 700; color: var(--ink); margin: 0; }

.select-wrap { position: relative; }
.select-wrap::after {
  content: "";
  position: absolute;
  right: 14px;
  top: 50%;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--ink);
  border-bottom: 2px solid var(--ink);
  transform: translateY(-70%) rotate(45deg);
  pointer-events: none;
}

select, .input {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
  background: var(--field);
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 12px 34px 12px 13px;
  cursor: pointer;
}
.input { padding-right: 13px; cursor: text; }
select option { color: #000; background: #fff; }
select:hover, .input:hover { border-color: var(--leaf); }
select:focus-visible, .input:focus-visible, textarea:focus-visible {
  outline: none;
  border-color: var(--forest);
  box-shadow: 0 0 0 3px var(--leaf-soft);
}
::placeholder { color: #444; opacity: 1; }

.nutrient-block { margin-top: 22px; }
.npk-rows { margin-top: 6px; }
.npk-item { display: grid; grid-template-columns: 170px 1fr; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px dashed var(--line); }
.npk-item:first-child { border-top: none; }
.npk-item__name { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.92rem; }
.npk-dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.npk-dot--n { background: #2F73C4; }
.npk-dot--p { background: var(--amber); }
.npk-dot--k { background: #8347C7; }

.seg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: var(--field); padding: 4px; border-radius: 13px; border: 1.5px solid var(--line); }
.seg__btn { border: none; background: transparent; border-radius: 9px; padding: 11px 6px; font-family: var(--font-body); font-weight: 700; font-size: 0.88rem; color: var(--ink); cursor: pointer; }
.seg__btn:hover { background: #E8EEE3; }
.seg__btn.is-active { color: #FFFFFF; }
.seg__btn--low.is-active { background: var(--low); }
.seg__btn--medium.is-active { background: var(--mid); }
.seg__btn--high.is-active { background: var(--good); }

.btn-primary {
  margin-top: 20px;
  width: 100%;
  border: none;
  background: linear-gradient(180deg, #27603F, var(--forest));
  color: #FFFFFF;
  font-family: var(--font-head);
  font-weight: 700;
  font-size: 1rem;
  padding: 15px 20px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 10px 20px -12px rgba(15, 42, 29, 0.9);
}
.btn-primary:hover { background: var(--forest-deep); }
.btn-primary:active { transform: translateY(1px); }
.btn-primary--small { margin-top: 0; width: auto; padding: 11px 20px; font-size: 0.88rem; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid var(--forest);
  background: transparent;
  color: var(--forest-deep);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.88rem;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.btn-secondary:hover { background: var(--forest); color: #FFFFFF; }
.btn-secondary .ico { width: 17px; height: 17px; }
.btn-whatsapp { background: #1E8E4E; border-color: #1E8E4E; color: #FFFFFF; }
.btn-whatsapp:hover { background: #157040; border-color: #157040; }

/* ---------- Result ---------- */

.result__placeholder { color: var(--ink); font-size: 0.95rem; padding: 4px 2px; margin: 0; }
.result { display: none; }
.result.is-visible { display: block; animation: rise 0.28s ease; }
@keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

.result__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.result__kicker { margin: 0 0 4px; font-size: 0.85rem; font-weight: 600; color: var(--ink-soft); }
.result__name { margin: 0; font-family: var(--font-head); font-size: 1.35rem; font-weight: 700; color: var(--ink); }
.result__chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { display: inline-block; font-size: 0.8rem; font-weight: 700; padding: 6px 12px; border-radius: 999px; background: var(--leaf-soft); color: var(--ink); border: 1px solid #B9DEC5; }

.result__banner { margin: 16px 0 0; padding: 12px 14px; border-radius: var(--radius-sm); background: var(--amber-soft); border: 1px solid #EBC79D; font-size: 0.9rem; line-height: 1.55; font-weight: 600; }

.result__sec {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 28px 0 12px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  font-family: var(--font-head);
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--ink);
}
.result__sec .ico { width: 30px; height: 30px; padding: 6px; border-radius: 10px; background: var(--leaf-soft); color: var(--forest); }
.result__head + .result__sec, .result__banner + .result__sec { margin-top: 22px; }

.qty { border: 1.5px solid var(--line); border-radius: 14px; overflow: hidden; }
.qty-row { display: grid; grid-template-columns: 1.8fr 1fr 0.7fr; gap: 10px; align-items: center; padding: 13px 14px; border-top: 1px solid var(--line); }
.qty-row--head { background: var(--forest); color: #FFFFFF; font-size: 0.8rem; font-weight: 700; border-top: none; padding: 10px 14px; }
.qty-row__name { font-family: var(--font-head); font-weight: 700; font-size: 1rem; color: var(--ink); }
.qty-row__role { font-family: var(--font-body); font-weight: 500; font-size: 0.82rem; color: var(--ink-soft); margin-top: 2px; }
.qty-row__kg { font-family: var(--font-head); font-weight: 700; font-size: 1.08rem; }
.qty-row__bags { font-weight: 700; font-size: 0.95rem; }
.status { display: inline-block; font-family: var(--font-body); font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; color: #FFFFFF; margin-left: 6px; vertical-align: middle; }
.status--low { background: var(--low); }
.status--medium { background: var(--mid); }
.status--high { background: var(--good); }
.result__note { margin: 10px 2px 0; font-size: 0.85rem; line-height: 1.5; color: var(--ink-soft); font-weight: 500; }

.plan { list-style: none; margin: 0; padding: 0; }
.plan__step { position: relative; display: grid; grid-template-columns: 34px 1fr; gap: 14px; padding-bottom: 20px; }
.plan__step:last-child { padding-bottom: 0; }
.plan__step::before { content: ""; position: absolute; left: 16px; top: 34px; bottom: 0; width: 2px; background: var(--line); }
.plan__step:last-child::before { display: none; }
.plan__dot { width: 34px; height: 34px; border-radius: 50%; background: var(--forest); color: #FFFFFF; font-family: var(--font-head); font-weight: 700; font-size: 0.9rem; display: grid; place-items: center; }
.plan__title { font-family: var(--font-head); font-weight: 700; font-size: 0.98rem; color: var(--ink); margin-bottom: 8px; padding-top: 5px; }
.plan__items { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.pill { font-size: 0.84rem; font-weight: 600; padding: 6px 12px; border-radius: 10px; background: var(--field); border: 1.5px solid var(--line); color: var(--ink); }
.pill b { font-weight: 700; margin-right: 6px; }
.plan__detail { margin: 0; font-size: 0.88rem; line-height: 1.55; color: var(--ink-soft); font-weight: 500; }

.mini-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.mini { background: var(--soil-soft); border-radius: 14px; padding: 14px; }
.mini h5 { margin: 0 0 6px; font-family: var(--font-head); font-size: 0.92rem; font-weight: 700; color: var(--ink); }
.mini p { margin: 0; font-size: 0.86rem; line-height: 1.55; color: var(--ink); font-weight: 500; }
.mini__big { display: block; font-family: var(--font-head); font-size: 1.4rem; font-weight: 700; margin-bottom: 4px; }

.text-block { margin: 0; font-size: 0.92rem; line-height: 1.65; color: var(--ink); font-weight: 500; }

.check-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.check-list li { display: flex; gap: 10px; font-size: 0.9rem; line-height: 1.55; color: var(--ink); font-weight: 500; }
.check-list li::before { content: ""; flex: none; width: 18px; height: 18px; margin-top: 2px; border-radius: 50%; background: var(--leaf-soft); border: 2px solid var(--leaf); }
.check-list--alt li::before { border-color: var(--soil); background: var(--soil-soft); }

.caution { display: flex; gap: 12px; padding: 14px; border-radius: var(--radius-sm); background: var(--danger-soft); border: 1px solid #F0B4B0; }
.caution .ico { color: var(--danger); margin-top: 1px; }
.caution p { margin: 0; font-size: 0.92rem; line-height: 1.6; font-weight: 600; color: var(--ink); }

.result__actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; padding-top: 20px; border-top: 1px solid var(--line); }

/* ---------- AI insight ---------- */

.ai-insight {
  margin-top: 22px;
  padding: 16px 18px;
  border-radius: var(--radius-sm);
  background: linear-gradient(160deg, #EAF6EE, #F5F7F2);
  border: 1.5px solid #BEE3C8;
}
.ai-insight__head { display: flex; align-items: center; gap: 8px; font-family: var(--font-head); font-weight: 700; font-size: 0.95rem; color: var(--forest-deep); margin-bottom: 8px; }
.ai-insight__head .ico { width: 20px; height: 20px; }
.ai-insight__body { font-size: 0.9rem; line-height: 1.6; color: var(--ink); font-weight: 500; }
.ai-insight__row { display: flex; gap: 8px; padding: 4px 0; }
.ai-insight__row dt { flex: none; width: 100px; font-weight: 700; color: var(--forest); }
.ai-insight__row dd { margin: 0; }
.ai-insight__loading { display: flex; align-items: center; gap: 8px; color: var(--ink-soft); font-size: 0.88rem; font-weight: 600; }
.ai-spinner {
  width: 14px; height: 14px; border: 2px solid rgba(31,77,54,0.25); border-top-color: var(--forest);
  border-radius: 50%; animation: aispin 0.7s linear infinite; flex: none;
}
@keyframes aispin { to { transform: rotate(360deg); } }
.ai-insight__error { color: var(--danger); font-size: 0.88rem; font-weight: 600; }

/* ---------- Soil nutrient analysis ---------- */

.fert-index { display: flex; align-items: center; gap: 18px; padding: 16px; border-radius: 16px; background: var(--field); border: 1.5px solid var(--line); margin-bottom: 20px; }
.fert-index__score { font-family: var(--font-head); font-weight: 700; font-size: 2.2rem; line-height: 1; color: var(--ink); }
.fert-index__score small { font-size: 0.9rem; font-weight: 600; margin-left: 2px; }
.fert-index__meta { flex: 1; display: flex; flex-direction: column; gap: 4px; font-size: 0.92rem; }
.fert-index__meta b { font-weight: 700; }
.fert-index__meta span { font-weight: 700; }
.fert-index__bar { height: 10px; border-radius: 999px; background: #DCE3D5; overflow: hidden; margin-top: 4px; }
.fert-index__bar i { display: block; height: 100%; border-radius: 999px; }
.fert-index--low .fert-index__bar i { background: var(--low); }
.fert-index--mid .fert-index__bar i { background: var(--mid); }
.fert-index--good .fert-index__bar i { background: var(--good); }
.fert-index--low .fert-index__meta span { color: var(--low); }
.fert-index--mid .fert-index__meta span { color: var(--mid); }
.fert-index--good .fert-index__meta span { color: var(--good); }

.nutri-bars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.nutri-bar { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.nutri-bar__track { width: 100%; max-width: 64px; height: 140px; border-radius: 10px; background: var(--field); border: 1.5px solid var(--line); display: flex; align-items: flex-end; overflow: hidden; }
.nutri-bar__fill { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.3s ease; }
.nutri-bar__label { font-size: 0.86rem; font-weight: 700; color: var(--ink); text-align: center; }
.nutri-bar__status { font-size: 0.82rem; font-weight: 600; color: var(--ink); text-align: center; }

.insights { list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.insights li { display: flex; gap: 10px; font-size: 0.9rem; line-height: 1.55; color: var(--ink); font-weight: 500; background: var(--field); border-radius: var(--radius-sm); padding: 11px 13px; }
.insights .npk-dot { margin-top: 6px; }

/* ---------- Library ---------- */

.tabbar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.tabbar button { border: 1.5px solid var(--line); background: var(--field); color: var(--ink); font-family: var(--font-body); font-weight: 700; font-size: 0.85rem; padding: 9px 16px; border-radius: 999px; cursor: pointer; }
.tabbar button.is-active { background: var(--forest); border-color: var(--forest); color: #FFFFFF; }
.tabbar button:not(.is-active):hover { border-color: var(--leaf); }

.ftype-list { display: flex; flex-direction: column; gap: 10px; }
.ftype { border: 1.5px solid var(--line); border-radius: var(--radius-sm); overflow: hidden; background: var(--field); }
.ftype__head { width: 100%; display: flex; align-items: center; gap: 12px; background: none; border: none; padding: 13px 14px; cursor: pointer; text-align: left; font-family: var(--font-body); }
.ftype__badge { flex: none; width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-weight: 700; font-size: 0.74rem; color: #FFFFFF; }
.ftype__name { font-weight: 700; font-size: 0.98rem; color: var(--ink); flex: 1; }
.ftype__chevron { width: 9px; height: 9px; border-right: 2px solid var(--ink); border-bottom: 2px solid var(--ink); transform: rotate(45deg); transition: transform 0.18s ease; flex: none; margin-right: 4px; }
.ftype.is-open .ftype__chevron { transform: rotate(-135deg); }
.ftype__body { max-height: 0; overflow: hidden; transition: max-height 0.22s ease; }
.ftype.is-open .ftype__body { max-height: 340px; }
.ftype__body-inner { padding: 0 14px 16px 68px; font-size: 0.9rem; line-height: 1.6; color: var(--ink); font-weight: 500; }

/* ---------- Schedule / lists ---------- */

.schedule-list { display: flex; flex-direction: column; }
.schedule-row { display: grid; grid-template-columns: 150px 1fr; gap: 14px; padding: 13px 0; border-top: 1px solid var(--line); }
.schedule-row:first-child { border-top: none; }
.schedule-row__stage { font-family: var(--font-head); font-weight: 700; font-size: 0.88rem; color: var(--ink); }
.schedule-row__detail { font-size: 0.9rem; line-height: 1.55; color: var(--ink); }

.tick-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.tick-list li { display: flex; gap: 10px; font-size: 0.9rem; line-height: 1.55; color: var(--ink); }
.tick-list li::before { content: ""; flex: none; width: 18px; height: 18px; margin-top: 2px; border-radius: 50%; background: var(--leaf-soft); border: 2px solid var(--leaf); }

.warning-banner { background: var(--danger-soft); border: 1px solid #F0B4B0; color: var(--ink); font-weight: 600; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 0.9rem; line-height: 1.55; margin-bottom: 14px; }
.warning-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.warning-list li { font-size: 0.9rem; line-height: 1.55; color: var(--ink); background: var(--soil-soft); border-radius: var(--radius-sm); padding: 11px 13px; }

/* ---------- History / effect / reminder ---------- */

.history-form { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; align-items: end; margin-bottom: 18px; }
.history-form--narrow { grid-template-columns: 1fr 1fr; }
.history-form input[type="date"], .history-form input[type="text"] {
  width: 100%;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink);
  background: var(--field);
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 11px 12px;
}
.history-form input:focus-visible { outline: none; border-color: var(--forest); box-shadow: 0 0 0 3px var(--leaf-soft); }
.history-empty { color: var(--ink); font-size: 0.92rem; padding: 4px 2px; }
.history-list { display: flex; flex-direction: column; gap: 10px; }
.history-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--field); border: 1.5px solid var(--line); border-radius: var(--radius-sm); padding: 11px 14px; font-size: 0.9rem; }
.history-row__main { color: var(--ink); line-height: 1.55; }
.history-row__main b { font-weight: 700; }
.history-row__effect { color: var(--soil); font-weight: 600; font-size: 0.84rem; margin-top: 2px; }
.history-row__del { flex: none; border: none; background: none; color: var(--ink); cursor: pointer; font-size: 1.3rem; line-height: 1; padding: 4px 8px; }
.history-row__del:hover { color: var(--danger); }

.effect-panel { display: flex; flex-direction: column; gap: 12px; }
.effect-panel__entry { font-size: 0.92rem; color: var(--ink); margin: 0; }
.star-rating { display: flex; gap: 6px; }
.star-rating button { border: none; background: none; font-size: 1.6rem; line-height: 1; cursor: pointer; color: #C9CFC1; padding: 0; }
.star-rating button.is-filled { color: var(--amber); }
.effect-notes { width: 100%; font-family: var(--font-body); font-size: 0.9rem; font-weight: 500; color: var(--ink); background: var(--field); border: 1.5px solid var(--line); border-radius: var(--radius-sm); padding: 11px 12px; resize: vertical; }

.reminder-banner { background: var(--leaf-soft); border: 1px solid #B9DEC5; color: var(--ink); font-weight: 600; border-radius: var(--radius-sm); padding: 12px 14px; font-size: 0.9rem; margin-bottom: 14px; }
.reminder-banner.is-due { background: var(--danger-soft); border-color: #F0B4B0; }

.knowledge-tip { font-size: 0.98rem; line-height: 1.65; color: var(--ink); font-weight: 500; background: var(--soil-soft); border-radius: var(--radius-sm); padding: 16px 18px; margin: 0 0 14px; }

/* ---------- Guide + safety ---------- */

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.two-col > section.card { margin-bottom: 0; }
.stepped { list-style: none; margin: 0; padding: 0; counter-reset: step; display: flex; flex-direction: column; gap: 12px; }
.stepped li { counter-increment: step; display: flex; gap: 12px; font-size: 0.9rem; line-height: 1.55; color: var(--ink); }
.stepped li::before { content: counter(step); flex: none; width: 24px; height: 24px; border-radius: 50%; background: var(--forest); color: #FFFFFF; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
.safety-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.safety-list li { display: flex; gap: 10px; font-size: 0.9rem; line-height: 1.55; color: var(--ink); background: var(--amber-soft); border-radius: var(--radius-sm); padding: 11px 13px; }
.safety-list li .ico { width: 18px; height: 18px; margin-top: 2px; color: var(--amber); }

.foot-note { text-align: center; color: var(--ink); font-size: 0.82rem; font-weight: 500; padding: 26px 20px 0; }

/* ---------- Multi-select (Usage history fertilizer field) ---------- */

.multiselect { position: relative; }
.multiselect__btn {
  width: 100%;
  text-align: left;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink);
  background: var(--field);
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 11px 34px 11px 12px;
  cursor: pointer;
  position: relative;
  min-height: 42px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.multiselect__btn::after {
  content: "";
  position: absolute;
  right: 14px;
  top: 50%;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--ink);
  border-bottom: 2px solid var(--ink);
  transform: translateY(-70%) rotate(45deg);
  pointer-events: none;
}
.multiselect__btn:hover, .multiselect__btn.is-open { border-color: var(--forest); }
.multiselect__btn .ph { color: #666; font-weight: 500; }
.multiselect__panel {
  display: none;
  position: absolute;
  z-index: 25;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: #FFFFFF;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  padding: 6px;
}
.multiselect__panel.is-open { display: block; }
.multiselect__item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}
.multiselect__item:hover { background: var(--field); }
.multiselect__item input { width: 16px; height: 16px; accent-color: var(--forest); flex: none; }
.multiselect__chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.multiselect__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 6px 5px 10px;
  border-radius: 999px;
  background: var(--leaf-soft);
  border: 1px solid #B9DEC5;
  color: var(--ink);
}
.multiselect__chip button {
  border: none;
  background: rgba(0,0,0,0.08);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* ---------- Bottom navigation ---------- */

.bottomnav {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  z-index: 30;
  display: flex;
  gap: 4px;
  padding: 6px;
  width: min(520px, calc(100% - 20px));
  background: rgba(15, 42, 29, 0.97);
  border-radius: 24px;
  box-shadow: 0 16px 34px -10px rgba(0, 0, 0, 0.55);
}
.bottomnav a { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 9px 4px; border-radius: 18px; color: #DDEEE3; text-decoration: none; font-size: 0.72rem; font-weight: 700; }
.bottomnav a .ico { width: 21px; height: 21px; }
.bottomnav a.is-active { background: var(--leaf); color: #04140B; }

/* ---------- Responsive ---------- */

@media (max-width: 700px) {
  .form-top { grid-template-columns: 1fr; }
  .npk-item { grid-template-columns: 1fr; gap: 8px; }
  .two-col { grid-template-columns: 1fr; }
  .mini-grid { grid-template-columns: 1fr; }
  .schedule-row { grid-template-columns: 1fr; gap: 4px; }
  .history-form { grid-template-columns: 1fr 1fr; }
  .history-form--narrow { grid-template-columns: 1fr; }
}

@media (max-width: 620px) {
  .topbar { padding: 12px 14px; gap: 10px; grid-template-columns: auto 1fr auto; }
  .topbar__wordmark { display: none; }
  .topbar__title { grid-column: 2; font-size: 1.02rem; }
  .langswitch button { padding: 6px 9px; font-size: 0.72rem; }
  .page { padding: 16px 14px 0; }
  .hero { padding: 24px 20px 22px; }
  .hero h2 { font-size: 1.5rem; }
  section.card { padding: 20px 18px; }
  .qty-row { grid-template-columns: 1.6fr 1fr 0.6fr; gap: 6px; padding: 12px 10px; }
  .nutri-bars { gap: 8px; }
  .ftype__body-inner { padding-left: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .result.is-visible { animation: none; }
  .ftype__body { transition: none; }
}

@media print {
  body.printing-result * { visibility: hidden; }
  body.printing-result #resultCard, body.printing-result #resultCard * { visibility: visible; }
  body.printing-result #resultCard { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
  body.printing-result .result__actions { display: none; }
}
:root { --forest: #4CAF6D; --forest-deep: #3E9A5C; }

.hero {
  background:
    radial-gradient(420px 220px at 100% 0%, rgba(255,255,255,0.25), transparent 70%),
    radial-gradient(360px 240px at 0% 100%, rgba(139,94,52,0.25), transparent 70%),
    linear-gradient(160deg, #4CAF6D 0%, #3E9A5C 100%);
}
.btn-primary {
  background: linear-gradient(180deg, #5BBD7B, var(--forest));
  box-shadow: 0 10px 20px -12px rgba(62,154,92,0.8);
}
.topbar__logo { background: #FFFFFF; color: var(--forest-deep); }
.topbar__wordmark-nova { color: #FFFFFF; }
.langswitch button.is-active { background: #FFFFFF; color: var(--forest-deep); }

.bottomnav { background: rgba(76,175,109,0.97); }
.bottomnav a { color: #FFFFFF; }
.bottomnav a.is-active { background: #FFFFFF; color: var(--forest-deep); }
/* ===== Header exactly like the AgriNova screenshot ===== */
.topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
  padding: 16px 28px;
  padding-top: calc(16px + env(safe-area-inset-top, 0px));
  background: #2E7D32;
  color: #fff;
  box-shadow: none;
  font-family: "Poppins", "Segoe UI", sans-serif;
}
.topbar__brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
.topbar__logo { width: 28px; height: 28px; background: transparent; color: #CCFF90; border-radius: 0; display: grid; place-items: center; }
.topbar__logo .ico { width: 28px; height: 28px; }
.topbar__text { display: flex; flex-direction: column; line-height: 1.1; }
.topbar__wordmark { display: block !important; font-family: "Poppins", sans-serif; font-weight: 700; font-size: 1.6rem; letter-spacing: 0; }
.topbar__wordmark-agri { color: #FFFFFF; }
.topbar__wordmark-nova { color: #CCFF90; }
.topbar__tagline { margin-top: 3px; font-family: "Poppins", sans-serif; font-weight: 700; font-size: 0.56rem; letter-spacing: 0.06em; text-transform: uppercase; color: #fff; }

.topbar__right { display: flex; align-items: center; gap: 10px; }
.langswitch { display: flex; gap: 10px; padding: 0; background: transparent; border-radius: 0; }
.langswitch button {
  border: 1.5px solid rgba(255,255,255,0.85);
  background: transparent; color: #fff;
  font-family: "Poppins", "Segoe UI", sans-serif; font-weight: 600; font-size: 0.95rem;
  padding: 7px 18px; border-radius: 999px; cursor: pointer;
}
.langswitch button:not(.is-active):hover { background: rgba(255,255,255,0.15); }
.langswitch button.is-active { background: #43A047; color: #fff; border-color: rgba(255,255,255,0.85); }

.topbar__back {
  width: 44px; height: 44px; flex: none;
  border: none; border-radius: 50%;
  background: #E8F5E9; color: #1B3A1F;
  display: grid; place-items: center; cursor: pointer;
  box-shadow: 0 4px 12px -4px rgba(0,0,0,0.35);
}
.topbar__back:hover { background: #fff; }
.topbar__back svg { width: 22px; height: 22px; }

@media (max-width: 620px) {
  .topbar { padding: 12px 14px; padding-top: calc(12px + env(safe-area-inset-top, 0px)); }
  .topbar__wordmark { font-size: 1.2rem; }
  .topbar__tagline { font-size: 0.44rem; }
  .langswitch { gap: 6px; }
  .langswitch button { font-size: 0.78rem; padding: 6px 11px; }
  .topbar__back { width: 38px; height: 38px; }
}
/* ===== Header green accents + farm.jpg background ===== */
:root {
  --forest: #2E7D32;
  --forest-deep: #1B5E20;
  --leaf: #2E7D32;
  --leaf-soft: #FFFFFF;
}

/* Hero, main button, bottom menu = header green */
.hero {
  background:
    radial-gradient(420px 220px at 100% 0%, rgba(255,255,255,0.18), transparent 70%),
    linear-gradient(160deg, #2E7D32 0%, #1B5E20 100%);
}
.btn-primary {
  background: linear-gradient(180deg, #388E3C, #2E7D32);
  box-shadow: 0 10px 20px -12px rgba(27,94,32,0.9);
}
.btn-primary:hover { background: #1B5E20; }
.bottomnav { background: rgba(46,125,50,0.97); }
.bottomnav a { color: #FFFFFF; }
.bottomnav a.is-active { background: #FFFFFF; color: #1B5E20; }

/* Light green boxes -> white box with header-green border */
.chip,
.multiselect__chip,
.reminder-banner,
.ai-insight {
  background: #FFFFFF;
  border: 1.5px solid #2E7D32;
}
.reminder-banner.is-due { background: var(--danger-soft); border-color: #F0B4B0; }
.check-list li::before,
.tick-list li::before { background: #FFFFFF; border-color: #2E7D32; }
.result__sec .ico { background: #2E7D32; color: #FFFFFF; }
select:focus-visible, .input:focus-visible, textarea:focus-visible,
.history-form input:focus-visible { box-shadow: 0 0 0 3px rgba(46,125,50,0.25); }


/* ===== farm.jpg background (HTML img, sharp, full screen) ===== */
/* ===== farm.jpg background ===== */
html { background: #F4F4F4 !important; }
body { background: transparent !important; }
.bg-photo {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  object-position: center;
  z-index: -1;
  pointer-events: none;
}
/* Section titles + footer readable on the photo */
.sec__label {
  display: inline-flex;
  background: rgba(255,255,255,0.93);
  padding: 8px 18px 8px 8px;
  border-radius: 999px;
}
.foot-note {
  background: rgba(255,255,255,0.93);
  border-radius: 14px;
  margin: 26px 20px 0;
  padding: 14px 16px;
}
/* ===== Center title in header ===== */
.topbar__title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  font-family: "Poppins", "Segoe UI", sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #FFFFFF;
  white-space: nowrap;
  pointer-events: none;
}
html[lang="ta"] .t-en { display: none; }
html:not([lang="ta"]) .t-ta { display: none; }
@media (max-width: 760px) { .topbar__title { display: none; } }
/* ===== Header keezhe gap ===== */
.page { padding-top: 40px !important; }
.hero { margin-top: 0; } 

</style>
</head>
<body>
<img class="bg-photo" src="farm.jpg" alt="" aria-hidden="true"
 onerror="var f=['images/farm.jpg','assets/farm.jpg','img/farm.jpg','../farm.jpg','../images/farm.jpg','Farm.jpg','farm.jpeg','farm.png'];var i=+(this.dataset.i||0);if(i<f.length){this.dataset.i=i+1;this.src=f[i];}">

<header class="topbar">
  <div class="topbar__brand">
    <span class="topbar__logo"><span class="ico" data-icon="sprout"></span></span>
    <div class="topbar__text">
      <span class="topbar__wordmark"><span class="topbar__wordmark-agri">Agri</span><span class="topbar__wordmark-nova">Nova</span></span>
      <span class="topbar__tagline">Smart Agriculture Management System</span>
    </div>
  </div>

  <h1 class="topbar__title"><span class="t-en">Fertilizer</span><span class="t-ta">உரம்</span></h1>

  <div class="topbar__right">
    <nav class="langswitch" aria-label="Language">
      <button type="button" data-lang="ta">தமிழ்</button>
      <button type="button" data-lang="en">English</button>
    </nav>
    <a href="dashboard.html" class="topbar__back" aria-label="Back to dashboard">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
    </a>
  </div>
</header>
</header>

<main class="page">

  <!-- Hero -->
  <section class="hero" aria-labelledby="heroTitle">
    <span class="hero__eyebrow"><span class="ico" data-icon="leaf"></span><span data-i18n="heroEyebrow">Smart farming assistant</span></span>
    <h2 id="heroTitle" data-i18n="heroTitle">Right fertilizer. Right dose. Right time.</h2>
    <p data-i18n="heroSub">Get a complete crop-wise fertilizer plan for your field.</p>
  </section>
  <!-- 1. Smart recommendation -->
  <div class="sec" id="sec-recommend">
    <p class="sec__label"><span class="ico" data-icon="sprout"></span><span data-i18n="grpSmart">Smart recommendation</span></p>

    <section class="card" id="formCard" aria-labelledby="formTitle">
      <div class="card__head">
        <h2 id="formTitle" data-i18n="formTitle">Field details</h2>
        <span class="card__hint" data-i18n="formHint">All fields required</span>
      </div>

      <form id="recommendForm">
        <div class="form-top">
          <div class="field">
            <label for="cropSelect" data-i18n="cropLabel">Select crop</label>
            <div class="select-wrap"><select id="cropSelect" required></select></div>
          </div>
          <div class="field">
            <label for="soilSelect" data-i18n="soilLabel">Select soil type</label>
            <div class="select-wrap"><select id="soilSelect" required></select></div>
          </div>
          <div class="field">
            <label for="areaInput" data-i18n="areaLabel">Land area (acres)</label>
            <input type="number" id="areaInput" class="input" min="0.25" max="1000" step="0.25" value="1" inputmode="decimal" required />
          </div>
        </div>

        <div class="nutrient-block">
          <p class="field-label" data-i18n="nutrientLabel">Soil nutrient status</p>
          <div class="npk-rows" id="npkRows"></div>
        </div>

        <button type="submit" class="btn-primary" data-i18n="btn">Get my fertilizer plan</button>
      </form>
    </section>

    <section class="card" id="resultCard" aria-labelledby="resultTitle" aria-live="polite">
      <div class="card__head">
        <h2 id="resultTitle" data-i18n="resultTitle">Your fertilizer plan</h2>
      </div>
      <p id="resultPlaceholder" class="result__placeholder" data-i18n="resultPlaceholder">Your plan will appear here.</p>
      <div class="result" id="resultBody"></div>
    </section>

    <section class="card" aria-labelledby="nutriTitle">
      <div class="card__head">
        <h2 id="nutriTitle" data-i18n="nutriTitle">Soil nutrient analysis</h2>
      </div>
      <p id="nutriPlaceholder" class="result__placeholder" data-i18n="nutriPlaceholder">Submit your field details to see your soil analysis.</p>
      <div id="nutriBody"></div>
    </section>
  </div>
</section>
  <!-- 2. Fertilizer library -->
  <div class="sec" id="sec-library">
    <p class="sec__label"><span class="ico" data-icon="flask"></span><span data-i18n="grpLibrary">Fertilizer library</span></p>
    <section class="card" aria-labelledby="libraryTitle">
      <div class="card__head">
        <h2 id="libraryTitle" data-i18n="libraryTitle">Browse by type</h2>
        <span class="card__hint" data-i18n="typesHint">Tap to expand</span>
      </div>
      <div class="tabbar" id="libraryTabs" role="tablist"></div>
      <div class="ftype-list" id="ftypeList"></div>
    </section>
  </div>

  <!-- 3. Schedule, irrigation, warnings -->
  <div class="sec" id="sec-schedule">
    <p class="sec__label"><span class="ico" data-icon="calendar"></span><span data-i18n="grpSchedule">Schedule, irrigation &amp; warnings</span></p>

    <section class="card" aria-labelledby="scheduleTitle">
      <div class="card__head">
        <h2 id="scheduleTitle" data-i18n="scheduleTitle">Fertilizer schedule</h2>
      </div>
      <div class="field" style="margin-bottom:16px">
        <label for="scheduleCropSelect" data-i18n="cropLabel">Select crop</label>
        <div class="select-wrap"><select id="scheduleCropSelect"></select></div>
      </div>
      <div class="schedule-list" id="scheduleList"></div>
    </section>

    <section class="card" aria-labelledby="irrigationTitle">
      <div class="card__head">
        <h2 id="irrigationTitle" data-i18n="irrigationTitle">Fertilizer + irrigation</h2>
      </div>
      <ul class="tick-list" id="irrigationList"></ul>
    </section>

    <section class="card" aria-labelledby="warningTitle">
      <div class="card__head">
        <h2 id="warningTitle" data-i18n="warningTitle">Warning signs to watch</h2>
      </div>
      <div id="warningBanner" class="warning-banner" style="display:none"></div>
      <ul class="warning-list" id="warningList"></ul>
    </section>
  </div>

  <!-- 4. History, effect tracking, reminder -->
  <div class="sec" id="sec-track">
    <p class="sec__label"><span class="ico" data-icon="clipboard"></span><span data-i18n="grpHistory">History, tracking &amp; reminders</span></p>

    <section class="card" aria-labelledby="historyTitle">
      <div class="card__head">
        <h2 id="historyTitle" data-i18n="historyTitle">Usage history</h2>
        <span class="card__hint" data-i18n="historyHint">Your saved log</span>
      </div>

      <form id="historyForm" class="history-form">
        <div class="field">
          <label for="logDate" data-i18n="logDateLabel">Date</label>
          <input type="date" id="logDate" required />
        </div>
        <div class="field">
          <label for="logCrop" data-i18n="cropLabel">Select crop</label>
          <div class="select-wrap"><select id="logCrop" required></select></div>
        </div>
        <div class="field">
          <label for="logFertilizerBtn" data-i18n="rowFertilizer">Fertilizer</label>
          <div class="multiselect" id="logFertilizerMulti">
            <button type="button" class="multiselect__btn" id="logFertilizerBtn" aria-haspopup="listbox" aria-expanded="false"></button>
            <div class="multiselect__panel" id="logFertilizerPanel" role="listbox" aria-multiselectable="true"></div>
          </div>
        </div>
        <div class="field">
          <label for="logQty" data-i18n="logQtyLabel">Quantity</label>
          <input type="text" id="logQty" placeholder="e.g. 25kg/acre" required />
        </div>
        <button type="submit" class="btn-primary btn-primary--small" data-i18n="logAddBtn">Add entry</button>
      </form>

      <div class="history-empty" id="historyEmpty" data-i18n="historyEmpty">No entries yet.</div>
      <div class="history-list" id="historyList"></div>
    </section>

    <section class="card" aria-labelledby="effectTitle">
      <div class="card__head">
        <h2 id="effectTitle" data-i18n="effectTitle">Effect tracking</h2>
        <span class="card__hint" data-i18n="effectHint">Rate your latest entry</span>
      </div>
      <div id="effectEmpty" class="history-empty" data-i18n="effectEmpty">Add a usage entry first.</div>
      <div id="effectPanel" class="effect-panel" style="display:none">
        <p class="effect-panel__entry" id="effectEntryLabel"></p>
        <div class="star-rating" id="starRating"></div>
        <textarea id="effectNotes" class="effect-notes" rows="2" data-i18n-ph="effectNotesPh" placeholder="Notes on crop response..."></textarea>
        <div><button type="button" id="saveEffectBtn" class="btn-primary btn-primary--small" data-i18n="effectSaveBtn">Save effect</button></div>
      </div>
    </section>

    <section class="card" aria-labelledby="reminderTitle">
      <div class="card__head">
        <h2 id="reminderTitle" data-i18n="reminderTitle">Set a reminder</h2>
      </div>
      <div id="reminderBanner" class="reminder-banner" style="display:none"></div>
      <form id="reminderForm" class="history-form history-form--narrow">
        <div class="field">
          <label for="reminderDate" data-i18n="reminderDateLabel">Next application date</label>
          <input type="date" id="reminderDate" required />
        </div>
        <div class="field">
          <label for="reminderNote" data-i18n="reminderNoteLabel">Note</label>
          <input type="text" id="reminderNote" placeholder="e.g. Top dressing for rice" />
        </div>
        <button type="submit" class="btn-primary btn-primary--small" data-i18n="reminderSaveBtn">Save reminder</button>
      </form>
    </section>
  </div>

  <!-- 5. Tips & safety -->
  <div class="sec" id="sec-tips">
    <p class="sec__label"><span class="ico" data-icon="bulb"></span><span data-i18n="grpTips">Tips &amp; safety</span></p>

    <section class="card" aria-labelledby="knowledgeTitle">
      <div class="card__head">
        <h2 id="knowledgeTitle" data-i18n="knowledgeTitle">Knowledge tip</h2>
      </div>
      <p class="knowledge-tip" id="knowledgeTip"></p>
      <button type="button" id="nextTipBtn" class="btn-secondary" data-i18n="nextTipBtn">Next tip</button>
    </section>

    <div class="two-col">
      <section class="card" aria-labelledby="guideTitle">
        <div class="card__head">
          <h2 id="guideTitle" data-i18n="guideTitle">Application guide</h2>
        </div>
        <ol class="stepped" id="guideList"></ol>
      </section>

      <section class="card" aria-labelledby="safetyTitle">
        <div class="card__head">
          <h2 id="safetyTitle" data-i18n="safetyTitle">Safety &amp; storage</h2>
        </div>
        <ul class="safety-list" id="safetyList"></ul>
      </section>
    </div>
  </div>

  <p class="foot-note" data-i18n="footNote">
    Recommendations are general guidance. Confirm exact dosage with your local agriculture officer or soil-testing report.
  </p>

</main>

<nav class="bottomnav" aria-label="Sections">
  <a href="#sec-recommend" class="is-active"><span class="ico" data-icon="sprout"></span><span data-i18n="navRecommend">Recommend</span></a>
  <a href="#sec-library"><span class="ico" data-icon="flask"></span><span data-i18n="navLibrary">Library</span></a>
  <a href="#sec-schedule"><span class="ico" data-icon="calendar"></span><span data-i18n="navSchedule">Schedule</span></a>
  <a href="#sec-track"><span class="ico" data-icon="clipboard"></span><span data-i18n="navTrack">Track</span></a>
  <a href="#sec-tips"><span class="ico" data-icon="bulb"></span><span data-i18n="navTips">Tips</span></a>
</nav>

<script>
/* ===================================================
   AgriNova — Fertilizer Management logic (app edition)
   EN / TA toggle, smart recommendation engine with
   quantities + stage plan, AI-powered field insight,
   soil analysis, library, schedule, warnings, history
   (multi-fertilizer), reminders, tips.
=================================================== */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // Your Render backend URL. This page is served from a different origin
  // (e.g. a local Live Server), so it must call the FULL backend URL.
  const API_BASE = "https://disease-detector-e5du.onrender.com";

  function escapeHTML(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  /* ---------------- Icons (inline SVG) ---------------- */

  const ICONS = {
    sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    flask: '<path d="M10 2v7.5a2 2 0 0 1-.2.9L4.7 20.5a1 1 0 0 0 .9 1.5h12.8a1 1 0 0 0 .9-1.5l-5.1-10.1a2 2 0 0 1-.2-.9V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
    drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
    swap: '<path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/>',
    sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  };

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }
  function injectIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
  }

  /* ---------------- Static UI text ---------------- */

  const STRINGS = {
    en: {
      title: "Fertilizer Management",
      heroEyebrow: "Smart farming assistant",
      heroTitle: "Right fertilizer. Right dose. Right time.",
      heroSub: "Get a complete crop-wise fertilizer plan for your field: exact quantities, stage-wise timing, organic support and safety tips.",
      heroAsk: "What are you growing?",
      navRecommend: "Recommend",
      navLibrary: "Library",
      navSchedule: "Schedule",
      navTrack: "Track",
      navTips: "Tips",
      grpSmart: "Smart recommendation",
      formTitle: "Field details",
      formHint: "All fields required",
      cropLabel: "Select crop",
      soilLabel: "Select soil type",
      areaLabel: "Land area (acres)",
      nutrientLabel: "Soil nutrient status (from your soil test)",
      nLabel: "Nitrogen (N)",
      pLabel: "Phosphorus (P)",
      kLabel: "Potassium (K)",
      low: "Low",
      medium: "Medium",
      high: "High",
      btn: "Get my fertilizer plan",
      resultTitle: "Your fertilizer plan",
      resultPlaceholder: "Fill in your field details above and tap “Get my fertilizer plan”. Your quantities, stage-wise schedule and care tips will appear here.",
      planFor: "Fertilizer plan for",
      acreUnit: "acre(s)",
      secRequirement: "Fertilizer requirement",
      colProduct: "Fertilizer",
      colQty: "Quantity",
      colBags: "Bags",
      qtyNote: "Quantities are for {area} acre(s) and adjusted to your soil-test status. Bag sizes: urea 45 kg, others 50 kg.",
      allHighNote: "Your soil is already rich in all three nutrients, so doses are cut by half. Focus on organic matter and avoid extra chemical fertilizer.",
      secPlan: "Stage-wise application plan",
      secOrganic: "Organic & bio-fertilizer support",
      fymTitle: "Farmyard manure / compost",
      fymText: "{t} tonnes, mixed into the soil during land preparation.",
      bioTitle: "Bio-fertilizers",
      extraTitle: "Extra organic tip",
      secMicro: "Micronutrients & special care",
      secSoil: "Advice for your soil type",
      secAlt: "If a fertilizer is not available",
      secCaution: "Watch out",
      secAi: "AI insight for your field",
      aiLoading: "Fetching a personalized AI tip for this field...",
      aiError: "Could not fetch the AI insight — the rest of your plan above is still valid.",
      aiFertilizerName: "Suggested product",
      aiDosage: "Dosage",
      aiApplication: "How & when",
      aiStage: "Current stage",
      aiTip: "Extra tip",
      btnShare: "Share on WhatsApp",
      btnPrint: "Print plan",
      nutriTitle: "Soil nutrient analysis",
      nutriPlaceholder: "Submit your field details above to see your soil fertility index, N-P-K levels and what they mean.",
      fertilityIndex: "Soil fertility index",
      fertLow: "Needs attention",
      fertMid: "Moderate",
      fertGood: "Good",
      rowFertilizer: "Fertilizer",
      selectFertPh: "Select fertilizer(s)",
      grpLibrary: "Fertilizer library",
      libraryTitle: "Browse by type",
      typesHint: "Tap to expand",
      tabChemical: "Chemical",
      tabOrganic: "Organic",
      tabInorganic: "Minerals",
      tabBio: "Bio-fertilizers",
      grpSchedule: "Schedule, irrigation & warnings",
      scheduleTitle: "Fertilizer schedule",
      irrigationTitle: "Fertilizer + irrigation",
      warningTitle: "Warning signs to watch",
      grpHistory: "History, tracking & reminders",
      historyTitle: "Usage history",
      historyHint: "Your saved log",
      logDateLabel: "Date",
      logQtyLabel: "Quantity",
      logAddBtn: "Add entry",
      historyEmpty: "No entries yet — add your first application above.",
      effectTitle: "Effect tracking",
      effectHint: "Rate your latest entry",
      effectEmpty: "Add a usage entry first to track its effect.",
      effectNotesPh: "Notes on crop response...",
      effectSaveBtn: "Save effect",
      effectSaved: "Saved",
      reminderTitle: "Set a reminder",
      reminderDateLabel: "Next application date",
      reminderNoteLabel: "Note",
      reminderSaveBtn: "Save reminder",
      reminderDueSoon: "days left —",
      reminderOverdue: "Overdue —",
      reminderToday: "Due today —",
      grpTips: "Tips & safety",
      knowledgeTitle: "Knowledge tip",
      nextTipBtn: "Next tip",
      guideTitle: "Application guide",
      safetyTitle: "Safety & storage",
      footNote: "Recommendations are general guidance. Confirm exact dosage with your local agriculture officer or soil-testing report.",
    },
    ta: {
      title: "உர மேலாண்மை",
      heroEyebrow: "நுண்ணறிவு விவசாய உதவியாளர்",
      heroTitle: "சரியான உரம். சரியான அளவு. சரியான நேரம்.",
      heroSub: "உங்கள் நிலத்திற்கான முழுமையான பயிர் வாரியான உரத் திட்டத்தைப் பெறுங்கள்: சரியான அளவுகள், நிலை வாரியான நேரம், இயற்கை உர ஆதரவு மற்றும் பாதுகாப்பு குறிப்புகள்.",
      heroAsk: "நீங்கள் என்ன பயிரிடுகிறீர்கள்?",
      navRecommend: "பரிந்துரை",
      navLibrary: "நூலகம்",
      navSchedule: "அட்டவணை",
      navTrack: "பதிவு",
      navTips: "குறிப்புகள்",
      grpSmart: "நுண்ணறிவு பரிந்துரை",
      formTitle: "நில விவரங்கள்",
      formHint: "அனைத்தும் கட்டாயம்",
      cropLabel: "பயிரைத் தேர்ந்தெடுக்கவும்",
      soilLabel: "மண் வகையைத் தேர்ந்தெடுக்கவும்",
      areaLabel: "நில பரப்பு (ஏக்கர்)",
      nutrientLabel: "மண் ஊட்டச்சத்து நிலை (மண் பரிசோதனை அடிப்படையில்)",
      nLabel: "நைட்ரஜன் (N)",
      pLabel: "பாஸ்பரஸ் (P)",
      kLabel: "பொட்டாசியம் (K)",
      low: "குறைவு",
      medium: "நடுத்தரம்",
      high: "அதிகம்",
      btn: "எனது உரத் திட்டத்தைப் பெறு",
      resultTitle: "உங்கள் உரத் திட்டம்",
      resultPlaceholder: "மேலே நில விவரங்களை நிரப்பி “எனது உரத் திட்டத்தைப் பெறு” என்பதைத் தட்டவும். உங்கள் உர அளவுகள், நிலை வாரியான அட்டவணை மற்றும் பராமரிப்பு குறிப்புகள் இங்கே தோன்றும்.",
      planFor: "உரத் திட்டம்:",
      acreUnit: "ஏக்கர்",
      secRequirement: "உரத் தேவை",
      colProduct: "உரம்",
      colQty: "அளவு",
      colBags: "மூட்டை",
      qtyNote: "அளவுகள் {area} ஏக்கருக்கானவை; உங்கள் மண் பரிசோதனை நிலைக்கு ஏற்ப சரிசெய்யப்பட்டவை. மூட்டை எடை: யூரியா 45 கிலோ, மற்றவை 50 கிலோ.",
      allHighNote: "உங்கள் மண்ணில் மூன்று ஊட்டச்சத்துகளும் ஏற்கனவே அதிகமாக உள்ளதால் அளவுகள் பாதியாகக் குறைக்கப்பட்டுள்ளன. கரிமப் பொருளில் கவனம் செலுத்துங்கள்; கூடுதல் இரசாயன உரத்தைத் தவிர்க்கவும்.",
      secPlan: "நிலை வாரியான உரமிடும் திட்டம்",
      secOrganic: "இயற்கை & உயிர் உர ஆதரவு",
      fymTitle: "தொழுவுரம் / உரக்குவியல்",
      fymText: "{t} டன், நில தயாரிப்பின் போது மண்ணில் கலக்கவும்.",
      bioTitle: "உயிர் உரங்கள்",
      extraTitle: "கூடுதல் இயற்கை குறிப்பு",
      secMicro: "நுண்ணூட்டம் & சிறப்பு கவனிப்பு",
      secSoil: "உங்கள் மண் வகைக்கான ஆலோசனை",
      secAlt: "உரம் கிடைக்கவில்லை எனில்",
      secCaution: "கவனிக்க வேண்டியவை",
      secAi: "உங்கள் நிலத்திற்கான AI பரிந்துரை",
      aiLoading: "இந்த நிலத்திற்கான தனிப்பயன் AI குறிப்பைப் பெறுகிறது...",
      aiError: "AI குறிப்பைப் பெற முடியவில்லை — மேலே உள்ள மற்ற திட்டம் இன்னும் செல்லுபடியாகும்.",
      aiFertilizerName: "பரிந்துரைக்கப்பட்ட உரம்",
      aiDosage: "அளவு",
      aiApplication: "எப்படி & எப்போது",
      aiStage: "தற்போதைய நிலை",
      aiTip: "கூடுதல் குறிப்பு",
      btnShare: "வாட்ஸ்அப்பில் பகிர்",
      btnPrint: "திட்டத்தை அச்சிடு",
      nutriTitle: "மண் ஊட்டச்சத்து பகுப்பாய்வு",
      nutriPlaceholder: "மேலே நில விவரங்களைச் சமர்ப்பித்து உங்கள் மண் வளக் குறியீடு, N-P-K அளவுகள் மற்றும் அவற்றின் பொருளைப் பாருங்கள்.",
      fertilityIndex: "மண் வளக் குறியீடு",
      fertLow: "கவனம் தேவை",
      fertMid: "மிதமானது",
      fertGood: "நல்லது",
      rowFertilizer: "உரம்",
      selectFertPh: "உரங்களைத் தேர்ந்தெடுக்கவும்",
      grpLibrary: "உர நூலகம்",
      libraryTitle: "வகை வாரியாகப் பார்க்க",
      typesHint: "விரிவாக்க தட்டவும்",
      tabChemical: "இரசாயனம்",
      tabOrganic: "இயற்கை",
      tabInorganic: "கனிம",
      tabBio: "உயிர் உரம்",
      grpSchedule: "அட்டவணை, நீர்ப்பாசனம் & எச்சரிக்கை",
      scheduleTitle: "உர அட்டவணை",
      irrigationTitle: "உரம் + நீர்ப்பாசனம்",
      warningTitle: "கவனிக்க வேண்டிய எச்சரிக்கை அறிகுறிகள்",
      grpHistory: "வரலாறு, கண்காணிப்பு & நினைவூட்டல்",
      historyTitle: "பயன்பாட்டு வரலாறு",
      historyHint: "உங்கள் சேமிக்கப்பட்ட பதிவு",
      logDateLabel: "தேதி",
      logQtyLabel: "அளவு",
      logAddBtn: "பதிவு சேர்க்கவும்",
      historyEmpty: "இன்னும் பதிவுகள் இல்லை — மேலே உங்கள் முதல் பயன்பாட்டைச் சேர்க்கவும்.",
      effectTitle: "பாதிப்பு கண்காணிப்பு",
      effectHint: "உங்கள் சமீபத்திய பதிவை மதிப்பிடவும்",
      effectEmpty: "பாதிப்பைக் கண்காணிக்க முதலில் ஒரு பயன்பாட்டுப் பதிவைச் சேர்க்கவும்.",
      effectNotesPh: "பயிர் தாக்கம் குறித்த குறிப்புகள்...",
      effectSaveBtn: "பாதிப்பைச் சேமிக்கவும்",
      effectSaved: "சேமிக்கப்பட்டது",
      reminderTitle: "நினைவூட்டலை அமைக்கவும்",
      reminderDateLabel: "அடுத்த பயன்பாட்டு தேதி",
      reminderNoteLabel: "குறிப்பு",
      reminderSaveBtn: "நினைவூட்டலைச் சேமிக்கவும்",
      reminderDueSoon: "நாட்கள் மீதம் —",
      reminderOverdue: "தாமதமானது —",
      reminderToday: "இன்று கடைசி நாள் —",
      grpTips: "குறிப்புகள் & பாதுகாப்பு",
      knowledgeTitle: "அறிவுக் குறிப்பு",
      nextTipBtn: "அடுத்த குறிப்பு",
      guideTitle: "பயன்பாட்டு வழிகாட்டி",
      safetyTitle: "பாதுகாப்பு & சேமிப்பு",
      footNote: "இவை பொதுவான வழிகாட்டுதல்கள். சரியான அளவை உங்கள் உள்ளூர் வேளாண் அலுவலரிடம் அல்லது மண் பரிசோதனை அறிக்கையில் உறுதிசெய்யவும்.",
    },
  };

  /* ---------------- Crops & soils ---------------- */

  const CROPS = [
    { v: "rice", en: "Rice", ta: "நெல்" },
    { v: "wheat", en: "Wheat", ta: "கோதுமை" },
    { v: "maize", en: "Maize", ta: "மக்காச்சோளம்" },
    { v: "sorghum", en: "Sorghum", ta: "சோளம்" },
    { v: "pearlmillet", en: "Pearl millet", ta: "கம்பு" },
    { v: "fingermillet", en: "Finger millet (Ragi)", ta: "கேழ்வரகு" },
    { v: "foxtailmillet", en: "Foxtail millet", ta: "தினை" },
    { v: "barnyardmillet", en: "Barnyard millet", ta: "குதிரைவாலி" },
    { v: "blackgram", en: "Black gram", ta: "உளுந்து" },
    { v: "greengram", en: "Green gram", ta: "பாசிப்பயறு" },
    { v: "redgram", en: "Red gram", ta: "துவரை" },
    { v: "bengalgram", en: "Bengal gram", ta: "கொண்டைக்கடலை" },
    { v: "cowpea", en: "Cowpea", ta: "தட்டைப்பயறு" },
    { v: "horsegram", en: "Horse gram", ta: "கொள்ளு" },
    { v: "groundnut", en: "Groundnut", ta: "நிலக்கடலை" },
    { v: "sesame", en: "Sesame", ta: "எள்" },
    { v: "sunflower", en: "Sunflower", ta: "சூரியகாந்தி" },
    { v: "castor", en: "Castor", ta: "ஆமணக்கு" },
    { v: "soybean", en: "Soybean", ta: "சோயாபீன்" },
    { v: "mustard", en: "Mustard", ta: "கடுகு" },
    { v: "tomato", en: "Tomato", ta: "தக்காளி" },
    { v: "brinjal", en: "Brinjal", ta: "கத்தரி" },
    { v: "chilli", en: "Chilli", ta: "மிளகாய்" },
    { v: "okra", en: "Okra (Lady's finger)", ta: "வெண்டை" },
    { v: "onion", en: "Onion", ta: "வெங்காயம்" },
    { v: "potato", en: "Potato", ta: "உருளைக்கிழங்கு" },
    { v: "cabbage", en: "Cabbage", ta: "முட்டைகோஸ்" },
    { v: "cauliflower", en: "Cauliflower", ta: "காலிஃபிளவர்" },
    { v: "cucumber", en: "Cucumber", ta: "வெள்ளரி" },
    { v: "bittergourd", en: "Bitter gourd", ta: "பாகற்காய்" },
    { v: "drumstick", en: "Drumstick", ta: "முருங்கை" },
    { v: "tapioca", en: "Tapioca", ta: "மரவள்ளிக்கிழங்கு" },
    { v: "sweetpotato", en: "Sweet potato", ta: "சர்க்கரைவள்ளிக்கிழங்கு" },
    { v: "carrot", en: "Carrot", ta: "கேரட்" },
    { v: "beans", en: "Beans", ta: "அவரை / பீன்ஸ்" },
    { v: "banana", en: "Banana", ta: "வாழை" },
    { v: "mango", en: "Mango", ta: "மா" },
    { v: "coconut", en: "Coconut", ta: "தென்னை" },
    { v: "papaya", en: "Papaya", ta: "பப்பாளி" },
    { v: "guava", en: "Guava", ta: "கொய்யா" },
    { v: "grapes", en: "Grapes", ta: "திராட்சை" },
    { v: "lemon", en: "Lemon / Citrus", ta: "எலுமிச்சை" },
    { v: "pomegranate", en: "Pomegranate", ta: "மாதுளை" },
    { v: "sapota", en: "Sapota", ta: "சப்போட்டா" },
    { v: "pineapple", en: "Pineapple", ta: "அன்னாசி" },
    { v: "turmeric", en: "Turmeric", ta: "மஞ்சள்" },
    { v: "ginger", en: "Ginger", ta: "இஞ்சி" },
    { v: "garlic", en: "Garlic", ta: "பூண்டு" },
    { v: "coriander", en: "Coriander", ta: "கொத்தமல்லி" },
    { v: "blackpepper", en: "Black pepper", ta: "மிளகு" },
    { v: "cardamom", en: "Cardamom", ta: "ஏலக்காய்" },
    { v: "tea", en: "Tea", ta: "தேயிலை" },
    { v: "coffee", en: "Coffee", ta: "காபி" },
    { v: "cashew", en: "Cashew", ta: "முந்திரி" },
    { v: "arecanut", en: "Arecanut", ta: "பாக்கு" },
    { v: "rubber", en: "Rubber", ta: "ரப்பர்" },
  ];

  const SOILS = [
    { v: "loamy", en: "Loamy soil", ta: "வண்டல் மண்" },
    { v: "clay", en: "Clay soil", ta: "களிமண்" },
    { v: "sandy", en: "Sandy soil", ta: "மணல் மண்" },
    { v: "red", en: "Red soil", ta: "சிவப்பு மண்" },
    { v: "black", en: "Black soil", ta: "கரிசல் மண்" },
    { v: "alluvial", en: "Alluvial soil", ta: "ஆற்று வண்டல் மண்" },
    { v: "laterite", en: "Laterite soil", ta: "லேட்டரைட் (செம்பொறை) மண்" },
    { v: "silty", en: "Silty soil", ta: "சேற்று மண்" },
    { v: "sandyloam", en: "Sandy loam", ta: "மணல் கலந்த வண்டல் மண்" },
    { v: "saline", en: "Saline soil", ta: "உவர் மண்" },
    { v: "alkaline", en: "Alkaline / sodic soil", ta: "கார மண்" },
    { v: "acidic", en: "Acidic soil", ta: "அமில மண்" },
    { v: "calcareous", en: "Calcareous soil", ta: "சுண்ணாம்பு மண்" },
    { v: "hill", en: "Hill / forest soil", ta: "மலை மண்" },
  ];

  const LEVELS = ["low", "medium", "high"];

  /* ---------------- Fertilizer library ---------------- */

  const FERTS = [
    /* Chemical */
    { v: "urea", label: "Urea", category: "chemical", color: "#2F73C4",
      en: "46% nitrogen. Boosts leafy growth and greening. Apply in 2–3 split doses to reduce loss through leaching.",
      ta: "46% நைட்ரஜன் கொண்டது. இலைப் பசுமையையும் வளர்ச்சியையும் அதிகரிக்கும். இழப்பைக் குறைக்க 2–3 பகுதிகளாகப் பிரித்து இடவும்." },
    { v: "dap", label: "DAP", category: "chemical", color: "#1F7A48",
      en: "Di-ammonium phosphate (18-46-0). High in phosphorus, supports strong root development. Best applied as a basal dose at sowing.",
      ta: "டை-அம்மோனியம் பாஸ்பேட் (18-46-0). அதிக பாஸ்பரஸ் கொண்டது, வேர் வளர்ச்சிக்கு உதவும். விதைக்கும் போது அடிப்படை உரமாக இடவும்." },
    { v: "npk", label: "NPK", category: "chemical", color: "#6B4423",
      en: "Balanced complex fertilizer with nitrogen, phosphorus and potassium together. A general-purpose choice across most crops and stages.",
      ta: "நைட்ரஜன், பாஸ்பரஸ், பொட்டாசியம் ஆகிய மூன்றும் சமநிலையில் கொண்ட கூட்டு உரம். பெரும்பாலான பயிர்களுக்கும் நிலைகளுக்கும் பொருந்தும்." },
    { v: "mop", label: "MOP", category: "chemical", color: "#8347C7",
      en: "Muriate of potash — around 60% potassium. Improves disease resistance, grain filling and overall crop quality.",
      ta: "பொட்டாஷ் முரியேட் (MOP) — சுமார் 60% பொட்டாசியம். நோய் எதிர்ப்பு சக்தி, தானிய நிறைவு மற்றும் பயிர் தரத்தை மேம்படுத்தும்." },
    { v: "ssp", label: "SSP", category: "chemical", color: "#B4620F",
      en: "Single super phosphate — phosphorus with sulphur and calcium. Well suited to oilseeds and pulses.",
      ta: "சிங்கிள் சூப்பர் பாஸ்பேட் (SSP) — பாஸ்பரஸுடன் கந்தகமும் கால்சியமும் கொண்டது. எண்ணெய் வித்துக்கள் மற்றும் பயறு வகைகளுக்கு ஏற்றது." },
    { v: "ammsulphate", label: "Ammonium sulphate", category: "chemical", color: "#2F73C4", b: "AS",
      en: "20.6% nitrogen plus 24% sulphur. Good for oilseeds, sugarcane and alkaline soils. It acidifies soil slowly, so avoid it on already acidic soils.",
      ta: "20.6% நைட்ரஜனும் 24% கந்தகமும் கொண்டது. எண்ணெய் வித்துக்கள், கரும்பு மற்றும் கார மண்ணுக்கு நல்லது. மண்ணை மெதுவாக அமிலமாக்குவதால் ஏற்கனவே அமில மண்ணில் தவிர்க்கவும்." },
    { v: "complex20", label: "Complex 20-20-0-13", category: "chemical", color: "#1F7A48", b: "20-20",
      en: "Ammonium phosphate sulphate: nitrogen, phosphorus and sulphur in one granule. A handy basal fertilizer for oilseeds, cotton and cereals.",
      ta: "அம்மோனியம் பாஸ்பேட் சல்பேட்: நைட்ரஜன், பாஸ்பரஸ், கந்தகம் ஒரே மணியில். எண்ணெய் வித்துக்கள், பருத்தி மற்றும் தானியப் பயிர்களுக்கு வசதியான அடி உரம்." },
    { v: "npk19", label: "19:19:19 (water soluble)", category: "chemical", color: "#6B4423", b: "19s",
      en: "Balanced water-soluble NPK for drip fertigation and foliar spray. Useful for a quick boost at critical stages such as flowering.",
      ta: "சொட்டு நீர் உரப்பாசனம் மற்றும் இலைவழி தெளிப்புக்கான நீரில் கரையும் சமநிலை NPK. பூக்கும் போன்ற முக்கிய நிலைகளில் விரைவான ஊக்கம் தரும்." },
    { v: "kno3", label: "Potassium nitrate", category: "chemical", color: "#8347C7", b: "KNO3",
      en: "13% nitrogen and 45% potash, free of chloride. Ideal through drip for cotton, sugarcane and vegetables during flowering and boll or fruit development.",
      ta: "13% நைட்ரஜன் மற்றும் 45% பொட்டாஷ், குளோரைடு இல்லாதது. பருத்தி, கரும்பு, காய்கறிகளில் பூக்கும் மற்றும் காய் வளர்ச்சி நிலையில் சொட்டு நீர் மூலம் இட ஏற்றது." },
    /* Organic */
    { v: "organic", label: "Compost / FYM", category: "organic", color: "#1F4D36",
      en: "Compost or farmyard manure. Builds soil structure and microbial life over time — best used alongside chemical fertilizers.",
      ta: "உரக்குவியல் அல்லது தொழுவ உரம். காலப்போக்கில் மண் அமைப்பையும் நுண்ணுயிர் வளர்ச்சியையும் மேம்படுத்தும் — இரசாயன உரங்களுடன் இணைத்துப் பயன்படுத்தலாம்." },
    { v: "vermicompost", label: "Vermicompost", category: "organic", color: "#1F7A48",
      en: "Earthworm-processed compost, rich in humus and micronutrients. Improves water retention in sandy soils.",
      ta: "மண்புழு மூலம் தயாரிக்கப்பட்ட உரம், ஹியூமஸ் மற்றும் நுண்ணூட்டச்சத்துகள் நிறைந்தது. மணல் மண்ணின் நீர் தேக்கும் திறனை மேம்படுத்தும்." },
    { v: "greenmanure", label: "Green manure", category: "organic", color: "#6B4423",
      en: "Fast-growing legumes like sunhemp or daincha ploughed back into the soil, adding nitrogen and organic matter naturally.",
      ta: "சணப்பை, தக்கைப்பூண்டு போன்ற வேகமாக வளரும் பயறு வகைகளை மண்ணில் உழுது சேர்ப்பது, இயற்கையாக நைட்ரஜனையும் கரிமப்பொருளையும் சேர்க்கும்." },
    { v: "neemcake", label: "Neem cake", category: "organic", color: "#B4620F",
      en: "Neem cake (about 5% N) releases nitrogen slowly and repels soil pests and nematodes. A good basal dose for cotton, maize and vegetables.",
      ta: "வேப்பம் புண்ணாக்கு (சுமார் 5% N) நைட்ரஜனை மெதுவாக வெளியிட்டு மண் பூச்சிகளையும் நூற்புழுக்களையும் விரட்டும். பருத்தி, சோளம் மற்றும் காய்கறிகளுக்கு நல்ல அடி உரம்." },
    { v: "poultry", label: "Poultry manure", category: "organic", color: "#8347C7",
      en: "Rich in N, P and K and faster acting than FYM. Compost it for a few weeks first and keep it from touching seedlings directly.",
      ta: "N, P, K நிறைந்தது; தொழுவுரத்தை விட விரைவாகச் செயல்படும். சில வாரங்கள் மக்கச் செய்த பின்னரே பயன்படுத்தவும்; நாற்றுகளில் நேரடியாகப் படாமல் பார்க்கவும்." },
    { v: "panchagavya", label: "Panchagavya", category: "organic", color: "#1F4D36",
      en: "Traditional liquid made from cow dung, urine, milk, curd and ghee. Diluted to 3% and sprayed to boost growth and plant immunity.",
      ta: "மாட்டுச் சாணம், சிறுநீர், பால், தயிர், நெய் ஆகியவற்றிலிருந்து தயாரிக்கப்படும் பாரம்பரிய திரவம். 3% அளவில் நீர்த்து தெளித்தால் வளர்ச்சியும் எதிர்ப்பு சக்தியும் அதிகரிக்கும்." },
    { v: "jeevamrutham", label: "Jeevamrutham", category: "organic", color: "#1F7A48",
      en: "Fermented mix of cow dung, urine, jaggery, pulse flour and soil. Applied with irrigation water to multiply soil microbes; use within 7 days of preparation.",
      ta: "மாட்டுச் சாணம், சிறுநீர், வெல்லம், பயறு மாவு மற்றும் மண் கலந்து புளிக்க வைக்கும் கலவை. நீர்ப்பாசனத்துடன் இட்டால் மண் நுண்ணுயிர்கள் பெருகும்; தயாரித்த 7 நாட்களுக்குள் பயன்படுத்தவும்." },
    /* Minerals / micronutrients */
    { v: "gypsum", label: "Gypsum", category: "inorganic", color: "#B4620F",
      en: "Calcium sulphate mineral. Improves clay soil structure and supplies calcium and sulphur, especially useful for groundnut.",
      ta: "கால்சியம் சல்பேட் கனிமம். களிமண் அமைப்பை மேம்படுத்தி கால்சியம் மற்றும் கந்தகத்தை வழங்கும், குறிப்பாக நிலக்கடலைக்கு பயனுள்ளது." },
    { v: "lime", label: "Lime", category: "inorganic", color: "#26302A",
      en: "Corrects acidic soils by raising pH, making other nutrients more available to the crop.",
      ta: "மண்ணின் pH ஐ உயர்த்தி அமிலத் தன்மையைச் சரிசெய்யும், இதனால் மற்ற ஊட்டச்சத்துகள் பயிருக்கு எளிதில் கிடைக்கும்." },
    { v: "zincsulphate", label: "Zinc sulphate", category: "inorganic", color: "#2F73C4",
      en: "Corrects zinc deficiency, seen as pale, stunted growth — common in rice and maize on sandy soils.",
      ta: "துத்தநாக குறைபாட்டைச் சரிசெய்யும், மணல் மண்ணில் நெல் மற்றும் சோளத்தில் வெளிர் நிற வளர்ச்சி குன்றலாகத் தெரியும்." },
    { v: "borax", label: "Borax", category: "inorganic", color: "#8347C7",
      en: "Supplies boron, important for flowering and fruit-set in cotton and oilseed crops.",
      ta: "போரான் வழங்கும், பருத்தி மற்றும் எண்ணெய் வித்துப் பயிர்களில் பூக்கும் மற்றும் காய்க்கும் நிலைக்கு முக்கியமானது." },
    { v: "ferroussulphate", label: "Ferrous sulphate", category: "inorganic", color: "#6B4423",
      en: "Corrects iron deficiency (yellow young leaves with green veins), common in groundnut and sugarcane on calcareous or black soils. Use as a 0.5% foliar spray.",
      ta: "இரும்புச் சத்து குறைபாட்டைச் சரிசெய்யும் (பச்சை நரம்புகளுடன் மஞ்சள் இளம் இலைகள்); சுண்ணாம்பு அல்லது கரிசல் மண்ணில் நிலக்கடலை, கரும்பில் பொதுவானது. 0.5% இலைவழி தெளிப்பாக இடவும்." },
    { v: "mgsulphate", label: "Magnesium sulphate", category: "inorganic", color: "#1F7A48",
      en: "Supplies magnesium and sulphur. A 1% foliar spray corrects reddening of cotton leaves and yellowing between the veins.",
      ta: "மெக்னீசியம் மற்றும் கந்தகத்தை வழங்கும். 1% இலைவழி தெளிப்பு பருத்தி இலைகள் சிவப்பாவதையும் நரம்புகளுக்கிடையே மஞ்சளாவதையும் சரிசெய்யும்." },
    /* Bio-fertilizers */
    { v: "rhizobium", label: "Rhizobium", category: "bio", color: "#1F4D36",
      en: "Bacterial culture for pulses and groundnut that fixes atmospheric nitrogen at the root nodules, cutting urea needs.",
      ta: "பயறு மற்றும் நிலக்கடலைக்கான பாக்டீரியா கலவை, வேர் முடிச்சுகளில் வளிமண்டல நைட்ரஜனைச் சேகரித்து யூரியா தேவையைக் குறைக்கும்." },
    { v: "azospirillum", label: "Azospirillum", category: "bio", color: "#1F7A48",
      en: "Free-living bacteria used with cereals like rice, maize and wheat to boost nitrogen availability.",
      ta: "நெல், சோளம், கோதுமை போன்ற தானியப் பயிர்களுடன் பயன்படுத்தப்படும் சுதந்திரமான பாக்டீரியா, நைட்ரஜன் கிடைப்பதை மேம்படுத்தும்." },
    { v: "psb", label: "PSB", category: "bio", color: "#B4620F",
      en: "Phosphate-solubilising bacteria that unlock soil-bound phosphorus, making it available to the crop.",
      ta: "மண்ணில் பூட்டப்பட்ட பாஸ்பரஸை வெளியிடும் பாஸ்பேட் கரைப்பான் பாக்டீரியா, பயிருக்கு எளிதில் கிடைக்கச் செய்யும்." },
    { v: "azotobacter", label: "Azotobacter", category: "bio", color: "#6B4423",
      en: "Soil bacteria that fix nitrogen non-symbiotically — suits a wide range of non-leguminous crops.",
      ta: "தானாகவே நைட்ரஜனைச் சேகரிக்கும் மண் பாக்டீரியா — பயறு அல்லாத பரந்த வகையான பயிர்களுக்குப் பொருந்தும்." },
    { v: "trichoderma", label: "Trichoderma", category: "bio", color: "#2F73C4",
      en: "Beneficial fungus that suppresses root rot, wilt and damping-off. Use for seed treatment or mix with FYM before applying to soil.",
      ta: "வேர் அழுகல், வாடல் மற்றும் நாற்றழுகல் நோய்களை அடக்கும் நன்மை தரும் பூஞ்சை. விதை நேர்த்தி அல்லது தொழுவுரத்துடன் கலந்து மண்ணில் இடலாம்." },
    { v: "vam", label: "VAM (mycorrhiza)", category: "bio", color: "#8347C7", b: "VAM",
      en: "Mycorrhizal fungi that extend the reach of roots, improving phosphorus and water uptake — useful in low-phosphorus soils.",
      ta: "வேர்களின் எல்லையை விரிவாக்கும் மைக்கோரைசா பூஞ்சை; பாஸ்பரஸ் மற்றும் நீர் உறிஞ்சுதலை மேம்படுத்தும் — குறைந்த பாஸ்பரஸ் மண்ணில் பயனுள்ளது." },
    { v: "kmb", label: "Potash-mobilising bacteria", category: "bio", color: "#B4620F", b: "KMB",
      en: "Bacteria that release potassium locked in soil minerals, helping reduce the need for MOP.",
      ta: "மண் கனிமங்களில் பூட்டப்பட்ட பொட்டாசியத்தை விடுவிக்கும் பாக்டீரியா; MOP தேவையைக் குறைக்க உதவும்." },
    { v: "azolla", label: "Azolla", category: "bio", color: "#1F4D36",
      en: "Floating water fern that fixes nitrogen in rice fields. Grow it in the field or add it as green manure.",
      ta: "நெல் வயலில் நைட்ரஜனைச் சேகரிக்கும் அசோலா எனும் மிதக்கும் நீர்ச்செடி. வயலில் வளர்த்தோ பசுந்தாள் உரமாகவோ சேர்க்கலாம்." },
  ];

  const LIBRARY_TABS = ["chemical", "organic", "inorganic", "bio"];
  const LIBRARY_TAB_KEY = { chemical: "tabChemical", organic: "tabOrganic", inorganic: "tabInorganic", bio: "tabBio" };
  let activeLibraryTab = "chemical";

  /* ---------------- Fertilizer schedule (with split fractions) ----------------
     f = share of the total N / P / K applied at that stage. */

  const SCHEDULE = {
    rice: [
      { en: "Basal (at transplanting)", ta: "அடிப்படை (நடவின் போது)", f: { n: 1 / 3, p: 1, k: 0.5 }, detailEn: "Full phosphorus + half potash + one-third nitrogen (as DAP + MOP + Urea).", detailTa: "முழு பாஸ்பரஸ் + பாதி பொட்டாஷ் + மூன்றில் ஒரு பங்கு நைட்ரஜன் (DAP + MOP + யூரியா)." },
      { en: "Tillering (20–25 days)", ta: "பகிர்வு (20–25 நாட்கள்)", f: { n: 1 / 3, p: 0, k: 0 }, detailEn: "One-third nitrogen as urea top dressing.", detailTa: "மூன்றில் ஒரு பங்கு நைட்ரஜனை யூரியாவாக மேல் உரம் இடவும்." },
      { en: "Panicle initiation", ta: "கதிர் தொடக்கம்", f: { n: 1 / 3, p: 0, k: 0.5 }, detailEn: "Remaining nitrogen + remaining potash.", detailTa: "மீதமுள்ள நைட்ரஜன் + மீதமுள்ள பொட்டாஷ்." },
    ],
    wheat: [
      { en: "Basal (at sowing)", ta: "அடிப்படை (விதைப்பின் போது)", f: { n: 0.5, p: 1, k: 1 }, detailEn: "Full phosphorus and potash + half nitrogen.", detailTa: "முழு பாஸ்பரஸ் மற்றும் பொட்டாஷ் + பாதி நைட்ரஜன்." },
      { en: "Crown root initiation (20–25 days)", ta: "வேர் தொடக்க நிலை (20–25 நாட்கள்)", f: { n: 0.5, p: 0, k: 0 }, detailEn: "Remaining nitrogen as urea top dressing.", detailTa: "மீதமுள்ள நைட்ரஜனை யூரியாவாக மேல் உரம் இடவும்." },
    ],
    maize: [
      { en: "Basal (at sowing)", ta: "அடிப்படை (விதைப்பின் போது)", f: { n: 1 / 3, p: 1, k: 1 }, detailEn: "Full phosphorus and potash + one-third nitrogen.", detailTa: "முழு பாஸ்பரஸ் மற்றும் பொட்டாஷ் + மூன்றில் ஒரு பங்கு நைட்ரஜன்." },
      { en: "Knee-high stage", ta: "முழங்கால் உயர நிலை", f: { n: 1 / 3, p: 0, k: 0 }, detailEn: "One-third nitrogen as top dressing.", detailTa: "மூன்றில் ஒரு பங்கு நைட்ரஜனை மேல் உரமாக இடவும்." },
      { en: "Tasseling stage", ta: "பூக்கொத்து நிலை", f: { n: 1 / 3, p: 0, k: 0 }, detailEn: "Remaining nitrogen as final top dressing.", detailTa: "மீதமுள்ள நைட்ரஜனை இறுதி மேல் உரமாக இடவும்." },
    ],
    sugarcane: [
      { en: "Basal (at planting)", ta: "அடிப்படை (நடவின் போது)", f: { n: 1 / 3, p: 1, k: 1 / 3 }, detailEn: "Full phosphorus + one-third nitrogen and potash.", detailTa: "முழு பாஸ்பரஸ் + மூன்றில் ஒரு பங்கு நைட்ரஜன் மற்றும் பொட்டாஷ்." },
      { en: "Tillering phase (45 days)", ta: "பகிர்வு நிலை (45 நாட்கள்)", f: { n: 1 / 3, p: 0, k: 1 / 3 }, detailEn: "One-third nitrogen and potash.", detailTa: "மூன்றில் ஒரு பங்கு நைட்ரஜன் மற்றும் பொட்டாஷ்." },
      { en: "Grand growth phase (90–120 days)", ta: "பெரு வளர்ச்சி நிலை (90–120 நாட்கள்)", f: { n: 1 / 3, p: 0, k: 1 / 3 }, detailEn: "Remaining nitrogen and potash.", detailTa: "மீதமுள்ள நைட்ரஜன் மற்றும் பொட்டாஷ்." },
    ],
    cotton: [
      { en: "Basal (at sowing)", ta: "அடிப்படை (விதைப்பின் போது)", f: { n: 1 / 3, p: 1, k: 1 / 3 }, detailEn: "Full phosphorus + one-third nitrogen and potash.", detailTa: "முழு பாஸ்பரஸ் + மூன்றில் ஒரு பங்கு நைட்ரஜன் மற்றும் பொட்டாஷ்." },
      { en: "Square formation", ta: "மொட்டு உருவாகும் நிலை", f: { n: 1 / 3, p: 0, k: 1 / 3 }, detailEn: "One-third nitrogen and potash.", detailTa: "மூன்றில் ஒரு பங்கு நைட்ரஜன் மற்றும் பொட்டாஷ்." },
      { en: "Boll development", ta: "காய் வளர்ச்சி நிலை", f: { n: 1 / 3, p: 0, k: 1 / 3 }, detailEn: "Remaining nitrogen and potash; add borax if buds are dropping.", detailTa: "மீதமுள்ள நைட்ரஜன் மற்றும் பொட்டாஷ்; மொட்டுகள் உதிர்ந்தால் போராக்ஸ் சேர்க்கவும்." },
    ],
    groundnut: [
      { en: "Basal (at sowing)", ta: "அடிப்படை (விதைப்பின் போது)", f: { n: 1, p: 1, k: 1 }, detailEn: "Full phosphorus and potash with a light starter dose of nitrogen.", detailTa: "முழு பாஸ்பரஸ் மற்றும் பொட்டாஷுடன் லேசான தொடக்க நைட்ரஜன் அளவு." },
      { en: "Flowering stage (40–45 days)", ta: "பூக்கும் நிலை (40–45 நாட்கள்)", f: { n: 0, p: 0, k: 0 }, gypsum: true, detailEn: "Apply gypsum near the root zone to support pod development.", detailTa: "காய் வளர்ச்சிக்கு உதவ வேர் பகுதிக்கு அருகில் ஜிப்சம் இடவும்." },
    ],
  };

  /* ---------------- Crop-wise dose & care data (used by the engine) ----------------
     n / p / k = kg of N, P2O5, K2O per acre at MEDIUM soil status. */

  const CROP_PLAN = {
    rice: {
      n: 48, p: 16, k: 16, pSrc: "dap", fym: 5,
      bio: { en: "Azospirillum + PSB, 2 kg/acre each, mixed with FYM and applied before transplanting. Azolla or blue-green algae can add extra nitrogen.",
             ta: "அசோஸ்பைரில்லம் + PSB ஆகியவற்றை ஏக்கருக்கு தலா 2 கிலோ, தொழுவுரத்துடன் கலந்து நடவுக்கு முன் இடவும். கூடுதல் நைட்ரஜனுக்கு அசோலா அல்லது நீலப்பச்சைப் பாசி சேர்க்கலாம்." },
      organic: { en: "Grow sunhemp or daincha as green manure and plough it in at about 45 days, before transplanting.",
                 ta: "சணப்பை அல்லது தக்கைப்பூண்டை பசுந்தாள் உரமாக வளர்த்து, சுமார் 45 நாட்களில் நடவுக்கு முன் மடக்கி உழவும்." },
      micro: { en: "Zinc sulphate 10 kg/acre as a basal dose (once every 2–3 crops). Spray 0.5% ferrous sulphate if young leaves turn yellow-white.",
               ta: "துத்தநாக சல்பேட் ஏக்கருக்கு 10 கிலோ அடி உரமாக (2–3 பயிருக்கு ஒரு முறை). இளம் இலைகள் மஞ்சள்-வெள்ளையாக மாறினால் 0.5% இரும்பு சல்பேட் தெளிக்கவும்." },
      caution: { en: "Keep a thin film of water and avoid draining the field for 2–3 days after top dressing, otherwise nitrogen is lost.",
                 ta: "மேல் உரமிட்ட பின் 2–3 நாட்களுக்கு நீரை வடிக்காமல் மெல்லிய நீர்ப்படலம் வைத்திருக்கவும்; இல்லையெனில் நைட்ரஜன் வீணாகும்." },
    },
    wheat: {
      n: 48, p: 24, k: 16, pSrc: "dap", fym: 4,
      bio: { en: "Azospirillum + PSB, 2 kg/acre each, mixed with FYM and spread before sowing (or seed treatment as per the packet).",
             ta: "அசோஸ்பைரில்லம் + PSB ஏக்கருக்கு தலா 2 கிலோ, தொழுவுரத்துடன் கலந்து விதைப்பிற்கு முன் தூவவும் (அல்லது பாக்கெட் அளவின்படி விதை நேர்த்தி)." },
      organic: { en: "Neem cake, about 100 kg/acre, with the basal dose improves nitrogen use efficiency.",
                 ta: "அடி உரத்துடன் ஏக்கருக்கு சுமார் 100 கிலோ வேப்பம் புண்ணாக்கு இட்டால் நைட்ரஜன் பயன்பாட்டுத் திறன் கூடும்." },
      micro: { en: "Zinc sulphate 10 kg/acre in zinc-deficient fields. Sulphur (from SSP or gypsum) improves grain protein.",
               ta: "துத்தநாகக் குறைபாடுள்ள வயலில் துத்தநாக சல்பேட் ஏக்கருக்கு 10 கிலோ இடவும்; கந்தகம் (SSP அல்லது ஜிப்சம் மூலம்) தானியப் புரதத்தை மேம்படுத்தும்." },
      caution: { en: "Irrigate right after the crown-root nitrogen top dressing so the fertilizer reaches the roots.",
                 ta: "வேர் தொடக்க நிலையில் நைட்ரஜன் மேல் உரமிட்ட உடனே நீர் பாய்ச்சவும்; அப்போதுதான் அது வேர்களை அடையும்." },
    },
    maize: {
      n: 100, p: 30, k: 30, pSrc: "dap", fym: 5,
      bio: { en: "Azospirillum + PSB, 2 kg/acre each, with FYM at sowing. Seed treatment with the same works too.",
             ta: "விதைப்பின் போது அசோஸ்பைரில்லம் + PSB ஏக்கருக்கு தலா 2 கிலோ தொழுவுரத்துடன் இடவும்; விதை நேர்த்தியும் செய்யலாம்." },
      organic: { en: "Vermicompost, about 1 tonne/acre, at sowing supports early growth and moisture holding.",
                 ta: "விதைப்பின் போது ஏக்கருக்கு சுமார் 1 டன் மண்புழு உரம் இட்டால் ஆரம்ப வளர்ச்சியும் ஈரம் தேக்கும் திறனும் மேம்படும்." },
      micro: { en: "Zinc sulphate 10 kg/acre as a basal dose. White stripes on young leaves mean zinc deficiency — spray 0.5% zinc sulphate.",
               ta: "துத்தநாக சல்பேட் ஏக்கருக்கு 10 கிலோ அடி உரமாக இடவும். இளம் இலைகளில் வெள்ளைக் கோடுகள் தெரிந்தால் துத்தநாகக் குறைபாடு — 0.5% துத்தநாக சல்பேட் தெளிக்கவும்." },
      caution: { en: "Top dress on moist soil and earth up after applying nitrogen. Keep fertilizer out of the leaf whorl to avoid burning.",
                 ta: "ஈரமான மண்ணில் மேல் உரமிட்டு, உரமிட்ட பின் மண் அணைக்கவும்; இலைக் குருத்தில் உரம் படாமல் பார்க்கவும், இல்லையெனில் இலை கருகும்." },
    },
    sugarcane: {
      n: 110, p: 25, k: 45, pSrc: "dap", fym: 10,
      bio: { en: "Azospirillum + PSB, 4 kg/acre each, with FYM at planting. Trichoderma helps reduce sett rot.",
             ta: "நடவின் போது அசோஸ்பைரில்லம் + PSB ஏக்கருக்கு தலா 4 கிலோ தொழுவுரத்துடன் இடவும்; டிரைக்கோடெர்மா கரணை அழுகலைக் குறைக்கும்." },
      organic: { en: "Press-mud compost (about 4 tonnes/acre) and trash mulching recycle nutrients and save water.",
                 ta: "ஏக்கருக்கு சுமார் 4 டன் ஆலைக் கழிவு (பிரஸ்-மட்) உரம் மற்றும் தோகை மூடாக்கு ஊட்டச்சத்தை மறுசுழற்சி செய்து நீரைச் சேமிக்கும்." },
      micro: { en: "Zinc sulphate 10–15 kg/acre and ferrous sulphate if leaves turn yellow. Enough potash raises the sugar content.",
               ta: "இலைகள் மஞ்சளானால் துத்தநாக சல்பேட் ஏக்கருக்கு 10–15 கிலோ மற்றும் இரும்பு சல்பேட் இடவும். போதுமான பொட்டாஷ் கரும்பின் சர்க்கரை அளவை உயர்த்தும்." },
      caution: { en: "Place fertilizer 5–8 cm away from the setts and cover with soil. Avoid nitrogen after the grand growth phase — it lowers sugar recovery.",
                 ta: "உரத்தை கரணை வரிசையிலிருந்து 5–8 செ.மீ. தள்ளி இட்டு மண்ணால் மூடவும்; பெரு வளர்ச்சி நிலைக்குப் பின் நைட்ரஜன் இடுவதைத் தவிர்க்கவும், அது சர்க்கரை அளவைக் குறைக்கும்." },
    },
    cotton: {
      n: 48, p: 24, k: 24, pSrc: "dap", fym: 5,
      bio: { en: "Azospirillum + PSB, 2 kg/acre each, with FYM. Seed treatment with the same mix before sowing also helps.",
             ta: "அசோஸ்பைரில்லம் + PSB ஏக்கருக்கு தலா 2 கிலோ தொழுவுரத்துடன் இடவும்; விதைப்பிற்கு முன் இதே கலவையால் விதை நேர்த்தியும் செய்யலாம்." },
      organic: { en: "Neem cake, about 100 kg/acre, with the basal dose helps against soil pests and improves nutrient use.",
                 ta: "அடி உரத்துடன் ஏக்கருக்கு சுமார் 100 கிலோ வேப்பம் புண்ணாக்கு இட்டால் மண் பூச்சிகள் கட்டுப்படும்; ஊட்டச்சத்து பயன்பாடும் மேம்படும்." },
      micro: { en: "Spray 2% DAP at flowering and again 15 days later to reduce square and boll shedding. Spray 1% magnesium sulphate if leaves turn red.",
               ta: "பூக்கும் நிலையிலும் 15 நாட்கள் கழித்தும் 2% DAP கரைசல் தெளித்தால் மொட்டு, காய் உதிர்வு குறையும்; இலைகள் சிவப்பாக மாறினால் 1% மெக்னீசியம் சல்பேட் தெளிக்கவும்." },
      caution: { en: "Excess nitrogen causes heavy leaf growth, more pest attack and delayed boll opening — do not over-apply.",
                 ta: "அதிக நைட்ரஜன் இலை வளர்ச்சியை மிகைப்படுத்தி பூச்சித் தாக்குதலை அதிகரித்து காய் வெடிப்பைத் தாமதப்படுத்தும் — அளவை மீறாதீர்கள்." },
    },
    groundnut: {
      n: 10, p: 20, k: 30, pSrc: "ssp", fym: 5, gypsum: 160,
      bio: { en: "Seed treatment with Rhizobium + PSB (as per the packet) fixes nitrogen and unlocks phosphorus. Trichoderma seed treatment protects against root rot.",
             ta: "ரைசோபியம் + PSB கொண்டு விதை நேர்த்தி (பாக்கெட் அளவின்படி) நைட்ரஜனைச் சேகரித்து பாஸ்பரஸை விடுவிக்கும்; டிரைக்கோடெர்மா விதை நேர்த்தி வேர் அழுகலைத் தடுக்கும்." },
      organic: { en: "Well-decomposed FYM with Trichoderma before sowing reduces root and collar rot.",
                 ta: "நன்கு மக்கிய தொழுவுரத்தை டிரைக்கோடெர்மாவுடன் விதைப்பிற்கு முன் இட்டால் வேர் மற்றும் கழுத்து அழுகல் குறையும்." },
      micro: { en: "Gypsum 160 kg/acre at flowering supplies calcium and sulphur for pod filling. Spray 0.5% ferrous sulphate if leaves turn yellow (iron deficiency).",
               ta: "பூக்கும் நிலையில் ஜிப்சம் ஏக்கருக்கு 160 கிலோ இடுவது காய் பிடிப்புக்கு கால்சியம், கந்தகம் தரும். இலைகள் மஞ்சளானால் (இரும்புக் குறைபாடு) 0.5% இரும்பு சல்பேட் தெளிக்கவும்." },
      caution: { en: "Avoid heavy nitrogen — this crop fixes its own. Apply gypsum in the pegging zone and earth up.",
                 ta: "அதிக நைட்ரஜன் வேண்டாம் — இப்பயிர் தானே சேகரிக்கும். ஜிப்சத்தை காய் பிடிக்கும் பகுதியில் இட்டு மண் அணைக்கவும்." },
    },
  };

  const LEVEL_FACTOR = { low: 1.25, medium: 1, high: 0.5 };

  const PRODUCT = {
    urea:   { name: "Urea",   bag: 45, role: { en: "Nitrogen (46% N)", ta: "நைட்ரஜன் (46% N)" } },
    dap:    { name: "DAP",    bag: 50, role: { en: "Phosphorus + some nitrogen (18-46-0)", ta: "பாஸ்பரஸ் + சிறிது நைட்ரஜன் (18-46-0)" } },
    ssp:    { name: "SSP",    bag: 50, role: { en: "Phosphorus + sulphur (16% P₂O₅)", ta: "பாஸ்பரஸ் + கந்தகம் (16% P₂O₅)" } },
    mop:    { name: "MOP",    bag: 50, role: { en: "Potassium (60% K₂O)", ta: "பொட்டாசியம் (60% K₂O)" } },
    gypsum: { name: "Gypsum", bag: 50, role: { en: "Calcium + sulphur", ta: "கால்சியம் + கந்தகம்" } },
  };

  /* ---------------- Soil advice, alternatives, insights ---------------- */

  const SOIL_ADVICE = {
    loamy: [
      { en: "Loam holds water and nutrients well — the standard split schedule works.", ta: "வண்டல் மண் நீரையும் ஊட்டச்சத்தையும் நன்கு தக்கவைக்கும் — வழக்கமான பிரித்து இடும் அட்டவணை பொருந்தும்." },
      { en: "Add FYM or compost every season to keep the soil crumbly and full of life.", ta: "மண் பொலபொலப்பாகவும் உயிர்ப்புடனும் இருக்க ஒவ்வொரு பருவமும் தொழுவுரம் அல்லது உரக்குவியல் இடவும்." },
    ],
    clay: [
      { en: "Clay drains slowly — avoid waterlogging after top dressing to prevent nitrogen loss.", ta: "களிமண்ணில் நீர் மெதுவாக வடியும் — மேல் உரமிட்ட பின் நீர் தேங்காமல் பார்த்தால் நைட்ரஜன் இழப்பைத் தடுக்கலாம்." },
      { en: "Add gypsum and organic matter to improve structure and aeration.", ta: "மண் அமைப்பையும் காற்றோட்டத்தையும் மேம்படுத்த ஜிப்சம் மற்றும் கரிமப் பொருள் சேர்க்கவும்." },
      { en: "Top dress when the soil is workable, not sticky.", ta: "மண் ஒட்டாமல் கையாள ஏற்ற பதத்தில் இருக்கும் போது மேல் உரமிடவும்." },
    ],
    sandy: [
      { en: "Sandy soil leaches nutrients fast — split nitrogen into 3–4 smaller doses.", ta: "மணல் மண்ணில் ஊட்டச்சத்து விரைவாக வடிந்துவிடும் — நைட்ரஜனை 3–4 சிறிய அளவுகளாகப் பிரித்து இடவும்." },
      { en: "Add extra FYM or vermicompost to hold water and nutrients (the plan already raises the manure quantity).", ta: "நீரையும் ஊட்டச்சத்தையும் தக்கவைக்க கூடுதல் தொழுவுரம் அல்லது மண்புழு உரம் இடவும் (திட்டத்தில் தொழுவுர அளவு ஏற்கனவே உயர்த்தப்பட்டுள்ளது)." },
      { en: "Irrigate lightly after fertilizing; heavy watering washes nutrients below the roots.", ta: "உரமிட்ட பின் லேசாக நீர் பாய்ச்சவும்; அதிக நீர் ஊட்டச்சத்தை வேருக்குக் கீழே கழுவிவிடும்." },
      { en: "Zinc and sulphur deficiency are common — consider zinc sulphate.", ta: "துத்தநாகம் மற்றும் கந்தகக் குறைபாடு பொதுவானது — துத்தநாக சல்பேட் இடுவதைக் கருத்தில் கொள்ளவும்." },
    ],
    red: [
      { en: "Red soils are usually low in nitrogen, phosphorus and organic matter — never skip FYM.", ta: "சிவப்பு மண்ணில் நைட்ரஜன், பாஸ்பரஸ் மற்றும் கரிமப் பொருள் பொதுவாகக் குறைவு — தொழுவுரத்தைத் தவிர்க்க வேண்டாம்." },
      { en: "Test the pH; if it is below 6, apply lime as per the soil-test requirement.", ta: "pH ஐ சோதிக்கவும்; 6 க்குக் கீழ் இருந்தால் மண் பரிசோதனை பரிந்துரைப்படி சுண்ணாம்பு இடவும்." },
      { en: "Place phosphorus close to the root zone, as red soils bind it quickly.", ta: "சிவப்பு மண் பாஸ்பரஸை விரைவாகப் பிடித்துக்கொள்ளும் என்பதால் அதை வேர் பகுதிக்கு அருகில் இடவும்." },
    ],
    black: [
      { en: "Black soil holds moisture well but cracks when dry — fertilize when moisture is adequate.", ta: "கரிசல் மண் ஈரத்தை நன்கு தேக்கும், ஆனால் காய்ந்தால் வெடிக்கும் — போதிய ஈரம் இருக்கும் போது உரமிடவும்." },
      { en: "It is generally rich in potash and calcium, so potash needs are often lower — follow your soil test.", ta: "இதில் பொட்டாஷ் மற்றும் கால்சியம் பொதுவாக அதிகம் இருப்பதால் பொட்டாஷ் தேவை குறைவாக இருக்கலாம் — மண் பரிசோதனையைப் பின்பற்றவும்." },
      { en: "Zinc and iron deficiency can appear — watch for yellowing of young leaves.", ta: "துத்தநாகம் மற்றும் இரும்புக் குறைபாடு தோன்றலாம் — இளம் இலைகள் மஞ்சளாவதைக் கவனிக்கவும்." },
    ],
  };

  /* ---------- Group-level care, schedules, extra crops & soils ---------- */

  const GROUP_CARE = {
    cereal: {
      bio: { en: "Azospirillum + PSB, 2 kg/acre each, mixed with FYM and applied before sowing or transplanting.", ta: "அசோஸ்பைரில்லம் + PSB ஏக்கருக்கு தலா 2 கிலோ, தொழுவுரத்துடன் கலந்து விதைப்பு அல்லது நடவுக்கு முன் இடவும்." },
      organic: { en: "Neem cake about 100 kg/acre with the basal dose, or a green manure crop ploughed in before sowing.", ta: "அடி உரத்துடன் ஏக்கருக்கு சுமார் 100 கிலோ வேப்பம் புண்ணாக்கு, அல்லது பசுந்தாள் உரப் பயிரை விதைப்பிற்கு முன் மடக்கி உழவும்." },
      micro: { en: "Zinc sulphate 10 kg/acre as a basal dose in deficient fields. Spray 0.5% ferrous sulphate if young leaves turn pale.", ta: "குறைபாடுள்ள வயலில் துத்தநாக சல்பேட் ஏக்கருக்கு 10 கிலோ அடி உரமாக இடவும். இளம் இலைகள் வெளிறினால் 0.5% இரும்பு சல்பேட் தெளிக்கவும்." },
      caution: { en: "Top dress only on moist soil and irrigate lightly afterwards, otherwise nitrogen is lost.", ta: "ஈரமான மண்ணில் மட்டுமே மேல் உரமிட்டு, பின் லேசாக நீர் பாய்ச்சவும்; இல்லையெனில் நைட்ரஜன் வீணாகும்." },
    },
    pulse: {
      bio: { en: "Seed treatment with Rhizobium + PSB as per the packet fixes nitrogen and unlocks soil phosphorus.", ta: "பாக்கெட் அளவின்படி ரைசோபியம் + PSB கொண்டு விதை நேர்த்தி செய்தால் நைட்ரஜன் சேகரிக்கப்பட்டு பாஸ்பரஸ் விடுவிக்கப்படும்." },
      organic: { en: "Well-decomposed FYM about 2 tonnes/acre with Trichoderma before sowing reduces wilt and root rot.", ta: "விதைப்பிற்கு முன் நன்கு மக்கிய தொழுவுரம் ஏக்கருக்கு சுமார் 2 டன், டிரைக்கோடெர்மாவுடன் இட்டால் வாடல் மற்றும் வேர் அழுகல் குறையும்." },
      micro: { en: "Spray 2% DAP at flowering and again 15 days later to improve pod set. Gypsum helps on sulphur-poor soils.", ta: "பூக்கும் நிலையிலும் 15 நாட்கள் கழித்தும் 2% DAP தெளித்தால் காய் பிடிப்பு கூடும். கந்தகம் குறைந்த மண்ணில் ஜிப்சம் உதவும்." },
      caution: { en: "Do not apply heavy nitrogen — pulses fix their own; excess only causes leafy growth.", ta: "அதிக நைட்ரஜன் வேண்டாம் — பயறு வகைகள் தாமே நைட்ரஜனைச் சேகரிக்கும்; அதிகமானால் இலை வளர்ச்சி மட்டுமே கூடும்." },
    },
    oilseed: {
      bio: { en: "Azospirillum or Rhizobium + PSB, 2 kg/acre each, with FYM or as seed treatment before sowing.", ta: "அசோஸ்பைரில்லம் அல்லது ரைசோபியம் + PSB ஏக்கருக்கு தலா 2 கிலோ, தொழுவுரத்துடன் அல்லது விதை நேர்த்தியாக இடவும்." },
      organic: { en: "Neem cake about 100 kg/acre at sowing gives slow-release nitrogen and checks soil pests.", ta: "விதைப்பின் போது ஏக்கருக்கு சுமார் 100 கிலோ வேப்பம் புண்ணாக்கு இட்டால் நைட்ரஜன் மெதுவாக கிடைக்கும், மண் பூச்சிகளும் கட்டுப்படும்." },
      micro: { en: "Sulphur is critical — prefer SSP or gypsum. Spray 0.5% ferrous sulphate or borax if deficiency shows.", ta: "கந்தகம் மிக முக்கியம் — SSP அல்லது ஜிப்சம் தேர்ந்தெடுக்கவும். குறைபாடு தெரிந்தால் 0.5% இரும்பு சல்பேட் அல்லது போராக்ஸ் தெளிக்கவும்." },
      caution: { en: "Place fertilizer about 5 cm to the side of the seed line; direct contact reduces germination.", ta: "உரத்தை விதை வரிசையிலிருந்து சுமார் 5 செ.மீ. தள்ளி இடவும்; நேரடித் தொடர்பு முளைப்புத் திறனைக் குறைக்கும்." },
    },
    vegetable: {
      bio: { en: "Azospirillum + PSB, 2 kg/acre each, with FYM at bed preparation; Trichoderma protects against damping-off.", ta: "பாத்தி தயாரிக்கும் போது அசோஸ்பைரில்லம் + PSB ஏக்கருக்கு தலா 2 கிலோ தொழுவுரத்துடன் இடவும்; டிரைக்கோடெர்மா நாற்றழுகலைத் தடுக்கும்." },
      organic: { en: "8–10 tonnes/acre of well-rotted FYM at land preparation, plus vermicompost in the planting pits.", ta: "நில தயாரிப்பின் போது ஏக்கருக்கு 8–10 டன் நன்கு மக்கிய தொழுவுரம், மேலும் நடவுக் குழிகளில் மண்புழு உரம் இடவும்." },
      micro: { en: "Spray 1% 19:19:19 or a micronutrient mixture at flowering and fruit-set. Borax 2 kg/acre prevents fruit cracking.", ta: "பூக்கும் மற்றும் காய் பிடிக்கும் நிலையில் 1% 19:19:19 அல்லது நுண்ணூட்டக் கலவை தெளிக்கவும். போராக்ஸ் ஏக்கருக்கு 2 கிலோ காய் வெடிப்பைத் தடுக்கும்." },
      caution: { en: "Split nitrogen into small doses every 2–3 weeks; one heavy dose burns roots and causes flower drop.", ta: "நைட்ரஜனை 2–3 வாரங்களுக்கு ஒருமுறை சிறிய அளவுகளாகப் பிரித்து இடவும்; ஒரே பெரிய அளவு வேரைக் கருக்கி பூ உதிர்வை ஏற்படுத்தும்." },
    },
    fruit: {
      bio: { en: "Azotobacter or Azospirillum + PSB + VAM, applied in the basin along with FYM once a year.", ta: "அசோட்டோபாக்டர் அல்லது அசோஸ்பைரில்லம் + PSB + VAM ஆகியவற்றை வருடம் ஒருமுறை தொழுவுரத்துடன் பாத்தியில் இடவும்." },
      organic: { en: "Apply 10–20 kg FYM or compost per tree per year in the basin, at the start of the rains.", ta: "மழைக்காலத் தொடக்கத்தில் ஒரு மரத்திற்கு வருடம் 10–20 கிலோ தொழுவுரம் அல்லது உரக்குவியலை பாத்தியில் இடவும்." },
      micro: { en: "Spray a zinc–boron–iron micronutrient mixture twice a year: before flowering and after fruit set.", ta: "வருடம் இருமுறை — பூக்கும் முன்பும் காய் பிடித்த பின்பும் — துத்தநாகம், போரான், இரும்பு கொண்ட நுண்ணூட்டக் கலவையைத் தெளிக்கவும்." },
      caution: { en: "Apply fertilizer in the basin at the edge of the canopy, not near the trunk, and irrigate after applying.", ta: "உரத்தை அடிமரத்திற்கு அருகில் அல்லாமல் கிளைப் பரப்பின் ஓரப் பாத்தியில் இட்டு, பின் நீர் பாய்ச்சவும்." },
    },
    spice: {
      bio: { en: "PSB + Azospirillum with FYM at planting; Trichoderma in the bed prevents rhizome and root rot.", ta: "நடவின் போது PSB + அசோஸ்பைரில்லம் தொழுவுரத்துடன் இடவும்; பாத்தியில் டிரைக்கோடெர்மா கிழங்கு மற்றும் வேர் அழுகலைத் தடுக்கும்." },
      organic: { en: "About 10 tonnes/acre FYM plus green-leaf mulching keeps beds cool and feeds the crop slowly.", ta: "ஏக்கருக்கு சுமார் 10 டன் தொழுவுரம் மற்றும் பசுந்தாள் மூடாக்கு பாத்திகளைக் குளிர்ச்சியாக வைத்து மெதுவாக ஊட்டமளிக்கும்." },
      micro: { en: "Zinc sulphate 10 kg/acre and a 1% magnesium sulphate spray correct the common deficiencies.", ta: "துத்தநாக சல்பேட் ஏக்கருக்கு 10 கிலோ மற்றும் 1% மெக்னீசியம் சல்பேட் தெளிப்பு பொதுவான குறைபாடுகளைச் சரிசெய்யும்." },
      caution: { en: "Earth up after every top dressing and avoid waterlogging — rhizome rot spreads fast in wet beds.", ta: "ஒவ்வொரு மேல் உரத்திற்குப் பின்னும் மண் அணைக்கவும்; நீர் தேங்காமல் பார்க்கவும் — ஈரப் பாத்தியில் கிழங்கு அழுகல் வேகமாகப் பரவும்." },
    },
    plantation: {
      bio: { en: "Azotobacter + PSB with FYM in the basin once a year improves nutrient uptake.", ta: "வருடம் ஒருமுறை அசோட்டோபாக்டர் + PSB ஐ தொழுவுரத்துடன் பாத்தியில் இட்டால் ஊட்டச்சத்து உறிஞ்சுதல் மேம்படும்." },
      organic: { en: "Apply 10–25 kg FYM or compost per plant per year and mulch the basin with dry leaves.", ta: "ஒரு செடிக்கு வருடம் 10–25 கிலோ தொழுவுரம் அல்லது உரக்குவியல் இட்டு, பாத்தியை உலர்ந்த இலைகளால் மூடவும்." },
      micro: { en: "Magnesium sulphate and borax correct yellowing and poor nut or berry set; spray as per symptoms.", ta: "மெக்னீசியம் சல்பேட் மற்றும் போராக்ஸ் இலை மஞ்சளாதல், காய் பிடிப்பு குறைவு ஆகியவற்றைச் சரிசெய்யும்; அறிகுறிக்கேற்ப தெளிக்கவும்." },
      caution: { en: "Split the yearly dose into 2–3 applications timed with the rains; never apply to dry soil.", ta: "வருட அளவை மழையுடன் இணைத்து 2–3 முறையாகப் பிரித்து இடவும்; உலர்ந்த மண்ணில் ஒருபோதும் இட வேண்டாம்." },
    },
  };

  const GROUP_SCHEDULE = {
    cereal: [
      { en: "Basal (at sowing)", ta: "அடிப்படை (விதைப்பின் போது)", f: { n: 1 / 3, p: 1, k: 1 }, detailEn: "Full phosphorus and potash + one-third nitrogen.", detailTa: "முழு பாஸ்பரஸ் மற்றும் பொட்டாஷ் + மூன்றில் ஒரு பங்கு நைட்ரஜன்." },
      { en: "Active growth (25–30 days)", ta: "வளர்ச்சி நிலை (25–30 நாட்கள்)", f: { n: 1 / 3, p: 0, k: 0 }, detailEn: "One-third nitrogen as top dressing on moist soil.", detailTa: "ஈரமான மண்ணில் மூன்றில் ஒரு பங்கு நைட்ரஜனை மேல் உரமாக இடவும்." },
      { en: "Flowering / grain formation", ta: "பூக்கும் / தானிய நிலை", f: { n: 1 / 3, p: 0, k: 0 }, detailEn: "Remaining nitrogen as the final top dressing.", detailTa: "மீதமுள்ள நைட்ரஜனை இறுதி மேல் உரமாக இடவும்." },
    ],
    pulse: [
      { en: "Basal (at sowing)", ta: "அடிப்படை (விதைப்பின் போது)", f: { n: 1, p: 1, k: 1 }, detailEn: "Apply the whole dose as basal, placed below the seed line.", detailTa: "முழு அளவையும் அடி உரமாக, விதை வரிசைக்குக் கீழ் இடவும்." },
      { en: "Flowering (30–35 days)", ta: "பூக்கும் நிலை (30–35 நாட்கள்)", f: { n: 0, p: 0, k: 0 }, detailEn: "No soil fertilizer — spray 2% DAP to improve pod set.", detailTa: "மண்ணில் உரம் தேவையில்லை — காய் பிடிப்புக்கு 2% DAP தெளிக்கவும்." },
    ],
    oilseed: [
      { en: "Basal (at sowing)", ta: "அடிப்படை (விதைப்பின் போது)", f: { n: 0.5, p: 1, k: 1 }, detailEn: "Full phosphorus and potash + half nitrogen.", detailTa: "முழு பாஸ்பரஸ் மற்றும் பொட்டாஷ் + பாதி நைட்ரஜன்." },
      { en: "Flowering (30–40 days)", ta: "பூக்கும் நிலை (30–40 நாட்கள்)", f: { n: 0.5, p: 0, k: 0 }, detailEn: "Remaining nitrogen; spray boron if flower drop is seen.", detailTa: "மீதமுள்ள நைட்ரஜன்; பூ உதிர்வு தெரிந்தால் போரான் தெளிக்கவும்." },
    ],
    vegetable: [
      { en: "Basal (at planting)", ta: "அடிப்படை (நடவின் போது)", f: { n: 1 / 3, p: 1, k: 0.5 }, detailEn: "Full phosphorus + half potash + one-third nitrogen, mixed into the bed.", detailTa: "முழு பாஸ்பரஸ் + பாதி பொட்டாஷ் + மூன்றில் ஒரு பங்கு நைட்ரஜனை பாத்தியில் கலக்கவும்." },
      { en: "30 days after planting", ta: "நடவுக்குப் பின் 30 நாட்கள்", f: { n: 1 / 3, p: 0, k: 0.25 }, detailEn: "One-third nitrogen with a quarter of the potash, then earth up.", detailTa: "மூன்றில் ஒரு பங்கு நைட்ரஜனுடன் கால் பங்கு பொட்டாஷ் இட்டு மண் அணைக்கவும்." },
      { en: "Flowering & fruiting", ta: "பூக்கும் & காய்க்கும் நிலை", f: { n: 1 / 3, p: 0, k: 0.25 }, detailEn: "Remaining nitrogen and potash; spray 1% 19:19:19 for better fruit set.", detailTa: "மீதமுள்ள நைட்ரஜன் மற்றும் பொட்டாஷ்; நல்ல காய் பிடிப்புக்கு 1% 19:19:19 தெளிக்கவும்." },
    ],
    fruit: [
      { en: "First dose (start of rains)", ta: "முதல் அளவு (மழைத் தொடக்கம்)", f: { n: 0.5, p: 1, k: 0.5 }, detailEn: "Full phosphorus + half nitrogen and potash in the basin with FYM.", detailTa: "முழு பாஸ்பரஸ் + பாதி நைட்ரஜன், பொட்டாஷ் ஆகியவற்றை தொழுவுரத்துடன் பாத்தியில் இடவும்." },
      { en: "Second dose (after fruit set)", ta: "இரண்டாம் அளவு (காய் பிடித்த பின்)", f: { n: 0.5, p: 0, k: 0.5 }, detailEn: "Remaining nitrogen and potash; irrigate right after applying.", detailTa: "மீதமுள்ள நைட்ரஜன் மற்றும் பொட்டாஷ்; இட்ட உடனே நீர் பாய்ச்சவும்." },
    ],
    spice: [
      { en: "Basal (at planting)", ta: "அடிப்படை (நடவின் போது)", f: { n: 1 / 3, p: 1, k: 1 / 3 }, detailEn: "Full phosphorus + one-third nitrogen and potash, then mulch.", detailTa: "முழு பாஸ்பரஸ் + மூன்றில் ஒரு பங்கு நைட்ரஜன், பொட்டாஷ் இட்டு மூடாக்கு போடவும்." },
      { en: "45 days after planting", ta: "நடவுக்குப் பின் 45 நாட்கள்", f: { n: 1 / 3, p: 0, k: 1 / 3 }, detailEn: "One-third nitrogen and potash, followed by earthing up.", detailTa: "மூன்றில் ஒரு பங்கு நைட்ரஜன், பொட்டாஷ் இட்டு மண் அணைக்கவும்." },
      { en: "90 days after planting", ta: "நடவுக்குப் பின் 90 நாட்கள்", f: { n: 1 / 3, p: 0, k: 1 / 3 }, detailEn: "Remaining nitrogen and potash with the final earthing up.", detailTa: "மீதமுள்ள நைட்ரஜன், பொட்டாஷ் இட்டு இறுதியாக மண் அணைக்கவும்." },
    ],
    plantation: [
      { en: "First dose (early rains)", ta: "முதல் அளவு (முன் மழை)", f: { n: 0.5, p: 1, k: 0.5 }, detailEn: "Full phosphorus + half nitrogen and potash in the basin.", detailTa: "முழு பாஸ்பரஸ் + பாதி நைட்ரஜன், பொட்டாஷ் ஆகியவற்றை பாத்தியில் இடவும்." },
      { en: "Second dose (late rains)", ta: "இரண்டாம் அளவு (பின் மழை)", f: { n: 0.5, p: 0, k: 0.5 }, detailEn: "Remaining nitrogen and potash; cover with soil or mulch.", detailTa: "மீதமுள்ள நைட்ரஜன் மற்றும் பொட்டாஷ்; மண் அல்லது மூடாக்கால் மூடவும்." },
    ],
  };

  /* [v, N, P2O5, K2O, phosphorus source, FYM tonnes, group] — per acre at medium status */
  const MORE_CROPS = [
    ["sorghum", 36, 18, 12, "dap", 4, "cereal"],
    ["pearlmillet", 32, 16, 16, "dap", 4, "cereal"],
    ["fingermillet", 24, 12, 10, "dap", 5, "cereal"],
    ["foxtailmillet", 16, 8, 8, "dap", 3, "cereal"],
    ["barnyardmillet", 16, 8, 8, "dap", 3, "cereal"],
    ["blackgram", 10, 16, 10, "ssp", 2, "pulse"],
    ["greengram", 10, 16, 10, "ssp", 2, "pulse"],
    ["redgram", 10, 20, 16, "ssp", 3, "pulse"],
    ["bengalgram", 10, 16, 8, "ssp", 2, "pulse"],
    ["cowpea", 10, 16, 10, "ssp", 2, "pulse"],
    ["horsegram", 8, 12, 8, "ssp", 2, "pulse"],
    ["sesame", 14, 9, 9, "ssp", 5, "oilseed"],
    ["sunflower", 24, 36, 24, "dap", 5, "oilseed"],
    ["castor", 18, 9, 9, "ssp", 5, "oilseed"],
    ["soybean", 8, 32, 16, "ssp", 5, "oilseed"],
    ["mustard", 24, 16, 16, "ssp", 5, "oilseed"],
    ["tomato", 40, 40, 40, "dap", 10, "vegetable"],
    ["brinjal", 40, 20, 12, "dap", 10, "vegetable"],
    ["chilli", 24, 32, 24, "dap", 10, "vegetable"],
    ["okra", 16, 20, 12, "dap", 8, "vegetable"],
    ["onion", 24, 24, 12, "dap", 10, "vegetable"],
    ["potato", 60, 40, 40, "dap", 10, "vegetable"],
    ["cabbage", 48, 32, 32, "dap", 10, "vegetable"],
    ["cauliflower", 48, 32, 32, "dap", 10, "vegetable"],
    ["cucumber", 16, 12, 12, "dap", 8, "vegetable"],
    ["bittergourd", 16, 12, 12, "dap", 8, "vegetable"],
    ["drumstick", 20, 20, 20, "dap", 8, "vegetable"],
    ["tapioca", 36, 36, 52, "dap", 5, "vegetable"],
    ["sweetpotato", 20, 10, 30, "dap", 5, "vegetable"],
    ["carrot", 20, 16, 20, "dap", 8, "vegetable"],
    ["beans", 12, 20, 12, "dap", 8, "vegetable"],
    ["banana", 80, 30, 100, "dap", 10, "fruit"],
    ["mango", 20, 20, 20, "dap", 10, "fruit"],
    ["coconut", 20, 12, 40, "dap", 10, "fruit"],
    ["papaya", 40, 40, 40, "dap", 10, "fruit"],
    ["guava", 24, 24, 24, "dap", 10, "fruit"],
    ["grapes", 40, 40, 40, "dap", 10, "fruit"],
    ["lemon", 24, 12, 24, "dap", 10, "fruit"],
    ["pomegranate", 25, 12, 25, "dap", 10, "fruit"],
    ["sapota", 16, 16, 16, "dap", 10, "fruit"],
    ["pineapple", 48, 16, 48, "dap", 8, "fruit"],
    ["turmeric", 50, 25, 45, "dap", 10, "spice"],
    ["ginger", 30, 20, 30, "dap", 10, "spice"],
    ["garlic", 30, 24, 20, "dap", 8, "spice"],
    ["coriander", 12, 16, 8, "dap", 5, "spice"],
    ["blackpepper", 20, 16, 28, "dap", 6, "spice"],
    ["cardamom", 30, 24, 40, "dap", 6, "spice"],
    ["tea", 40, 10, 20, "dap", 4, "plantation"],
    ["coffee", 32, 24, 32, "dap", 6, "plantation"],
    ["cashew", 20, 10, 10, "dap", 5, "plantation"],
    ["arecanut", 40, 16, 50, "dap", 6, "plantation"],
    ["rubber", 12, 12, 12, "dap", 5, "plantation"],
  ];

  MORE_CROPS.forEach(([v, n, p, k, pSrc, fym, grp]) => {
    const care = GROUP_CARE[grp];
    CROP_PLAN[v] = { n: n, p: p, k: k, pSrc: pSrc, fym: fym, bio: care.bio, organic: care.organic, micro: care.micro, caution: care.caution };
    SCHEDULE[v] = GROUP_SCHEDULE[grp];
  });

  Object.assign(SOIL_ADVICE, {
    alluvial: [
      { en: "Alluvial soil is naturally fertile and holds nutrients well — the standard split schedule works.", ta: "ஆற்று வண்டல் மண் இயற்கையிலேயே வளமானது, ஊட்டச்சத்தை நன்கு தக்கவைக்கும் — வழக்கமான பிரித்து இடும் அட்டவணை பொருந்தும்." },
      { en: "Keep adding organic matter each season; continuous cropping drains it faster than it looks.", ta: "ஒவ்வொரு பருவமும் கரிமப் பொருள் சேர்க்கவும்; தொடர் பயிர்ச்செய்கை அதைத் தெரியாமலேயே வேகமாகக் குறைக்கும்." },
    ],
    laterite: [
      { en: "Laterite soil is acidic and low in phosphorus — apply lime as per the soil test and place phosphorus near the roots.", ta: "லேட்டரைட் மண் அமிலத் தன்மையுடன் பாஸ்பரஸ் குறைவாக இருக்கும் — மண் பரிசோதனைப்படி சுண்ணாம்பு இட்டு, பாஸ்பரஸை வேருக்கு அருகில் இடவும்." },
      { en: "Heavy FYM, mulching and split nitrogen doses reduce nutrient loss from these soils.", ta: "அதிக தொழுவுரம், மூடாக்கு மற்றும் பிரித்து இடும் நைட்ரஜன் இந்த மண்ணில் ஊட்டச்சத்து இழப்பைக் குறைக்கும்." },
    ],
    silty: [
      { en: "Silty soil holds moisture well but crusts and compacts — add organic matter and avoid working it when wet.", ta: "சேற்று மண் ஈரத்தை நன்கு தேக்கும், ஆனால் இறுகிவிடும் — கரிமப் பொருள் சேர்க்கவும், ஈரமாக இருக்கும் போது உழுவதைத் தவிர்க்கவும்." },
      { en: "Ensure good drainage before top dressing so nitrogen does not sit in waterlogged patches.", ta: "மேல் உரமிடும் முன் நல்ல வடிகால் உறுதி செய்யவும்; இல்லையெனில் நீர் தேங்கிய இடங்களில் நைட்ரஜன் வீணாகும்." },
    ],
    sandyloam: [
      { en: "Sandy loam drains fast but holds enough nutrients — split nitrogen into 3 doses for best results.", ta: "மணல் கலந்த வண்டல் மண் விரைவாக வடியும், ஆனால் போதுமான ஊட்டச்சத்தைத் தக்கவைக்கும் — நைட்ரஜனை 3 அளவுகளாகப் பிரிப்பது சிறந்தது." },
      { en: "This is an ideal soil for most crops; maintain it with regular compost or vermicompost.", ta: "பெரும்பாலான பயிர்களுக்கு ஏற்ற மண் இது; வழக்கமான உரக்குவியல் அல்லது மண்புழு உரத்தால் பராமரிக்கவும்." },
    ],
    saline: [
      { en: "Saline soil harms germination — leach the salts with good-quality water and provide proper drainage first.", ta: "உவர் மண் முளைப்பைப் பாதிக்கும் — முதலில் நல்ல தரமான நீரால் உப்பை கழுவி, சரியான வடிகால் அமைக்கவும்." },
      { en: "Use gypsum, extra FYM and salt-tolerant varieties; avoid chloride-based fertilizers such as MOP.", ta: "ஜிப்சம், கூடுதல் தொழுவுரம் மற்றும் உப்புத் தாங்கும் ரகங்களைப் பயன்படுத்தவும்; MOP போன்ற குளோரைடு உரங்களைத் தவிர்க்கவும்." },
    ],
    alkaline: [
      { en: "Alkaline or sodic soil locks up iron and zinc — apply gypsum and organic matter to reclaim it.", ta: "கார மண்ணில் இரும்பும் துத்தநாகமும் பயிருக்குக் கிடைக்காது — ஜிப்சம் மற்றும் கரிமப் பொருள் இட்டு சீரமைக்கவும்." },
      { en: "Prefer ammonium sulphate over urea, and correct yellowing with foliar sprays of iron and zinc.", ta: "யூரியாவை விட அம்மோனியம் சல்பேட் சிறந்தது; இலை மஞ்சளாதலை இரும்பு, துத்தநாக இலைவழி தெளிப்பால் சரிசெய்யவும்." },
    ],
    acidic: [
      { en: "Acidic soil needs lime as per the soil test, applied 2–3 weeks before sowing.", ta: "அமில மண்ணுக்கு மண் பரிசோதனைப்படி சுண்ணாம்பு தேவை; விதைப்பிற்கு 2–3 வாரங்கள் முன் இடவும்." },
      { en: "Avoid acid-forming fertilizers like ammonium sulphate; phosphorus needs are usually higher here.", ta: "அம்மோனியம் சல்பேட் போன்ற அமிலமாக்கும் உரங்களைத் தவிர்க்கவும்; இங்கு பாஸ்பரஸ் தேவை பொதுவாக அதிகம்." },
    ],
    calcareous: [
      { en: "Calcareous soil fixes phosphorus and iron — band-place phosphorus and use FYM to keep it available.", ta: "சுண்ணாம்பு மண் பாஸ்பரஸையும் இரும்பையும் பிடித்துக்கொள்ளும் — பாஸ்பரஸை வரிசையாக இட்டு, தொழுவுரத்தால் அது கிடைக்கச் செய்யவும்." },
      { en: "Yellowing between the veins is common — spray 0.5% ferrous sulphate two or three times.", ta: "நரம்புகளுக்கிடையே மஞ்சளாதல் பொதுவானது — 0.5% இரும்பு சல்பேட்டை இரண்டு மூன்று முறை தெளிக்கவும்." },
    ],
    hill: [
      { en: "Hill and forest soils are rich in organic matter but lose nutrients to runoff — grow along contours and mulch.", ta: "மலை மண்ணில் கரிமப் பொருள் அதிகம், ஆனால் நீரோட்டத்தால் ஊட்டச்சத்து இழக்கும் — சம வரிசையில் பயிரிட்டு மூடாக்கு போடவும்." },
      { en: "Apply fertilizer in small split doses just before or after rain, never on steep bare slopes.", ta: "மழைக்கு சற்று முன் அல்லது பின் சிறிய அளவுகளாகப் பிரித்து இடவும்; செங்குத்தான வெற்றுச் சரிவுகளில் இட வேண்டாம்." },
    ],
  });

  const ALTERNATIVES = [
    { en: "No urea? Use ammonium sulphate (20.6% N). About 2.2 kg replaces 1 kg of urea and it also supplies sulphur.", ta: "யூரியா இல்லையா? அம்மோனியம் சல்பேட் (20.6% N) பயன்படுத்தவும். 1 கிலோ யூரியாவுக்குப் பதிலாக சுமார் 2.2 கிலோ போதும்; கந்தகமும் கிடைக்கும்." },
    { en: "No DAP? Use SSP for phosphorus with a little extra urea for nitrogen, or a complex fertilizer such as 17-17-17 or 20-20-0-13.", ta: "DAP இல்லையா? பாஸ்பரஸுக்கு SSP மற்றும் நைட்ரஜனுக்கு சிறிது கூடுதல் யூரியா, அல்லது 17-17-17 / 20-20-0-13 போன்ற கூட்டு உரம் பயன்படுத்தவும்." },
    { en: "No MOP? Use potassium sulphate (SOP) for chloride-sensitive crops, or potassium nitrate through drip irrigation.", ta: "MOP இல்லையா? குளோரைடுக்கு உணர்திறன் உள்ள பயிர்களுக்கு பொட்டாசியம் சல்பேட் (SOP), அல்லது சொட்டு நீர் வழியாக பொட்டாசியம் நைட்ரேட் பயன்படுத்தவும்." },
    { en: "Using drip irrigation? 19:19:19 water-soluble fertilizer can be applied in small, frequent doses.", ta: "சொட்டு நீர்ப்பாசனம் உள்ளதா? 19:19:19 நீரில் கரையும் உரத்தை சிறிய, அடிக்கடி அளவுகளில் இடலாம்." },
  ];

  const INSIGHTS = {
    n: {
      low: { en: "Nitrogen is low — expect pale, slow growth. The dose is raised by 25% and should be applied in splits.", ta: "நைட்ரஜன் குறைவு — வெளிர், மெதுவான வளர்ச்சி தெரியும். அளவு 25% உயர்த்தப்பட்டுள்ளது; பிரித்து இடவும்." },
      medium: { en: "Nitrogen is adequate — follow the standard dose.", ta: "நைட்ரஜன் போதுமான அளவில் உள்ளது — வழக்கமான அளவைப் பின்பற்றவும்." },
      high: { en: "Nitrogen is high — the dose is cut by half. Excess causes lodging and more pests.", ta: "நைட்ரஜன் அதிகம் — அளவு பாதியாகக் குறைக்கப்பட்டுள்ளது. அதிகமானால் பயிர் சாய்ந்து பூச்சித் தாக்குதல் கூடும்." },
    },
    p: {
      low: { en: "Phosphorus is low — roots and tillering will suffer. The dose is raised by 25%; apply it all as basal.", ta: "பாஸ்பரஸ் குறைவு — வேர் மற்றும் தூர் வளர்ச்சி பாதிக்கும். அளவு 25% உயர்த்தப்பட்டுள்ளது; முழுவதையும் அடி உரமாக இடவும்." },
      medium: { en: "Phosphorus is adequate — the standard basal dose is enough.", ta: "பாஸ்பரஸ் போதுமான அளவில் உள்ளது — வழக்கமான அடி உர அளவு போதும்." },
      high: { en: "Phosphorus is high — the dose is cut by half. Too much can lock up zinc.", ta: "பாஸ்பரஸ் அதிகம் — அளவு பாதியாகக் குறைக்கப்பட்டுள்ளது. மிகுந்தால் துத்தநாகம் பயிருக்குக் கிடைக்காமல் போகும்." },
    },
    k: {
      low: { en: "Potassium is low — expect weak stems and poor grain or fibre quality. The dose is raised by 25%.", ta: "பொட்டாசியம் குறைவு — தண்டு வலுவின்றி தானிய அல்லது நார் தரம் குறையும். அளவு 25% உயர்த்தப்பட்டுள்ளது." },
      medium: { en: "Potassium is adequate — follow the standard dose.", ta: "பொட்டாசியம் போதுமான அளவில் உள்ளது — வழக்கமான அளவைப் பின்பற்றவும்." },
      high: { en: "Potassium is high — the dose is cut by half.", ta: "பொட்டாசியம் அதிகம் — அளவு பாதியாகக் குறைக்கப்பட்டுள்ளது." },
    },
  };

  /* ---------------- Irrigation, warnings, tips, guide, safety ---------------- */

  const IRRIGATION_TIPS = [
    { en: "Apply water-soluble fertilizers through drip irrigation for even nutrient delivery.", ta: "சமமான ஊட்டச்சத்து வழங்கலுக்கு நீரில் கரையும் உரங்களை சொட்டு நீர்ப்பாசனம் மூலம் இடவும்." },
    { en: "Never apply fertilizer to dry soil right before heavy rain — nutrients wash away.", ta: "கனமழைக்கு முன் உலர்ந்த மண்ணில் உரம் இட வேண்டாம் — ஊட்டச்சத்துகள் வீணாகும்." },
    { en: "Irrigate lightly a day before top dressing so roots can absorb nutrients better.", ta: "மேல் உரமிடும் முன் ஒரு நாள் லேசாக நீர் பாய்ச்சவும், இதனால் வேர்கள் ஊட்டச்சத்தை நன்கு உறிஞ்சும்." },
    { en: "Avoid over-irrigation after fertilizing sandy soil — nutrients leach quickly.", ta: "மணல் மண்ணில் உரமிட்ட பிறகு அதிக நீர் பாய்ச்ச வேண்டாம் — ஊட்டச்சத்துகள் விரைவாக வடிந்துவிடும்." },
    { en: "Fertigation works best in short, frequent doses rather than one large dose.", ta: "ஒரே பெரிய அளவை விட, குறுகிய, அடிக்கடி நிகழும் சிறிய அளவுகளில் உரமிடுவது சிறந்தது." },
    { en: "In rice, avoid draining the field for 2–3 days after top dressing.", ta: "நெல்லில் மேல் உரமிட்ட பின் 2–3 நாட்களுக்கு வயலில் நீரை வடிக்க வேண்டாம்." },
    { en: "Sandy soils need lighter, more frequent watering; clay soils need less frequent, deeper watering.", ta: "மணல் மண்ணுக்கு லேசான, அடிக்கடி நீர்ப்பாசனம்; களிமண்ணுக்கு குறைந்த இடைவெளியில் ஆழமான நீர்ப்பாசனம் தேவை." },
  ];

  const WARNING_SIGNS = [
    { en: "Pale yellow older leaves often signal nitrogen deficiency.", ta: "வெளிர் மஞ்சள் நிற பழைய இலைகள் பெரும்பாலும் நைட்ரஜன் குறைபாட்டைக் காட்டும்." },
    { en: "Purplish leaf tinge, especially in young plants, can mean low phosphorus.", ta: "இளம் தாவரங்களில் ஊதா நிற இலைத் தோற்றம் குறைந்த பாஸ்பரஸைக் குறிக்கலாம்." },
    { en: "Browning or scorching at leaf edges points to potassium deficiency.", ta: "இலை ஓரங்களில் பழுப்பு அல்லது கருகல் பொட்டாசியம் குறைபாட்டைக் காட்டும்." },
    { en: "Excess nitrogen causes overly soft, dark green growth and delayed flowering.", ta: "அதிகப்படியான நைட்ரஜன் மென்மையான, அடர் பச்சை வளர்ச்சியையும் தாமதமான பூக்கவிழ்ப்பையும் ஏற்படுத்தும்." },
    { en: "White crust on the soil surface can indicate salt build-up from over-fertilization.", ta: "மண் மேற்பரப்பில் வெள்ளை படலம் அதிகப்படியான உரத்தால் உப்பு தேங்குவதைக் காட்டலாம்." },
    { en: "Yellow young leaves with green veins usually point to iron deficiency.", ta: "பச்சை நரம்புகளுடன் மஞ்சள் இளம் இலைகள் பொதுவாக இரும்புச் சத்து குறைபாட்டைக் காட்டும்." },
    { en: "White stripes on young maize leaves, or rusty brown patches in rice, point to zinc deficiency.", ta: "சோள இளம் இலைகளில் வெள்ளைக் கோடுகள் அல்லது நெல்லில் துருப்பழுப்பு திட்டுகள் துத்தநாகக் குறைபாட்டைக் காட்டும்." },
    { en: "Reddening of cotton leaves signals magnesium deficiency.", ta: "பருத்தி இலைகள் சிவப்பாவது மெக்னீசியம் குறைபாட்டின் அறிகுறி." },
  ];

  const KNOWLEDGE_TIPS = [
    { en: "A soil test every season is the cheapest way to avoid wasting money on the wrong fertilizer.", ta: "ஒவ்வொரு பருவத்திலும் மண் பரிசோதனை செய்வது தவறான உரத்தில் பணத்தை வீணடிக்காமல் இருக்க மலிவான வழி." },
    { en: "Mixing bio-fertilizers with chemical fertilizers on the same day can reduce the bacteria's effectiveness.", ta: "உயிர் உரங்களை இரசாயன உரங்களுடன் ஒரே நாளில் கலப்பது பாக்டீரியாவின் செயல்திறனைக் குறைக்கலாம்." },
    { en: "Split doses of nitrogen are far more efficient than one large application.", ta: "நைட்ரஜனை பிரித்து இடுவது ஒரே பெரிய அளவை விட மிகவும் திறமையானது." },
    { en: "Legume crops like groundnut and pulses need far less nitrogen fertilizer because they fix their own.", ta: "நிலக்கடலை மற்றும் பயறு போன்ற பயறு வகைப் பயிர்கள் தானாகவே நைட்ரஜனைச் சேகரிப்பதால் குறைவான நைட்ரஜன் உரம் தேவைப்படும்." },
    { en: "Organic matter improves how well chemical fertilizers are retained and used by the soil.", ta: "கரிமப் பொருள் இரசாயன உரங்கள் மண்ணில் தக்கவைக்கப்பட்டு பயன்படுத்தப்படும் விதத்தை மேம்படுத்தும்." },
    { en: "Applying fertilizer in the cool hours of early morning or evening reduces nutrient loss to heat.", ta: "காலை அல்லது மாலை குளிர்ந்த நேரங்களில் உரமிடுவது வெப்பத்தால் ஏற்படும் ஊட்டச்சத்து இழப்பைக் குறைக்கும்." },
    { en: "Neem-coated urea releases nitrogen more slowly and cuts losses — prefer it over plain urea.", ta: "வேப்பம் பூசிய யூரியா நைட்ரஜனை மெதுவாக வெளியிட்டு இழப்பைக் குறைக்கும் — சாதாரண யூரியாவை விட இதைத் தேர்ந்தெடுக்கவும்." },
    { en: "Mix fertilizers only just before applying — some blends absorb moisture and turn sticky in storage.", ta: "உரங்களை இடுவதற்கு சற்று முன்பு மட்டுமே கலக்கவும் — சில கலவைகள் சேமிப்பில் ஈரத்தை உறிஞ்சி ஒட்டிக்கொள்ளும்." },
    { en: "Crop rotation with pulses reduces the nitrogen needed by the next cereal crop.", ta: "பயறு வகைகளுடன் பயிர்ச் சுழற்சி செய்தால் அடுத்த தானியப் பயிருக்குத் தேவையான நைட்ரஜன் குறையும்." },
    { en: "Zinc deficiency is the most common micronutrient problem in rice; zinc sulphate every 2–3 crops prevents it.", ta: "நெல்லில் மிகவும் பொதுவான நுண்ணூட்டக் குறைபாடு துத்தநாகம்; 2–3 பயிருக்கு ஒருமுறை துத்தநாக சல்பேட் இட்டால் தடுக்கலாம்." },
    { en: "Most crops prefer soil pH between 6.0 and 7.5; nutrient availability drops outside this range.", ta: "பெரும்பாலான பயிர்கள் 6.0 முதல் 7.5 வரை pH உள்ள மண்ணை விரும்பும்; இந்த வரம்புக்கு வெளியே ஊட்டச்சத்து கிடைப்பது குறையும்." },
    { en: "Foliar sprays correct deficiencies quickly, but they supplement soil application — they do not replace it.", ta: "இலைவழி தெளிப்பு குறைபாடுகளை விரைவாகச் சரிசெய்யும்; ஆனால் அது மண்ணில் இடுவதற்கு துணையே, மாற்று அல்ல." },
  ];
  let tipIndex = 0;

  const GUIDE = [
    { en: "Test the soil before every season to know its real nutrient status.", ta: "ஒவ்வொரு பருவத்திற்கும் முன் மண்ணின் உண்மையான ஊட்டச்சத்து நிலையை அறிய மண் பரிசோதனை செய்யவும்." },
    { en: "Apply the basal dose at sowing or transplanting, mixed into the soil.", ta: "விதைக்கும் அல்லது நடும் போது அடிப்படை உரத்தை மண்ணுடன் கலந்து இடவும்." },
    { en: "Split the nitrogen dose across 2–3 top dressings during growth.", ta: "நைட்ரஜன் உரத்தை வளர்ச்சியின் போது 2–3 முறை பிரித்து மேல் உரமாக இடவும்." },
    { en: "Water lightly after applying fertilizer so nutrients reach the root zone.", ta: "உரமிட்ட பிறகு லேசாக நீர் பாய்ச்சி ஊட்டச்சத்துகள் வேர் பகுதியை அடையச் செய்யவும்." },
    { en: "Keep fertilizer away from direct contact with seeds to avoid damage.", ta: "விதைகளுக்கு நேரடியாக உரம் படாமல் பார்த்துக் கொள்ளவும்." },
  ];

  const SAFETY = [
    { en: "Wear gloves and a mask while handling or spraying fertilizer.", ta: "உரத்தைக் கையாளும் அல்லது தெளிக்கும் போது கையுறை மற்றும் முகக்கவசம் அணியவும்." },
    { en: "Store fertilizers in a dry, well-ventilated place, away from children and food items.", ta: "உரங்களை உலர்ந்த, காற்றோட்டமுள்ள இடத்தில், குழந்தைகள் மற்றும் உணவுப் பொருட்களிலிருந்து விலக்கி வைக்கவும்." },
    { en: "Wash hands and face thoroughly after application.", ta: "உரமிட்ட பிறகு கை மற்றும் முகத்தை நன்கு கழுவவும்." },
    { en: "Never mix incompatible fertilizers together without checking guidance.", ta: "வழிகாட்டுதல் இல்லாமல் பொருந்தாத உரங்களை ஒன்றாகக் கலக்க வேண்டாம்." },
    { en: "Stick to the recommended dosage — excess fertilizer harms both soil and crop.", ta: "பரிந்துரைக்கப்பட்ட அளவைக் கடைபிடிக்கவும் — அதிகப்படியான உரம் மண்ணையும் பயிரையும் பாதிக்கும்." },
    { en: "Keep bags sealed and off the bare floor on a pallet or plank to avoid moisture damage.", ta: "ஈரப்பதத்தால் சேதமடையாமல் இருக்க பைகளை மூடி, தரையில் நேரடியாக வைக்காமல் தட்டு அல்லது பலகையின் மேல் வைக்கவும்." },
    { en: "Do not store fertilizer near a water source, as leakage can contaminate it.", ta: "கசிவு ஏற்பட்டால் மாசுபடக்கூடும் என்பதால் தண்ணீர் ஆதாரத்திற்கு அருகில் உரத்தைச் சேமிக்க வேண்டாம்." },
  ];

  /* ---------------- Persisted state (localStorage) ---------------- */

  const HISTORY_KEY = "agrinova_fert_history";
  const REMINDER_KEY = "agrinova_fert_reminder";

  function loadHistory() {
    try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  }
  function saveHistory(entries) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch (e) { /* storage unavailable */ }
  }
  function loadReminder() {
    try { const raw = localStorage.getItem(REMINDER_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function saveReminder(r) {
    try { localStorage.setItem(REMINDER_KEY, JSON.stringify(r)); } catch (e) { /* storage unavailable */ }
  }

  /* ---- Server sync: saved in the farmer's account via the backend (needs login) ---- */
  function fertOwner() {
    const e = (localStorage.getItem("loggedInEmail") || localStorage.getItem("email") || "").trim();
    return /^[A-Za-z0-9_@.+-]{3,120}$/.test(e) ? e : "";
  }
  async function fertPost(path, body) {
    const owner = fertOwner();
    if (!owner) return null;                       // not logged in: stays on this device only
    try {
      const r = await fetch(API_BASE + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({ owner: owner }, body))
      });
      return r.ok ? await r.json() : null;
    } catch (e) { console.error("Fertilizer sync failed:", e); return null; }
  }
  async function syncUsageFromServer() {
    const owner = fertOwner();
    if (!owner) return;
    try {
      const r = await fetch(API_BASE + "/api/fertilizer-usage?owner=" + encodeURIComponent(owner));
      if (!r.ok) return;
      const data = await r.json();
      historyEntries = (data.usage || []).map((u) => ({
        id: "db" + u.id, dbId: u.id, date: u.used_on, cropV: u.crop_key,
        fertVs: Array.isArray(u.fert_keys) ? u.fert_keys : [], qty: u.quantity || "",
        rating: u.rating || 0, notes: u.notes || ""
      }));
      saveHistory(historyEntries);
      renderHistory();
      renderEffectPanel();
    } catch (e) { console.error("Fertilizer history load failed:", e); }
  }
  function saveFertilizerAdvice() {
    if (!lastInput || !lastPlan) return;
    const rows = (lastPlan.rows || []).map((r) => ({ fertilizer: PRODUCT[r.key].name, kg: r.kg }));
    const total = rows.reduce((sum, r) => sum + (Number(r.kg) || 0), 0);
    fertPost("/api/fertilizer-advice", {
      crop: lastInput.cropV, soil: lastInput.soilV, area: lastInput.area,
      nLevel: lastInput.lv.n, pLevel: lastInput.lv.p, kLevel: lastInput.lv.k,
      recommended: rows.map((r) => r.fertilizer + " " + (Math.round(r.kg * 10) / 10) + " kg").join(", "),
      quantity: (Math.round(total * 10) / 10) + " kg",
      plan: rows
    });
  }

  let historyEntries = loadHistory();
  let reminder = loadReminder();

  // Migrate any old single-fertilizer entries (fertV: "urea") to the new
  // multi-fertilizer shape (fertVs: ["urea"]) so old saved logs still work.
  historyEntries = historyEntries.map((e) => {
    if (!e.fertVs) {
      return Object.assign({}, e, { fertVs: e.fertV ? [e.fertV] : [] });
    }
    return e;
  });
  saveHistory(historyEntries);

  /* ---------------- State ---------------- */

  let lang = "en";
  const levels = { n: "medium", p: "medium", k: "medium" };
  let lastInput = null; // { cropV, soilV, area, lv } from the latest submit
  let lastPlan = null;
  let logFertSelected = new Set();

  /* ---------------- Helpers ---------------- */

  function t(key) { return STRINGS[lang][key]; }
  function label(item) { return lang === "ta" ? item.ta : item.en; }

  function fmtNum(x) {
    return x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10);
  }

  function applyStaticStrings() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (STRINGS[lang][key] !== undefined) el.textContent = STRINGS[lang][key];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const key = el.getAttribute("data-i18n-ph");
      if (STRINGS[lang][key] !== undefined) el.setAttribute("placeholder", STRINGS[lang][key]);
    });
    document.documentElement.lang = lang === "ta" ? "ta" : "en";
    document.querySelectorAll(".langswitch button").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.lang === lang);
    });
  }

  function fillOptions(select, rows, currentValue) {
    select._rows = rows;
    const prev = currentValue !== undefined && currentValue !== null ? currentValue : select.value;
    if (select._search) {
      select._search.placeholder = lang === "ta" ? "தேட தட்டச்சு செய்யவும்..." : "Type to search...";
    }
    const q = select._search ? select._search.value.trim().toLowerCase() : "";
    let list = q ? rows.filter((r) => r.search.indexOf(q) !== -1) : rows;
    if (!list.length) list = rows;
    select.innerHTML = "";
    list.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.v;
      opt.textContent = r.text;
      select.appendChild(opt);
    });
    if (prev && Array.prototype.some.call(select.options, (o) => o.value === prev)) select.value = prev;
  }

  function populateSelect(select, items, currentValue) {
    fillOptions(select, items.map((it) => ({
      v: it.v, text: label(it), search: (it.en + " " + it.ta + " " + it.v).toLowerCase(),
    })), currentValue);
  }

  function makeSearchable(select) {
    if (!select || select._search) return;
    const inp = document.createElement("input");
    inp.type = "search";
    inp.className = "input search-input";
    inp.autocomplete = "off";
    select.parentElement.insertAdjacentElement("beforebegin", inp);
    select._search = inp;
    inp.addEventListener("input", () => fillOptions(select, select._rows || []));
  }

  /* ---------------- Fertilizer multi-select (Usage history) ---------------- */

  function renderFertMultiselect() {
    const panel = $("logFertilizerPanel");
    const btn = $("logFertilizerBtn");
    panel.innerHTML = FERTS.map((f) => `
      <label class="multiselect__item">
        <input type="checkbox" value="${f.v}" ${logFertSelected.has(f.v) ? "checked" : ""}>
        <span>${escapeHTML(f.label)}</span>
      </label>`).join("");
    const chosen = FERTS.filter((f) => logFertSelected.has(f.v));
    if (chosen.length === 0) {
      btn.innerHTML = '<span class="ph">' + t("selectFertPh") + "</span>";
    } else {
      btn.textContent = chosen.map((f) => f.label).join(", ");
    }
  }

  function fertLabelsFor(vs) {
    return (vs || []).map((v) => {
      const f = FERTS.find((x) => x.v === v);
      return f ? f.label : v;
    });
  }

  /* ---------------- NPK segmented controls ---------------- */

  function renderSegs() {
    const wrap = $("npkRows");
    wrap.innerHTML = "";
    [["n", "nLabel", "npk-dot--n"], ["p", "pLabel", "npk-dot--p"], ["k", "kLabel", "npk-dot--k"]].forEach(([key, lk, dot]) => {
      const row = document.createElement("div");
      row.className = "npk-item";
      row.innerHTML =
        '<div class="npk-item__name"><span class="npk-dot ' + dot + '"></span>' + t(lk) + "</div>" +
        '<div class="seg" role="radiogroup" aria-label="' + t(lk) + '">' +
        LEVELS.map((l) =>
          '<button type="button" role="radio" class="seg__btn seg__btn--' + l + (levels[key] === l ? " is-active" : "") +
          '" aria-checked="' + (levels[key] === l) + '" data-key="' + key + '" data-level="' + l + '">' + t(l) + "</button>"
        ).join("") + "</div>";
      wrap.appendChild(row);
    });
  }

  /* ---------------- Library accordion ---------------- */

  function buildAccordion(listEl, items, openValue) {
    listEl.innerHTML = "";
    items.forEach((f) => {
      const item = document.createElement("div");
      item.className = "ftype" + (f.v === openValue ? " is-open" : "");
      item.dataset.v = f.v;
      const badgeText = f.b || f.label.slice(0, 3).toUpperCase();
      item.innerHTML = `
        <button type="button" class="ftype__head" aria-expanded="${f.v === openValue}">
          <span class="ftype__badge" style="background:${f.color}">${badgeText}</span>
          <span class="ftype__name">${f.label}</span>
          <span class="ftype__chevron"></span>
        </button>
        <div class="ftype__body">
          <div class="ftype__body-inner">${label(f)}</div>
        </div>`;
      item.querySelector(".ftype__head").addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        listEl.querySelectorAll(".ftype.is-open").forEach((el) => {
          el.classList.remove("is-open");
          el.querySelector(".ftype__head").setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          item.querySelector(".ftype__head").setAttribute("aria-expanded", "true");
        }
      });
      listEl.appendChild(item);
    });
  }

  function renderLibraryTabs() {
    const tabbar = $("libraryTabs");
    tabbar.innerHTML = "";
    LIBRARY_TABS.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.toggle("is-active", cat === activeLibraryTab);
      btn.setAttribute("role", "tab");
      btn.textContent = t(LIBRARY_TAB_KEY[cat]);
      btn.addEventListener("click", () => {
        activeLibraryTab = cat;
        renderLibraryTabs();
        renderLibraryItems(null);
      });
      tabbar.appendChild(btn);
    });
  }

  function renderLibraryItems(openValue) {
    const list = $("ftypeList");
    const items = FERTS.filter((f) => f.category === activeLibraryTab);
    buildAccordion(list, items, openValue || (list.querySelector(".ftype.is-open")?.dataset.v ?? null));
  }

  /* ---------------- Simple list renderers ---------------- */

  function renderListItems(ulId, data) {
    const ul = $(ulId);
    ul.innerHTML = "";
    data.forEach((row) => {
      const li = document.createElement("li");
      if (ulId === "safetyList") {
        li.innerHTML = '<span class="ico">' + icon("shield") + "</span><span>" + label(row) + "</span>";
      } else {
        li.textContent = label(row);
      }
      ul.appendChild(li);
    });
  }

  function renderWarningBanner() {
    const banner = $("warningBanner");
    if (!lastInput) { banner.style.display = "none"; return; }
    const { n, p, k } = lastInput.lv;
    const highCount = [n, p, k].filter((v) => v === "high").length;
    const lowCount = [n, p, k].filter((v) => v === "low").length;
    let msg = null;
    if (highCount >= 2) {
      msg = lang === "ta"
        ? "பல ஊட்டச்சத்துகள் ஏற்கனவே அதிகமாக உள்ளன — மேலும் உரமிடுவது மண் மற்றும் நீர்நிலைகளுக்கு தீங்கு விளைவிக்கலாம்."
        : "Several nutrients are already high — further fertilizing risks harming the soil and nearby water bodies.";
    } else if (lowCount >= 2) {
      msg = lang === "ta"
        ? "பல ஊட்டச்சத்துகள் குறைவாக உள்ளன — படிப்படியாக சரிசெய்யவும், ஒரே நேரத்தில் அதிக அளவு உரம் இட வேண்டாம்."
        : "Multiple nutrients are low — correct them gradually rather than applying a large dose all at once.";
    }
    if (msg) { banner.textContent = msg; banner.style.display = "block"; } else { banner.style.display = "none"; }
  }

  function renderScheduleForCrop(cropV) {
    const list = $("scheduleList");
    const rows = SCHEDULE[cropV] || [];
    list.innerHTML = "";
    rows.forEach((row) => {
      const div = document.createElement("div");
      div.className = "schedule-row";
      div.innerHTML = `<div class="schedule-row__stage">${label(row)}</div><div class="schedule-row__detail">${lang === "ta" ? row.detailTa : row.detailEn}</div>`;
      list.appendChild(div);
    });
  }

  /* ---------------- Soil nutrient analysis ---------------- */

  const SCORE = { low: 35, medium: 75, high: 90 };

  function nutrientBarInfo(level) {
    if (level === "low") return { pct: 30, color: "#B94A2C" };
    if (level === "medium") return { pct: 62, color: "#B4620F" };
    return { pct: 92, color: "#1F7A48" };
  }

  function renderNutrients() {
    if (!lastInput) return;
    const lv = lastInput.lv;
    $("nutriPlaceholder").style.display = "none";
    const score = Math.round((SCORE[lv.n] + SCORE[lv.p] + SCORE[lv.k]) / 3);
    const cls = score < 50 ? "low" : score < 80 ? "mid" : "good";
    const lab = score < 50 ? t("fertLow") : score < 80 ? t("fertMid") : t("fertGood");
    const defs = [["n", "nLabel", "npk-dot--n"], ["p", "pLabel", "npk-dot--p"], ["k", "kLabel", "npk-dot--k"]];

    $("nutriBody").innerHTML = `
      <div class="fert-index fert-index--${cls}">
        <div class="fert-index__score">${score}<small>/100</small></div>
        <div class="fert-index__meta">
          <b>${t("fertilityIndex")}</b>
          <span>${lab}</span>
          <div class="fert-index__bar"><i style="width:${score}%"></i></div>
        </div>
      </div>
      <div class="nutri-bars">
        ${defs.map(([key, lk]) => {
          const info = nutrientBarInfo(lv[key]);
          return `
            <div class="nutri-bar">
              <div class="nutri-bar__track"><div class="nutri-bar__fill" style="height:${info.pct}%;background:${info.color}"></div></div>
              <div class="nutri-bar__label">${t(lk)}</div>
              <div class="nutri-bar__status">${t(lv[key])}</div>
            </div>`;
        }).join("")}
      </div>
      <ul class="insights">
        ${defs.map(([key, , dot]) => `<li><span class="npk-dot ${dot}"></span><span>${label(INSIGHTS[key][lv[key]])}</span></li>`).join("")}
      </ul>`;
  }

  /* ---------------- Recommendation engine (deterministic, exact) ---------------- */

  function computePlan(cropV, soilV, lv, area) {
    const base = CROP_PLAN[cropV];
    const dose = {
      n: base.n * LEVEL_FACTOR[lv.n],
      p: base.p * LEVEL_FACTOR[lv.p],
      k: base.k * LEVEL_FACTOR[lv.k],
    };
    const pKey = base.pSrc; // "dap" or "ssp"
    const pKgAcre = dose.p / (pKey === "dap" ? 0.46 : 0.16);
    const nFromDap = pKey === "dap" ? pKgAcre * 0.18 : 0;
    const ureaAcre = Math.max(0, dose.n - nFromDap) / 0.46;
    const mopAcre = dose.k / 0.6;

    const totals = { urea: ureaAcre * area, mop: mopAcre * area };
    totals[pKey] = pKgAcre * area;
    const gypsum = base.gypsum ? base.gypsum * area : 0;

    const rows = [
      { key: "urea", kg: totals.urea, nut: "n" },
      { key: pKey, kg: totals[pKey], nut: "p" },
      { key: "mop", kg: totals.mop, nut: "k" },
    ];
    if (gypsum) rows.push({ key: "gypsum", kg: gypsum, nut: null });

    const stages = SCHEDULE[cropV].map((st) => {
      const items = [];
      const u = totals.urea * st.f.n;
      const ph = totals[pKey] * st.f.p;
      const m = totals.mop * st.f.k;
      if (u >= 0.5) items.push({ key: "urea", kg: u });
      if (ph >= 0.5) items.push({ key: pKey, kg: ph });
      if (m >= 0.5) items.push({ key: "mop", kg: m });
      if (st.gypsum && gypsum) items.push({ key: "gypsum", kg: gypsum });
      return { row: st, items };
    });

    const soilMult = { sandy: 1.4, red: 1.2 }[soilV] || 1;
    const fymT = Math.round(base.fym * soilMult * area * 2) / 2;

    return { rows, stages, fymT };
  }

  function showRecommendation(scroll) {
    let area = parseFloat($("areaInput").value);
    if (!(area > 0)) area = 1;
    area = Math.min(area, 1000);
    lastInput = {
      cropV: $("cropSelect").value,
      soilV: $("soilSelect").value,
      area,
      lv: { n: levels.n, p: levels.p, k: levels.k },
    };
    $("scheduleCropSelect").value = lastInput.cropV;
    renderScheduleForCrop(lastInput.cropV);
    renderResult();
    renderNutrients();
    renderWarningBanner();
    if (scroll) $("resultCard").scrollIntoView({ behavior: "smooth", block: "start" });
    if (scroll) saveFertilizerAdvice();
    fetchAiInsight();
  }

  function secHead(iconName, key) {
    return '<h4 class="result__sec"><span class="ico">' + icon(iconName) + "</span>" + t(key) + "</h4>";
  }

  function renderResult() {
    if (!lastInput) return;
    const { cropV, soilV, area, lv } = lastInput;
    const crop = CROPS.find((c) => c.v === cropV);
    const soil = SOILS.find((s) => s.v === soilV);
    const plan = computePlan(cropV, soilV, lv, area);
    const cp = CROP_PLAN[cropV];
    const areaText = String(+area.toFixed(2));
    lastPlan = Object.assign({ crop, soil, areaText }, plan);
    const allHigh = lv.n === "high" && lv.p === "high" && lv.k === "high";

    const qtyRows = plan.rows.map((r) => {
      const prod = PRODUCT[r.key];
      const status = r.nut ? '<span class="status status--' + lv[r.nut] + '">' + t(lv[r.nut]) + "</span>" : "";
      return `
        <div class="qty-row">
          <div><div class="qty-row__name">${prod.name}${status}</div><div class="qty-row__role">${label(prod.role)}</div></div>
          <div class="qty-row__kg">${fmtNum(r.kg)} kg</div>
          <div class="qty-row__bags">${fmtNum(r.kg / prod.bag)}</div>
        </div>`;
    }).join("");

    const stageHtml = plan.stages.map((s, i) => `
      <li class="plan__step">
        <div class="plan__dot">${i + 1}</div>
        <div>
          <div class="plan__title">${label(s.row)}</div>
          <div class="plan__items">${s.items.map((it) => '<span class="pill"><b>' + PRODUCT[it.key].name + "</b>" + fmtNum(it.kg) + " kg</span>").join("")}</div>
          <p class="plan__detail">${lang === "ta" ? s.row.detailTa : s.row.detailEn}</p>
        </div>
      </li>`).join("");

    const html = `
      <div class="result__head">
        <div>
          <p class="result__kicker">${t("planFor")}</p>
          <h3 class="result__name">${label(crop)}</h3>
        </div>
        <div class="result__chips">
          <span class="chip">${label(soil)}</span>
          <span class="chip">${areaText} ${t("acreUnit")}</span>
        </div>
      </div>
      ${allHigh ? '<p class="result__banner">' + t("allHighNote") + "</p>" : ""}

      ${secHead("layers", "secRequirement")}
      <div class="qty">
        <div class="qty-row qty-row--head"><span>${t("colProduct")}</span><span>${t("colQty")}</span><span>${t("colBags")}</span></div>
        ${qtyRows}
      </div>
      <p class="result__note">${t("qtyNote").replace("{area}", areaText)}</p>

      ${secHead("calendar", "secPlan")}
      <ol class="plan">${stageHtml}</ol>

      ${secHead("sprout", "secOrganic")}
      <div class="mini-grid">
        <div class="mini"><h5>${t("fymTitle")}</h5><span class="mini__big">${fmtNum(plan.fymT)} t</span><p>${t("fymText").replace("{t}", fmtNum(plan.fymT))}</p></div>
        <div class="mini"><h5>${t("bioTitle")}</h5><p>${label(cp.bio)}</p></div>
        <div class="mini"><h5>${t("extraTitle")}</h5><p>${label(cp.organic)}</p></div>
      </div>

      ${secHead("drop", "secMicro")}
      <p class="text-block">${label(cp.micro)}</p>

      ${secHead("compass", "secSoil")}
      <ul class="check-list">${SOIL_ADVICE[soilV].map((a) => "<li>" + label(a) + "</li>").join("")}</ul>

      ${secHead("swap", "secAlt")}
      <ul class="check-list check-list--alt">${ALTERNATIVES.map((a) => "<li>" + label(a) + "</li>").join("")}</ul>

      ${secHead("alert", "secCaution")}
      <div class="caution"><span class="ico">${icon("alert")}</span><p>${label(cp.caution)}</p></div>

      ${secHead("sparkles", "secAi")}
      <div class="ai-insight" id="aiInsightBox">
        <div class="ai-insight__loading"><span class="ai-spinner"></span>${t("aiLoading")}</div>
      </div>

      <div class="result__actions">
        <button type="button" class="btn-secondary btn-whatsapp" id="shareBtn"><span class="ico">${icon("share")}</span>${t("btnShare")}</button>
        <button type="button" class="btn-secondary" id="printBtn"><span class="ico">${icon("print")}</span>${t("btnPrint")}</button>
      </div>`;

    $("resultPlaceholder").style.display = "none";
    const body = $("resultBody");
    body.classList.add("is-visible");
    body.innerHTML = html;
    $("shareBtn").addEventListener("click", shareOnWhatsApp);
    $("printBtn").addEventListener("click", printPlan);
  }

  /* ---------------- AI insight (real backend call) ---------------- */

  let aiRequestId = 0;

  async function fetchAiInsight() {
    if (!lastInput) return;
    const myId = ++aiRequestId;
    const box = $("aiInsightBox");
    if (box) box.innerHTML = '<div class="ai-insight__loading"><span class="ai-spinner"></span>' + t("aiLoading") + "</div>";

    const crop = CROPS.find((c) => c.v === lastInput.cropV);
    const soil = SOILS.find((s) => s.v === lastInput.soilV);

    try {
      const res = await fetch(`${API_BASE}/api/fertilizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: crop.en,
          soil: soil.en,
          n: lastInput.lv.n,
          p: lastInput.lv.p,
          k: lastInput.lv.k,
          lang,
        }),
      });
      const data = await res.json();
      if (myId !== aiRequestId) return; // a newer request superseded this one
      if (!res.ok) throw new Error((data.error && data.error.message) || "AI request failed");

      const box2 = $("aiInsightBox");
      if (!box2) return;
      box2.innerHTML = `
        <dl class="ai-insight__body" style="margin:0">
          <div class="ai-insight__row"><dt>${t("aiFertilizerName")}</dt><dd>${escapeHTML(data.fertilizerName)}</dd></div>
          <div class="ai-insight__row"><dt>${t("aiDosage")}</dt><dd>${escapeHTML(data.dosage)}</dd></div>
          <div class="ai-insight__row"><dt>${t("aiApplication")}</dt><dd>${escapeHTML(data.application)}</dd></div>
          <div class="ai-insight__row"><dt>${t("aiStage")}</dt><dd>${escapeHTML(data.stage)}</dd></div>
          <div class="ai-insight__row"><dt>${t("aiTip")}</dt><dd>${escapeHTML(data.tip)}</dd></div>
        </dl>`;
    } catch (err) {
      if (myId !== aiRequestId) return;
      console.error("AI insight fetch failed:", err);
      const box3 = $("aiInsightBox");
      if (box3) box3.innerHTML = '<p class="ai-insight__error">' + t("aiError") + "</p>";
    }
  }

  function buildShareText() {
    if (!lastPlan) return "";
    const p = lastPlan;
    const lines = [];
    lines.push("AgriNova — " + t("resultTitle"));
    lines.push(label(p.crop) + " | " + label(p.soil) + " | " + p.areaText + " " + t("acreUnit"));
    lines.push("");
    p.rows.forEach((r) => {
      lines.push("• " + PRODUCT[r.key].name + ": " + fmtNum(r.kg) + " kg (" + fmtNum(r.kg / PRODUCT[r.key].bag) + " " + t("colBags") + ")");
    });
    lines.push("");
    lines.push(t("secPlan") + ":");
    p.stages.forEach((s, i) => {
      const items = s.items.map((it) => PRODUCT[it.key].name + " " + fmtNum(it.kg) + " kg").join(", ") || "-";
      lines.push((i + 1) + ". " + label(s.row) + " — " + items);
    });
    lines.push("");
    lines.push(t("footNote"));
    return lines.join("\n");
  }

  function shareOnWhatsApp() {
    window.open("https://wa.me/?text=" + encodeURIComponent(buildShareText()), "_blank", "noopener");
  }

  function printPlan() {
    document.body.classList.add("printing-result");
    window.print();
  }
  window.addEventListener("afterprint", () => document.body.classList.remove("printing-result"));

  /* ---------------- Usage history + effect tracking ---------------- */

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function renderHistory() {
    const listEl = $("historyList");
    const emptyEl = $("historyEmpty");
    listEl.innerHTML = "";
    if (historyEntries.length === 0) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";
    historyEntries.slice().reverse().forEach((entry) => {
      const crop = CROPS.find((c) => c.v === entry.cropV);
      const fertNames = fertLabelsFor(entry.fertVs).join(", ");
      const row = document.createElement("div");
      row.className = "history-row";
      const effectStr = entry.rating
        ? `<div class="history-row__effect">${"★".repeat(entry.rating)}${"☆".repeat(5 - entry.rating)}${entry.notes ? " — " + entry.notes : ""}</div>`
        : "";
      row.innerHTML = `
        <div class="history-row__main"><b>${fmtDate(entry.date)}</b> · ${crop ? label(crop) : ""} · ${escapeHTML(fertNames)} · ${escapeHTML(entry.qty)}${effectStr}</div>
        <button type="button" class="history-row__del" data-id="${entry.id}" aria-label="Delete">&times;</button>`;
      row.querySelector(".history-row__del").addEventListener("click", () => {
        if (entry.dbId) fertPost("/api/fertilizer-usage/delete", { id: entry.dbId });
        historyEntries = historyEntries.filter((e) => e.id !== entry.id);
        saveHistory(historyEntries);
        renderHistory();
        renderEffectPanel();
      });
      listEl.appendChild(row);
    });
  }

  let pendingRating = 0;

  function renderEffectPanel() {
    const emptyEl = $("effectEmpty");
    const panel = $("effectPanel");
    if (historyEntries.length === 0) {
      emptyEl.style.display = "block";
      panel.style.display = "none";
      return;
    }
    emptyEl.style.display = "none";
    panel.style.display = "flex";
    const latest = historyEntries[historyEntries.length - 1];
    const crop = CROPS.find((c) => c.v === latest.cropV);
    const fertNames = fertLabelsFor(latest.fertVs).join(", ");
    $("effectEntryLabel").innerHTML = `<b>${fmtDate(latest.date)}</b> · ${crop ? label(crop) : ""} · ${escapeHTML(fertNames)}`;
    pendingRating = latest.rating || 0;
    renderStars();
    $("effectNotes").value = latest.notes || "";
  }

  function renderStars() {
    const wrap = $("starRating");
    wrap.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "★";
      btn.setAttribute("aria-label", i + " / 5");
      btn.className = i <= pendingRating ? "is-filled" : "";
      btn.addEventListener("click", () => { pendingRating = i; renderStars(); });
      wrap.appendChild(btn);
    }
  }

  /* ---------------- Reminder ---------------- */

  function renderReminderBanner() {
    const banner = $("reminderBanner");
    if (!reminder || !reminder.date) { banner.style.display = "none"; return; }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(reminder.date + "T00:00:00");
    const diffDays = Math.round((due - today) / 86400000);
    let text;
    if (diffDays < 0) {
      text = `${t("reminderOverdue")} ${fmtDate(reminder.date)}${reminder.note ? " — " + reminder.note : ""}`;
      banner.classList.add("is-due");
    } else if (diffDays === 0) {
      text = `${t("reminderToday")} ${reminder.note || ""}`;
      banner.classList.add("is-due");
    } else {
      text = `${diffDays} ${t("reminderDueSoon")} ${fmtDate(reminder.date)}${reminder.note ? " — " + reminder.note : ""}`;
      banner.classList.remove("is-due");
    }
    banner.textContent = text;
    banner.style.display = "block";
  }

  /* ---------------- Knowledge tip ---------------- */

  function renderKnowledgeTip() {
    $("knowledgeTip").textContent = label(KNOWLEDGE_TIPS[tipIndex]);
  }

  /* ---------------- Init / language ---------------- */

  function setLanguage(newLang) {
    lang = newLang;
    const cropV = $("cropSelect").value;
    const soilV = $("soilSelect").value;
    const scheduleCropV = $("scheduleCropSelect").value;
    const logCropV = $("logCrop").value;

    applyStaticStrings();
    populateSelect($("cropSelect"), CROPS, cropV);
    populateSelect($("soilSelect"), SOILS, soilV);
    populateSelect($("scheduleCropSelect"), CROPS, scheduleCropV || "rice");
    populateSelect($("logCrop"), CROPS, logCropV);
    renderFertMultiselect();

    renderSegs();
    renderLibraryTabs();
    renderLibraryItems(null);
    renderScheduleForCrop($("scheduleCropSelect").value);

    const irr = $("irrigationList"); irr.innerHTML = "";
    IRRIGATION_TIPS.forEach((row) => { const li = document.createElement("li"); li.textContent = label(row); irr.appendChild(li); });
    const wl = $("warningList"); wl.innerHTML = "";
    WARNING_SIGNS.forEach((row) => { const li = document.createElement("li"); li.textContent = label(row); wl.appendChild(li); });

    renderWarningBanner();
    renderListItems("guideList", GUIDE);
    renderListItems("safetyList", SAFETY);
    renderHistory();
    renderEffectPanel();
    renderReminderBanner();
    renderKnowledgeTip();

    if (lastInput) { renderResult(); renderNutrients(); fetchAiInsight(); }
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectIcons();

    ["cropSelect", "soilSelect", "scheduleCropSelect", "logCrop"].forEach((id) => makeSearchable($(id)));

    document.querySelectorAll(".langswitch button").forEach((btn) => {
      btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
    });

    $("npkRows").addEventListener("click", (e) => {
      const btn = e.target.closest(".seg__btn");
      if (!btn) return;
      levels[btn.dataset.key] = btn.dataset.level;
      renderSegs();
    });

    // Fertilizer multi-select: toggle panel, handle checkbox changes.
    $("logFertilizerBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      const panel = $("logFertilizerPanel");
      const btn = $("logFertilizerBtn");
      const opening = !panel.classList.contains("is-open");
      panel.classList.toggle("is-open", opening);
      btn.classList.toggle("is-open", opening);
      btn.setAttribute("aria-expanded", String(opening));
    });
    $("logFertilizerPanel").addEventListener("change", (e) => {
      const cb = e.target.closest('input[type="checkbox"]');
      if (!cb) return;
      if (cb.checked) logFertSelected.add(cb.value);
      else logFertSelected.delete(cb.value);
      renderFertMultiselect();
      // Keep panel open so the farmer can pick several fertilizers in a row.
      $("logFertilizerPanel").classList.add("is-open");
      $("logFertilizerBtn").classList.add("is-open");
    });
    document.addEventListener("click", (e) => {
      const wrap = $("logFertilizerMulti");
      if (wrap && !wrap.contains(e.target)) {
        $("logFertilizerPanel").classList.remove("is-open");
        $("logFertilizerBtn").classList.remove("is-open");
      }
    });

    $("recommendForm").addEventListener("submit", (e) => {
      e.preventDefault();
      showRecommendation(true);
    });

    $("scheduleCropSelect").addEventListener("change", (e) => renderScheduleForCrop(e.target.value));

    $("logDate").value = new Date().toISOString().slice(0, 10);

    $("historyForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if (logFertSelected.size === 0) {
        $("logFertilizerBtn").style.borderColor = "var(--danger)";
        setTimeout(() => { $("logFertilizerBtn").style.borderColor = ""; }, 1200);
        return;
      }
      const newEntry = {
        id: Date.now().toString(36),
        date: $("logDate").value,
        cropV: $("logCrop").value,
        fertVs: Array.from(logFertSelected),
        qty: $("logQty").value.trim(),
        rating: 0,
        notes: "",
      };
      historyEntries.push(newEntry);
      saveHistory(historyEntries);
      fertPost("/api/fertilizer-usage", newEntry).then((res) => {
        if (res && res.id) { newEntry.dbId = res.id; saveHistory(historyEntries); }
      });
      $("logQty").value = "";
      logFertSelected = new Set();
      renderFertMultiselect();
      renderHistory();
      renderEffectPanel();
    });

    $("saveEffectBtn").addEventListener("click", () => {
      if (historyEntries.length === 0) return;
      const latest = historyEntries[historyEntries.length - 1];
      latest.rating = pendingRating;
      latest.notes = $("effectNotes").value.trim();
      saveHistory(historyEntries);
      if (latest.dbId) fertPost("/api/fertilizer-usage/update", { id: latest.dbId, rating: latest.rating, notes: latest.notes });
      renderHistory();
      const btn = $("saveEffectBtn");
      btn.textContent = t("effectSaved");
      setTimeout(() => { btn.textContent = t("effectSaveBtn"); }, 1200);
    });

    $("reminderForm").addEventListener("submit", (e) => {
      e.preventDefault();
      reminder = { date: $("reminderDate").value, note: $("reminderNote").value.trim() };
      saveReminder(reminder);
      renderReminderBanner();
    });
    if (reminder) {
      $("reminderDate").value = reminder.date || "";
      $("reminderNote").value = reminder.note || "";
    }

    $("nextTipBtn").addEventListener("click", () => {
      tipIndex = (tipIndex + 1) % KNOWLEDGE_TIPS.length;
      renderKnowledgeTip();
    });

    /* Bottom nav: highlight the section currently in view */
    const navLinks = document.querySelectorAll(".bottomnav a");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    ["sec-recommend", "sec-library", "sec-schedule", "sec-track", "sec-tips"].forEach((id) => io.observe($(id)));

    setLanguage("en");
    injectIcons();
    syncUsageFromServer();
  });
})();
</script>
</body>
</html>
