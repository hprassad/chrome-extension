document.getElementById('save').addEventListener('click', () => {
  const input = document.getElementById('api-key');
  const status = document.getElementById('status');
  const key = (input.value || '').trim();
  if (!key) {
    status.textContent = 'Please enter an API key.';
    status.className = 'status error';
    return;
  }
  chrome.storage.sync.set({ tmdbApiKey: key }, () => {
    status.textContent = 'Saved. You can close this tab.';
    status.className = 'status success';
  });
});

chrome.storage.sync.get(['tmdbApiKey'], (data) => {
  const key = (data && data.tmdbApiKey) || '';
  document.getElementById('api-key').value = key;
});
