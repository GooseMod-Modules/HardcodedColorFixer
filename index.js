const getVariablesArr = (css) => css.split(';').map((x) => x.trim()).filter((x) => x.startsWith('--'))
  .map((x) => x.split(':'));


export default {
goosemodHandlers: {
  onImport: async function () {
    const ctx = document.createElement('canvas').getContext('2d');

    const normaliseColor = (str) => { ctx.fillStyle = str; return ctx.fillStyle; };
    const normaliseColors = (str) => str.replace(/rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/g, normaliseColor);

    const sheet = window.document.styleSheets.filter((x) => x.href)[0];

    const darkThemeVars = getVariablesArr([...sheet.cssRules].filter((x) => x.selectorText === '.theme-dark')[1].cssText);
    const lightThemeVars = getVariablesArr([...sheet.cssRules].filter((x) => x.selectorText === '.theme-light')[1].cssText);

    const themeVars = darkThemeVars.concat(lightThemeVars).filter((x) => !x[0].includes('scrollbar') && !x[0].includes('logo')).map((x) => {
      x[1] = normaliseColor(x[1]);
      return x;
    });

    sheet.insertRule(`body {
      --brand-color: var(--brand-experiment);
      --brand-color-hover: var(--brand-experiment);
    }`, sheet.cssRules.length);

    for (const rule of sheet.cssRules) {
      if (rule.selectorText === '.theme-light' || rule.selectorText === '.theme-dark' || rule.selectorText === 'body') continue;

      let normalisedText = normaliseColors(rule.cssText);
      let changed = false;

      for (let v of themeVars) {
        if (normalisedText.includes(v[1])) {
          normalisedText = normalisedText.replace(v[1], `var(${v[0]})`);
          changed = true;

          break;
        }
      }

      if (changed) {
        sheet.insertRule(`${normalisedText}`, sheet.cssRules.length);
      }
    }
  },
  
  onRemove: async function () {
  },
}
};
