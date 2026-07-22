"use strict";
(() => {
  // src/bmi.ts
  function convertHeight(value, unit2) {
    return unit2 === "metric" ? value : value * 2.54;
  }
  function convertWeight(value, unit2) {
    return unit2 === "metric" ? value : value * 0.45359237;
  }
  function calculateBMI(weight, height, unit2 = "metric") {
    const raw = unit2 === "metric" ? weight / (height / 100) ** 2 : 703 * weight / height ** 2;
    return Math.round(raw * 10) / 10;
  }
  function getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Healthy Weight";
    if (bmi < 30) return "Overweight";
    if (bmi < 35) return "Obesity Class I";
    if (bmi < 40) return "Obesity Class II";
    return "Obesity Class III";
  }
  function calculateHealthyWeightRange(heightCm, unit2) {
    const m = heightCm / 100, factor = unit2 === "metric" ? 1 : 2.2046226218;
    return [18.5 * m * m * factor, 24.9 * m * m * factor];
  }
  function makeBMIResult(input) {
    const bmi = calculateBMI(input.weightKg, input.heightCm);
    const category = getBMICategory(bmi);
    const [healthyMin, healthyMax] = calculateHealthyWeightRange(input.heightCm, input.unit);
    const current2 = input.unit === "metric" ? input.weightKg : input.weightKg * 2.2046226218;
    const label = input.unit === "metric" ? "kg" : "lb";
    const difference = current2 < healthyMin ? `${(healthyMin - current2).toFixed(1)} ${label} below the healthy range` : current2 > healthyMax ? `${(current2 - healthyMax).toFixed(1)} ${label} above the healthy range` : "Within the estimated healthy range";
    const advice = { "Underweight": "Consider discussing nutrition, strength, and gradual weight gain with a qualified professional.", "Healthy Weight": "Keep supporting your health with balanced meals, regular movement, sleep, and routine care.", "Overweight": "Small, sustainable changes in meals, activity, sleep, and stress may support long-term health.", "Obesity Class I": "A healthcare professional can help you set safe, realistic goals based on your full health picture.", "Obesity Class II": "Consider speaking with a healthcare professional for an individualized and supportive assessment.", "Obesity Class III": "A qualified healthcare professional can provide an individualized assessment and safe care options." };
    return { bmi, category, status: category === "Healthy Weight" ? "Within the general adult healthy BMI range" : "Outside the general adult healthy BMI range", healthyMin, healthyMax, difference, recommendation: advice[category], input, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
  }

  // src/health-calculators.ts
  function calculateBMR(weightKg, heightCm, age, gender) {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return Math.round(base + (gender === "female" ? -161 : 5));
  }
  function calculateTDEE(bmr, multiplier) {
    return Math.round(bmr * multiplier);
  }
  function calculateIdealWeight(heightCm, gender) {
    const inches = Math.max(0, heightCm / 2.54 - 60), male = gender !== "female";
    const vals = { devine: (male ? 50 : 45.5) + (male ? 2.3 : 2.3) * inches, robinson: (male ? 52 : 49) + (male ? 1.9 : 1.7) * inches, miller: (male ? 56.2 : 53.1) + (male ? 1.41 : 1.36) * inches, hamwi: (male ? 48 : 45.5) + (male ? 2.7 : 2.2) * inches };
    const rounded = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, Math.round(v * 10) / 10]));
    return { ...rounded, average: Math.round(Object.values(vals).reduce((a, b) => a + b, 0) / 4 * 10) / 10 };
  }
  function estimateBodyFat(bmi, age, gender) {
    return Math.round((1.2 * bmi + 0.23 * age - (gender === "female" ? 5.4 : 16.2)) * 10) / 10;
  }
  function calculateWaistToHeightRatio(waist, height) {
    return Math.round(waist / height * 100) / 100;
  }
  function calculateWaterIntake(weightKg, exerciseMinutes, hot, pregnancy) {
    const ml = Math.round(weightKg * 35 + exerciseMinutes * 12 + (hot ? 500 : 0) + (pregnancy ? 500 : 0));
    return { ml, litres: Math.round(ml / 100) / 10, glasses: Math.round(ml / 250) };
  }

  // src/storage.ts
  var KEY = "healthmetric-history";
  function storageEnabled() {
    return localStorage.getItem("healthmetric-storage") === "yes";
  }
  function setStorageEnabled(on) {
    localStorage.setItem("healthmetric-storage", on ? "yes" : "no");
    if (!on) localStorage.removeItem(KEY);
  }
  function saveResult(result) {
    if (!storageEnabled()) return loadResultHistory();
    const list = [result, ...loadResultHistory()].slice(0, 10);
    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
  }
  function loadResultHistory() {
    try {
      const p = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(p) ? p.filter((x) => typeof x === "object" && x !== null && "id" in x) : [];
    } catch {
      return [];
    }
  }
  function deleteResult(id) {
    const list = loadResultHistory().filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
    return list;
  }
  function clearHistory() {
    localStorage.removeItem(KEY);
  }

  // src/theme.ts
  function applyTheme(theme) {
    const dark = theme === "dark" || theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.querySelector("#theme-toggle")?.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
  }
  function initTheme() {
    const saved = localStorage.getItem("healthmetric-theme") || "system";
    applyTheme(saved);
    document.querySelector("#theme-toggle")?.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("healthmetric-theme", next);
      applyTheme(next);
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if ((localStorage.getItem("healthmetric-theme") || "system") === "system") applyTheme("system");
    });
  }

  // src/validation.ts
  function validateInputs(values, limits) {
    const errors = {};
    Object.entries(limits).forEach(([key, [min, max]]) => {
      const v = values[key];
      if (!Number.isFinite(v)) errors[key] = "Enter a valid number.";
      else if (v <= 0) errors[key] = "Value must be greater than zero.";
      else if (v < min || v > max) errors[key] = `Enter a realistic value between ${min} and ${max}.`;
    });
    return errors;
  }
  function setFieldErrors(form, errors) {
    form.querySelectorAll(".error").forEach((e) => e.textContent = "");
    Object.entries(errors).forEach(([k, v]) => {
      const el = form.querySelector(`[data-error-for="${k}"]`);
      if (el) el.textContent = v;
      const field = form.elements.namedItem(k);
      if (field instanceof HTMLElement) field.setAttribute("aria-invalid", "true");
    });
  }

  // src/app.ts
  var $ = (s, p = document) => p.querySelector(s);
  var $$ = (s, p = document) => [...p.querySelectorAll(s)];
  var live = $("#live");
  var current = null;
  function announce(s) {
    live.textContent = "";
    setTimeout(() => live.textContent = s, 20);
  }
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  function unit() {
    return $('input[name="unit"]:checked')?.value || "metric";
  }
  function syncUnits() {
    const metric = unit() === "metric";
    $("#metric-height")?.classList.toggle("hidden", !metric);
    $("#imperial-height")?.classList.toggle("hidden", metric);
    setText("weight-unit", metric ? "kg" : "lb");
    clearBMIResult();
  }
  function readBMI() {
    const form = $("#bmi-form"), u = unit(), age = Number(form.elements.namedItem("age").value), weight = Number(form.elements.namedItem("weight").value), cm = u === "metric" ? Number(form.elements.namedItem("heightCm").value) : convertHeight(Number(form.elements.namedItem("feet").value) * 12 + Number(form.elements.namedItem("inches").value || 0), "imperial");
    const errors = validateInputs({ age, weight, heightCm: cm }, { age: [18, 120], weight: u === "metric" ? [25, 400] : [55, 880], heightCm: [100, 250] });
    if (u === "imperial") {
      const feet = Number(form.elements.namedItem("feet").value), inches = Number(form.elements.namedItem("inches").value || 0);
      if (!Number.isFinite(feet) || feet < 3 || feet > 8) errors.feet = "Enter feet from 3 to 8.";
      if (!Number.isFinite(inches) || inches < 0 || inches > 11) errors.inches = "Enter inches from 0 to 11.";
    }
    setFieldErrors(form, errors);
    if (Object.keys(errors).length) {
      announce("Please correct the highlighted fields.");
      return null;
    }
    const kg = convertWeight(weight, u);
    return { age, gender: form.elements.namedItem("gender").value, unit: u, heightCm: cm, weightKg: kg, displayHeight: u === "metric" ? `${cm} cm` : `${form.elements.namedItem("feet").value} ft ${form.elements.namedItem("inches").value || 0} in`, displayWeight: `${weight} ${u === "metric" ? "kg" : "lb"}` };
  }
  function renderResults(r) {
    current = r;
    const label = r.input.unit === "metric" ? "kg" : "lb";
    setText("result-score", r.bmi.toFixed(1));
    setText("result-category", r.category);
    setText("result-status", r.status);
    setText("result-range", `${r.healthyMin.toFixed(1)}\u2013${r.healthyMax.toFixed(1)} ${label}`);
    setText("result-difference", r.difference);
    setText("result-advice", r.recommendation);
    const marker = $("#gauge-marker");
    marker.style.left = `${Math.max(1, Math.min(99, (r.bmi - 10) / 40 * 100))}%`;
    const section = $("#bmi-results");
    section.hidden = false;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    announce(`BMI ${r.bmi.toFixed(1)}, ${r.category}.`);
  }
  function clearBMIResult() {
    current = null;
    const r = $("#bmi-results");
    if (r) r.hidden = true;
  }
  function resetCalculator() {
    $("#bmi-form").reset();
    syncUnits();
    setFieldErrors($("#bmi-form"), {});
  }
  function summary(r, details = false) {
    return `HealthMetric BMI summary
BMI: ${r.bmi.toFixed(1)} (${r.category})
Healthy BMI range: 18.5\u201324.9
Estimated healthy weight: ${r.healthyMin.toFixed(1)}\u2013${r.healthyMax.toFixed(1)} ${r.input.unit === "metric" ? "kg" : "lb"}${details ? `
Age: ${r.input.age}
Weight: ${r.input.displayWeight}
Height: ${r.input.displayHeight}` : ""}
Educational estimate\u2014not a medical diagnosis.`;
  }
  function renderHistory(list = loadResultHistory()) {
    const box = $("#history-list");
    box.replaceChildren();
    if (!list.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "No saved calculations yet.";
      box.append(p);
      return;
    }
    list.forEach((x) => {
      const card = document.createElement("article");
      card.className = "history-item";
      const text = document.createElement("div");
      text.textContent = `${new Date(x.createdAt).toLocaleString()} \u2014 BMI ${x.bmi.toFixed(1)}, ${x.category}, ${x.weight}`;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "text-button danger";
      b.textContent = "Delete";
      b.addEventListener("click", () => renderHistory(deleteResult(x.id)));
      card.append(text, b);
      box.append(card);
    });
  }
  function handleHealth(form) {
    const kind = form.dataset.calculator || "", out = $(".mini-result", form);
    const n = (name) => Number(form.elements.namedItem(name).value), u = form.elements.namedItem("unit")?.value || "metric";
    let message = "";
    try {
      if (kind === "bmr" || kind === "tdee" || kind === "ideal" || kind === "fat" || kind === "calorie") {
        const age = n("age"), height = convertHeight(n("height"), u), weight = convertWeight(n("weight"), u), gender = form.elements.namedItem("gender").value;
        const errors = validateInputs({ age, height, weight }, { age: [18, 120], height: [100, 250], weight: [25, 400] });
        if (Object.keys(errors).length) throw new Error("Enter realistic age, height, and weight values.");
        const bmr = calculateBMR(weight, height, age, gender), tdee = calculateTDEE(bmr, n("activity") || 1.2);
        if (kind === "bmr") message = `Estimated BMR: ${bmr.toLocaleString()} kcal/day at rest.`;
        if (kind === "tdee") message = `Maintenance: ${tdee} kcal \u2022 Mild loss: ${Math.max(1200, tdee - 250)} \u2022 Standard loss: ${Math.max(1200, tdee - 500)} \u2022 Mild gain: ${tdee + 250}`;
        if (kind === "ideal") {
          const v = calculateIdealWeight(height, gender), f = u === "metric" ? 1 : 2.20462, l = u === "metric" ? "kg" : "lb";
          message = `Devine ${(v.devine * f).toFixed(1)}, Robinson ${(v.robinson * f).toFixed(1)}, Miller ${(v.miller * f).toFixed(1)}, Hamwi ${(v.hamwi * f).toFixed(1)}; average ${(v.average * f).toFixed(1)} ${l}. Approximate references only.`;
        }
        if (kind === "fat") message = `Estimated body fat: ${estimateBodyFat(calculateBMI(weight, height), age, gender).toFixed(1)}%. This BMI-based result is an estimate.`;
        if (kind === "calorie") {
          const goal = form.elements.namedItem("goal").value;
          const target = goal === "lose" ? Math.max(gender === "female" ? 1200 : 1500, tdee - 400) : goal === "gain" ? tdee + 300 : tdee;
          message = `General ${goal} target: about ${target} kcal/day. Avoid extreme deficits and seek personal advice when needed.`;
        }
      } else if (kind === "waist") {
        const ratio = calculateWaistToHeightRatio(n("waist"), n("height"));
        if (!Number.isFinite(ratio) || n("waist") <= 0 || n("height") <= 0) throw new Error("Enter waist and height values greater than zero.");
        message = `Waist-to-height ratio: ${ratio.toFixed(2)}. ${ratio < 0.5 ? "Generally below the common 0.5 screening threshold." : "At or above the common 0.5 screening threshold."} Consult a professional for individual risk assessment.`;
      } else if (kind === "water") {
        const w = convertWeight(n("weight"), u);
        if (w < 25 || w > 400) throw new Error("Enter a realistic weight.");
        const v = calculateWaterIntake(w, n("exercise") || 0, form.elements.namedItem("hot").checked, form.elements.namedItem("pregnancy").checked);
        message = `Estimated daily water: ${v.ml.toLocaleString()} ml (${v.litres.toFixed(1)} L), about ${v.glasses} glasses. Individual needs vary.`;
      }
    } catch (e) {
      message = e instanceof Error ? e.message : "Check your entries.";
      out.dataset.state = "error";
    }
    out.textContent = message;
    out.hidden = false;
    announce(message);
  }
  function init() {
    initTheme();
    syncUnits();
    $$('input[name="unit"]').forEach((x) => x.addEventListener("change", syncUnits));
    const form = $("#bmi-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = readBMI();
      if (input) renderResults(makeBMIResult(input));
    });
    form.addEventListener("input", clearBMIResult);
    $("#reset-bmi")?.addEventListener("click", resetCalculator);
    $("#recalculate")?.addEventListener("click", () => {
      clearBMIResult();
      $("#bmi-calculator")?.scrollIntoView({ behavior: "smooth" });
    });
    $$(".health-form").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      handleHealth(f);
    }));
    const nav = $("#nav-menu");
    $("#menu-toggle")?.addEventListener("click", (e) => {
      const b = e.currentTarget, open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
    $$("#nav-menu a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("open");
      $("#menu-toggle")?.setAttribute("aria-expanded", "false");
    }));
    $$(".accordion-button").forEach((b) => b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open));
      const panel = document.getElementById(b.getAttribute("aria-controls") || "");
      if (panel) panel.hidden = open;
    }));
    const setting = $("#storage-toggle");
    setting.checked = storageEnabled();
    setting.addEventListener("change", () => {
      setStorageEnabled(setting.checked);
      renderHistory();
      announce(setting.checked ? "Local result storage enabled." : "Local result storage disabled and history removed.");
    });
    $("#save-result")?.addEventListener("click", () => {
      if (!current) return;
      if (!storageEnabled()) {
        const dialog = $("#storage-dialog");
        dialog.showModal();
        return;
      }
      renderHistory(saveResult({ id: crypto.randomUUID(), createdAt: current.createdAt, bmi: current.bmi, category: current.category, weight: current.input.displayWeight }));
      announce("Result saved locally.");
    });
    $("#allow-storage")?.addEventListener("click", () => {
      setting.checked = true;
      setStorageEnabled(true);
      $("#storage-dialog").close();
      $("#save-result")?.dispatchEvent(new Event("click"));
    });
    $("#clear-history")?.addEventListener("click", () => $("#clear-dialog").showModal());
    $("#confirm-clear")?.addEventListener("click", () => {
      clearHistory();
      renderHistory();
      $("#clear-dialog").close();
      announce("History cleared.");
    });
    $$("[data-close-dialog]").forEach((b) => b.addEventListener("click", () => b.closest("dialog")?.close()));
    $("#copy-result")?.addEventListener("click", async () => {
      if (current) {
        await navigator.clipboard.writeText(summary(current, $("#share-details").checked));
        announce("Result summary copied.");
      }
    });
    $("#share-result")?.addEventListener("click", async () => {
      if (!current) return;
      const text = summary(current, $("#share-details").checked);
      if (navigator.share) await navigator.share({ title: "My HealthMetric BMI summary", text });
      else {
        await navigator.clipboard.writeText(text);
        announce("Sharing is unavailable; summary copied instead.");
      }
    });
    $("#print-result")?.addEventListener("click", () => window.print());
    $("#download-result")?.addEventListener("click", () => {
      if (!current) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([summary(current, $("#share-details").checked)], { type: "text/plain" }));
      a.download = "healthmetric-bmi-summary.txt";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    renderHistory();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
