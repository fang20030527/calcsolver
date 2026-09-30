import { evaluateExpression, formatResult } from '../lib/calculator';

const calculator = document.querySelector<HTMLElement>('#calculator');
if (calculator) {
  const display = calculator.querySelector<HTMLInputElement>('#expression')!;
  const mode = calculator.querySelector<HTMLInputElement>('#code-mode')!;
  const status = calculator.querySelector<HTMLElement>('#calc-status')!;
  const modeLabel = calculator.querySelector<HTMLElement>('#calc-mode-label')!;
  const angleLabel = calculator.querySelector<HTMLElement>('#calc-angle-label')!;
  const scientificToggle = calculator.querySelector<HTMLButtonElement>('#scientific-toggle')!;
  const science = calculator.querySelector<HTMLElement>('#scientific-keys')!;
  let code = '';
  let computed = false;

  function tell(message: string, error = false) {
    status.textContent = message;
    status.classList.toggle('is-error', error);
    display.setAttribute('aria-invalid', String(error));
  }

  function clear() {
    code = '';
    computed = false;
    display.value = '0';
    tell(mode.checked ? 'Enter a four-digit activity code.' : 'Ready when you are.');
  }

  function sendCode() {
    if (code.length !== 4) return;
    const submitted = code;
    code = '';
    document.dispatchEvent(new CustomEvent('calcsolver:open', { detail: { code: submitted } }));
  }

  function solve() {
    if (mode.checked) { sendCode(); return; }
    try {
      const expression = display.value;
      display.value = formatResult(evaluateExpression(expression));
      computed = true;
      tell(`${expression} = ${display.value}`);
    } catch (error) {
      tell(error instanceof Error ? error.message : 'Check your expression and try again.', true);
      computed = false;
    }
  }

  function input(value: string) {
    if (mode.checked) {
      if (!/^\d$/.test(value)) return;
      code = (code + value).slice(-4);
      display.value = '•'.repeat(code.length);
      tell(code.length === 4 ? 'Opening activity…' : `${code.length} of 4 digits`);
      sendCode();
      return;
    }
    if (value === 'reciprocal') {
      display.value = `1/(${display.value})`;
      solve();
      return;
    }
    if (value === 'sqrt(' && display.value !== '0' && display.value !== '') {
      display.value = `sqrt(${display.value})`;
      solve();
      return;
    }
    const reset = display.value === '0' || (computed && !/^[+\-*/^%!]/.test(value));
    if (reset) display.value = value === '.' ? '0.' : value;
    else if (display.selectionStart !== null && document.activeElement === display) {
      const start = display.selectionStart;
      const end = display.selectionEnd ?? start;
      display.value = display.value.slice(0, start) + value + display.value.slice(end);
      display.setSelectionRange(start + value.length, start + value.length);
    } else display.value += value;
    computed = false;
    tell('Press = or Enter to calculate.');
    display.scrollLeft = display.scrollWidth;
  }

  function backspace() {
    if (mode.checked) {
      code = code.slice(0, -1);
      display.value = code ? '•'.repeat(code.length) : '0';
    } else display.value = display.value.slice(0, -1) || '0';
    computed = false;
    tell(mode.checked ? 'Enter a four-digit activity code.' : 'Press = or Enter to calculate.');
  }

  calculator.querySelectorAll<HTMLButtonElement>('button[data-value], button[data-action]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.value) input(button.dataset.value);
    if (button.dataset.action === 'clear') clear();
    if (button.dataset.action === 'equals') solve();
    if (button.dataset.action === 'backspace') backspace();
  }));

  mode.addEventListener('change', () => {
    display.readOnly = mode.checked;
    display.inputMode = mode.checked ? 'numeric' : 'text';
    modeLabel.textContent = mode.checked ? 'ACTIVITY CODE' : 'STANDARD';
    angleLabel.hidden = mode.checked;
    scientificToggle.disabled = mode.checked;
    science.hidden = true;
    scientificToggle.setAttribute('aria-expanded', 'false');
    clear();
  });

  scientificToggle.addEventListener('click', () => {
    science.hidden = !science.hidden;
    scientificToggle.setAttribute('aria-expanded', String(!science.hidden));
    modeLabel.textContent = science.hidden ? 'STANDARD' : 'SCIENTIFIC';
  });

  display.addEventListener('input', () => { computed = false; tell('Press = or Enter to calculate.'); });
  document.addEventListener('keydown', event => {
    const dialog = document.querySelector<HTMLDialogElement>('#activities');
    if (dialog?.open || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (target !== display && target !== mode && (target.matches('input, textarea, select') || target.isContentEditable || (target.matches('button') && !calculator!.contains(target)))) return;
    if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); solve(); }
    else if (event.key === 'Escape') { event.preventDefault(); clear(); }
    else if (mode.checked && /^\d$/.test(event.key)) { event.preventDefault(); input(event.key); }
    else if (mode.checked && event.key === 'Backspace') { event.preventDefault(); backspace(); }
    else if (target === display && computed && /^[0-9.]$/.test(event.key)) { event.preventDefault(); input(event.key); }
    else if (target !== display && /^[0-9.+\-*/()^%!a-z]$/i.test(event.key)) { event.preventDefault(); input(event.key); }
    else if (target !== display && event.key === 'Backspace') { event.preventDefault(); backspace(); }
  });

  document.addEventListener('calcsolver:invalid-code', () => { display.value = '0'; tell('Code not found. Try 0000 for all activities.', true); });
  document.addEventListener('calcsolver:closed', clear);
  document.addEventListener('calcsolver:example', event => {
    const expression = (event as CustomEvent<{expression:string}>).detail.expression;
    if (mode.checked) { mode.checked = false; mode.dispatchEvent(new Event('change')); }
    display.value = expression;
    solve();
  });
  calculator.querySelector('#copy-result')?.addEventListener('click', async () => {
    if (mode.checked) { tell('Switch to calculation mode to copy a result.'); return; }
    try { await navigator.clipboard.writeText(display.value); tell('Result copied.'); }
    catch { display.focus(); display.select(); tell('Select and copy the result with your keyboard.'); }
  });
}
