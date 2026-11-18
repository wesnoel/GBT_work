(function () {
  var SPRITE = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' +
    '<symbol id="i-person" viewBox="0 0 24 24"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/></symbol>' +
    '<symbol id="i-chat" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></symbol>' +
    '<symbol id="i-loyalty" viewBox="0 0 24 24"><path d="M21.4 11.6l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7c0 .6.2 1 .6 1.4l9 9a2 2 0 002.8 0l7-7a2 2 0 000-2.8zM6.5 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></symbol>' +
    '<symbol id="i-cal" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></symbol>' +
    '<symbol id="i-bed" viewBox="0 0 24 24"><path d="M21 10.8V7a3 3 0 00-3-3h-5a3 3 0 00-2 .8A3 3 0 009 4H6a3 3 0 00-3 3v3.8A3 3 0 002 13.5V20h2v-2h16v2h2v-6.5a3 3 0 00-1-2.7zM13 6h5a1 1 0 011 1v3h-6V6zM5 7a1 1 0 011-1h3a1 1 0 011 1v3H5V7zm-1 9v-2.5a1 1 0 011-1h14a1 1 0 011 1V16H4z"/></symbol>' +
    '<symbol id="i-lock" viewBox="0 0 24 24"><path d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zM9 6a3 3 0 016 0v2H9V6z"/></symbol>' +
    '<symbol id="i-info" viewBox="0 0 24 24"><path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"/></symbol>' +
    '<symbol id="i-warn" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></symbol>' +
    '<symbol id="i-next" viewBox="0 0 24 24"><path d="M10 6L8.6 7.4 13.2 12l-4.6 4.6L10 18l6-6z"/></symbol>' +
    '<symbol id="i-back" viewBox="0 0 24 24"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></symbol>' +
    '<symbol id="i-hotel" viewBox="0 0 24 24"><path d="M7 13a3 3 0 100-6 3 3 0 000 6zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9a4 4 0 00-4-4z"/></symbol>' +
    '</svg>';
  document.body.insertAdjacentHTML('afterbegin', SPRITE);
  document.querySelectorAll('[data-i]').forEach(function (el) {
    el.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-' + el.getAttribute('data-i') + '"/></svg>' + el.innerHTML;
  });

  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var AVATAR = {
    traveler: ['MO', 'Maya Okafor', 'Traveler'],
    arranger: ['PS', 'Priya Shah', 'Travel arranger'],
    counselor: ['DR', 'Dana Reyes', 'GBT counselor']
  };
  function apply() {
    var role = get('hmh-role', 'traveler'), state = get('hmh-state', 'normal');
    document.body.setAttribute('data-role', role);
    document.body.setAttribute('data-state', state);
    var a = AVATAR[role], c = document.querySelector('.eg-avatar-circle'), n = document.querySelector('.eg-avatar-name');
    if (c) c.textContent = a[0];
    if (n) n.innerHTML = a[1] + '<small>' + a[2] + '</small>';
    var r = document.getElementById('sel-role'), s = document.getElementById('sel-state');
    if (r) r.value = role; if (s) s.value = state;
    document.querySelectorAll('[data-disabled-when]').forEach(function (el) {
      var off = el.getAttribute('data-disabled-when').split(' ').indexOf(state) > -1;
      el.classList.toggle('disabled', off);
      el.setAttribute('aria-disabled', off ? 'true' : 'false');
      if (el.tagName === 'BUTTON') el.disabled = false; // stays focusable, announces disabled state
    });
    if (typeof window.onHubState === 'function') window.onHubState(role, state);
  }
  document.addEventListener('change', function (e) {
    if (e.target.id === 'sel-role') { set('hmh-role', e.target.value); apply(); }
    if (e.target.id === 'sel-state') { set('hmh-state', e.target.value); apply(); }
  });

  var toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var t;
  window.go = function (flow, detail) {
    var el = event && event.currentTarget;
    if (el && el.closest && el.closest('[aria-disabled="true"]')) {
      toast.innerHTML = 'Not available for this booking<small>Disabled items explain why on the page. Nothing happens on click.</small>';
    } else {
      toast.innerHTML = 'Next: ' + flow + (detail ? ' (' + detail + ')' : '') + ' flow<small>Out of scope for this round. Analytics: modify_type_attempted = ' + (detail || flow).toLowerCase().replace(/\s+/g, '_') + '</small>';
    }
    toast.classList.add('show'); clearTimeout(t); t = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  };
  apply();
})();
