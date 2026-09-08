const $ = (selector) => document.querySelector(selector);
const chat = $('#chat');
const messages = $('#messages');
const toast = $('#toast');

document.querySelectorAll('[data-scroll]').forEach((button) => button.addEventListener('click', () => $(button.dataset.scroll).scrollIntoView({ behavior: 'smooth' })));
document.querySelectorAll('[data-open-chat]').forEach((button) => button.addEventListener('click', () => { chat.classList.add('open'); chat.setAttribute('aria-hidden', 'false'); $('#chat-text').focus(); }));
$('[data-close-chat]').addEventListener('click', () => { chat.classList.remove('open'); chat.setAttribute('aria-hidden', 'true'); });

const answers = {
  'Подобрать тариф': 'Подскажите, сколько сотрудников работает в офисе и для каких задач нужен интернет? Я предложу подходящую скорость.',
  'Рассчитать IP': 'Выберите сценарий в IP-калькуляторе на странице или напишите, сколько серверов и устройств нужно подключить.',
  'Нужен VPN': 'IPsec VPN объединяет филиалы в единую защищённую сеть. Укажите количество локаций — сориентирую по архитектуре.'
};
function addMessage(text, type = 'bot-message') { const message = document.createElement('div'); message.className = type; message.textContent = text; messages.append(message); messages.scrollTop = messages.scrollHeight; }
document.querySelectorAll('.quick-questions button').forEach((button) => button.addEventListener('click', () => { addMessage(button.textContent, 'user-message'); setTimeout(() => addMessage(answers[button.textContent]), 250); }));
$('#chat-form').addEventListener('submit', (event) => { event.preventDefault(); const input = $('#chat-text'); const text = input.value.trim(); if (!text) return; addMessage(text, 'user-message'); input.value = ''; setTimeout(() => addMessage('Спасибо за вопрос. Для точного расчёта подготовлю решение после уточнения адреса объекта и БИН/ИИН компании.'), 350); });

document.querySelectorAll('.choice').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.choice').forEach((choice) => choice.classList.remove('active')); button.classList.add('active'); $('#cidr').textContent = button.dataset.cidr; $('#ips').textContent = button.dataset.ips; $('#cidr-description').textContent = button.dataset.desc; }));
document.querySelectorAll('[data-plan]').forEach((button) => button.addEventListener('click', () => { $('#lead-form select').value = button.dataset.plan; $('#request').scrollIntoView({ behavior: 'smooth' }); }));
$('#lead-form').addEventListener('submit', (event) => { event.preventDefault(); toast.textContent = 'Заявка принята — менеджер свяжется с вами в рабочее время.'; toast.classList.add('show'); event.target.reset(); setTimeout(() => toast.classList.remove('show'), 4200); });
