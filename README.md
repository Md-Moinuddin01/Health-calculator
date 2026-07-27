# HealthMetric – BMI & Health Calculator

<img width="1887" height="854" alt="health claculate &#39;" src="https://github.com/user-attachments/assets/f46450f4-2499-4f8a-a89f-c70bab64e8e9" />

A responsive, accessible, framework-free health calculator. All calculations run locally in the browser. No information is uploaded. Saved BMI history is opt-in and limited to the latest 10 entries in `localStorage`.

## Run locally

1. Open `index.html` directly in a modern browser, or serve the folder with any static server.
2. The compiled JavaScript is already included in `js/`.

## Compile TypeScript
<img width="1875" height="848" alt="helth123" src="https://github.com/user-attachments/assets/bd9f480d-40c1-4e6a-a4e9-4d95ee0bf273" />

Install Node.js 18+ and run:

```bash
npm install
npm run build
```

Use `npm run check` for a strict type check, or `npm run watch` while editing.
<img width="1807" height="819" alt="health metrix" src="https://github.com/user-attachments/assets/621a152c-c51b-4c61-bf6a-81b98547f73c" />

## Formula test cases

| Calculator | Inputs | Expected (rounded) |
|---|---|---|
| Metric BMI | 70 kg, 175 cm | 22.9 |
| Imperial BMI | 154 lb, 68.9 in | 22.8 |
| Healthy weight | 175 cm | 56.7–76.3 kg |
| Male BMR | 70 kg, 175 cm, age 30 | 1,649 kcal/day |
| Female BMR | 60 kg, 165 cm, age 30 | 1,320 kcal/day |
| TDEE | BMR 1,649, moderate 1.55 | 2,556 kcal/day |
| Male body fat | BMI 22.9, age 30 | 18.2% |
| Waist-to-height | 80 cm / 175 cm | 0.46 |
| Water intake | 70 kg, no extras | 2,450 ml / 2.5 L / ~10 glasses |

Ideal-weight formula results apply to adults at least 5 feet tall and are approximate references. BMI, BMR, TDEE, body-fat, hydration, and calorie outputs are educational estimates—not diagnoses or individualized medical advice.

## Project structure

Source modules are in `src/`; compiled ES modules are in `js/`; base, responsive, and print styles are in `css/`. The application requires no backend, database, third-party API, or UI framework.
