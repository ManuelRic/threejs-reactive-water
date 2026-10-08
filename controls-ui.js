/* Lightweight controls: tab navigation and slider presentation, no render loop. */
(() => {
  const panel = document.getElementById('controls-panel');
  const content = document.getElementById('controls-content');
  const tabs = Array.from(panel.querySelectorAll('[data-control-tab]'));
  const groups = Array.from(panel.querySelectorAll('[data-control-category]'));
  const navigation = document.getElementById('ship-speed').closest('.control-group');
  content.insertBefore(navigation, panel.querySelector('.control-group-objects'));

  function selectTab(tab) {
    for (const candidate of tabs) {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
    }
    for (const group of groups) group.hidden = group.dataset.controlCategory !== tab.dataset.controlTab;
    content.setAttribute('aria-labelledby', tab.id);
    content.scrollTop = 0;
  }
  for (const tab of tabs) {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault();
      selectTab(tabs[next]);
      tabs[next].focus();
    });
  }

  function updateRange(slider) {
    const fraction = (Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min));
    slider.style.setProperty('--range-fill', `${Math.max(0, Math.min(1, fraction)) * 100}%`);
  }
  for (const slider of panel.querySelectorAll('input[type="range"]')) {
    updateRange(slider);
    const numberInput = document.getElementById(`${slider.id}-value`);
    const label = slider.closest('.range-control')?.querySelector('label span');
    if (numberInput && label) numberInput.setAttribute('aria-label', `${label.textContent.trim()} value`);
  }

  const wakeGroup = groups.find(group => group.dataset.controlCategory === 'wake');
  const wakeGrid = wakeGroup.querySelector('.control-grid');
  for (const id of ['hull-impulse', 'bow-strength', 'stern-turbulence', 'propeller-wash']) {
    wakeGrid.appendChild(document.getElementById(id).closest('.range-control'));
  }
})();
