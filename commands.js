const commandTarget = document.querySelector('#command-target');
const commandPreview = document.querySelector('#command-preview');
const commandStatus = document.querySelector('#command-status');

function getTarget() {
  return (commandTarget.value.trim().replace(/^https?:\/\//, '').split('/')[0] || '8.8.8.8');
}
function showCommand(type) {
  const command = type === 'ping' ? `ping ${getTarget()} -n 4` : `tracert ${getTarget()}`;
  commandPreview.textContent = command;
  return command;
}
commandTarget.addEventListener('input', () => showCommand('ping'));
document.querySelectorAll('[data-command-type]').forEach((button) => button.addEventListener('click', async () => {
  const command = showCommand(button.dataset.commandType);
  try {
    await navigator.clipboard.writeText(command);
    commandStatus.textContent = 'Скопировано. Вставьте команду в Windows Terminal и нажмите Enter.';
  } catch {
    commandStatus.textContent = 'Скопируйте команду из тёмного поля вручную.';
  }
}));
