const $ = (selector) => document.querySelector(selector);
const chat = $('#chat');
const messages = $('#messages');
const toast = $('#toast');

document.querySelectorAll('[data-scroll]').forEach((button) => button.addEventListener('click', () => $(button.dataset.scroll).scrollIntoView({ behavior: 'smooth' })));
document.querySelectorAll('[data-open-chat]').forEach((button) => button.addEventListener('click', () => { chat.classList.add('open'); chat.setAttribute('aria-hidden', 'false'); $('#chat-text').focus(); }));
$('[data-close-chat]').addEventListener('click', () => { chat.classList.remove('open'); chat.setAttribute('aria-hidden', 'true'); });

const answers = {
  'Поддержка 24/7': 'Круглосуточная техподдержка принимает аварийные обращения по каналу, VPN, IP-адресации и доступности сервисов. Укажите БИН компании, адрес объекта и контактный телефон — передам запрос дежурному инженеру.',
  'Выезд специалиста': 'Организуем выезд сетевого инженера: диагностика линии и оборудования, настройка маршрутизатора, Wi-Fi, VPN или серверной инфраструктуры. Для расчёта укажите город, адрес объекта и удобное время.',
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

function ipToNumber(ip) { const octets = ip.trim().split('.').map(Number); if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return null; return octets.reduce((total, value) => total * 256 + value, 0); }
function numberToIp(value) { return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.'); }
function setNetworkResult(message) { $('#gateway-status').textContent = message; }
$('#network-form').addEventListener('submit', (event) => { event.preventDefault(); const ip = ipToNumber($('#diag-ip').value); const gateway = ipToNumber($('#diag-gateway').value); const prefix = Number($('#diag-prefix').value); if (ip === null || gateway === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) { setNetworkResult('● Проверьте формат IP-адреса, шлюза и префикса CIDR.'); return; } const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0; const network = (ip & mask) >>> 0; const broadcast = (network | (~mask >>> 0)) >>> 0; const hosts = prefix >= 31 ? `${numberToIp(network)} — ${numberToIp(broadcast)}` : `${numberToIp(network + 1)} — ${numberToIp(broadcast - 1)}`; $('#network-address').textContent = `${numberToIp(network)}/${prefix}`; $('#network-mask').textContent = numberToIp(mask); $('#network-range').textContent = hosts; $('#network-broadcast').textContent = numberToIp(broadcast); const inNetwork = gateway >= network && gateway <= broadcast; const usableGateway = prefix >= 31 || (gateway > network && gateway < broadcast); setNetworkResult(`${inNetwork && usableGateway ? '● Шлюз входит в выбранную подсеть' : '● Внимание: шлюз не входит в рабочий диапазон подсети'}`); });
$('#site-form').addEventListener('submit', async (event) => { event.preventDefault(); const output = $('#site-result'); let host = $('#diag-host').value.trim().replace(/^https?:\/\//, '').split('/')[0]; if (!host) return; output.textContent = 'Проверяем DNS-запись…'; try { const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`); const data = await response.json(); const addresses = (data.Answer || []).filter((item) => item.type === 1).map((item) => item.data); output.textContent = addresses.length ? `DNS доступен: ${host} → ${addresses.join(', ')}` : `DNS-адрес для ${host} не найден. Это не подтверждает блокировку сайта.`; } catch { output.textContent = 'Не удалось выполнить DNS-проверку. Проверьте подключение к интернету и повторите попытку.'; } });
