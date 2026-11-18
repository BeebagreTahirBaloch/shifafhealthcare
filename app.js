'use strict';
(() => {
  const business = window.SHIFA_BUSINESS;
  if (!business) return;
  const grid = document.querySelector('#service-grid');
  const serviceSelect = document.querySelector('#booking-service');
  business.services.forEach(service => {
    const card = document.createElement('article'); card.className = 'service-card';
    const art = document.createElement('div'); art.className = `service-art tone-${service.tone}`; art.setAttribute('aria-hidden','true');
    const icon = document.createElement('span'); icon.textContent = service.icon; art.append(icon);
    const title = document.createElement('h3'); title.textContent = service.name;
    const description = document.createElement('p'); description.textContent = service.description;
    const link = document.createElement('a'); link.className = 'button button-primary'; link.href = '#booking'; link.dataset.service = service.name; link.setAttribute('aria-label',`Book ${service.name}`); link.textContent = 'Book This Service';
    const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden','true'); arrow.textContent = '↗'; link.append(arrow);
    card.append(art,title,description,link); grid.append(card);
    const option = document.createElement('option'); option.value = service.name; option.textContent = service.name; serviceSelect.append(option);
  });
  document.querySelectorAll('[data-book], [data-service]').forEach(link => { link.href = '#booking'; link.removeAttribute('target'); link.removeAttribute('rel'); });

  document.querySelectorAll('[data-phone]').forEach(link => { link.href = `tel:+${business.whatsapp}`; });
  document.querySelectorAll('[data-phone-text]').forEach(el => { el.textContent = business.phoneDisplay; });
  document.querySelectorAll('[data-area]').forEach(el => { el.textContent = business.serviceArea; });
  document.querySelectorAll('[data-hours]').forEach(el => { el.textContent = business.hours; });
  document.querySelector('#year').textContent = new Date().getFullYear();
  const form = document.querySelector('#appointment-form');
  const dateInput = document.querySelector('#preferred-date');
  const today = new Date();
  dateInput.min = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  document.querySelectorAll('[data-book], [data-service], .nav-link[href="#booking"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const requested = link.dataset.service;
      if (requested) {
        const service = business.services.find(item => item.name === requested);
        serviceSelect.value = service ? service.name : '';
      }
      closeMenu();
      document.querySelector('#help-dialog').close();
      if (location.hash !== '#booking') history.pushState(null, '', '#booking');
      document.querySelector('#booking').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
      serviceSelect.focus({preventScroll:true});
    });
  });
  const patientName = document.querySelector('#patient-name');
  const patientPhone = document.querySelector('#patient-phone');
  const patientAddress = document.querySelector('#patient-address');
  [patientName, patientPhone, patientAddress].forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));
  form.addEventListener('submit', event => {
    event.preventDefault();
    patientName.setCustomValidity(patientName.value.trim() ? '' : 'Please enter the patient name.');
    patientAddress.setCustomValidity(patientAddress.value.trim() ? '' : 'Please enter the address or location.');
    const digits = patientPhone.value.replace(/[^0-9]/g, '');
    const validPhone = /^[+0-9()\s-]+$/.test(patientPhone.value) && digits.length >= 7 && digits.length <= 15;
    patientPhone.setCustomValidity(validPhone ? '' : 'Please enter a valid contact number, including the area or country code.');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = name => String(data.get(name) || '').trim();
    const appointmentMessage = [
      'Hello ' + business.name + ', I would like to request an appointment.',
      '',
      'Service Required: ' + value('service'),
      'Patient Name: ' + value('patientName'),
      'Age: ' + (value('age') || 'Not specified'),
      'Gender: ' + (value('gender') || 'Not specified'),
      'Contact Number: ' + value('contactNumber'),
      'Address / Location: ' + value('address'),
      'Preferred Date: ' + (value('preferredDate') || 'Please discuss with me'),
      'Preferred Time: ' + (value('preferredTime') || 'Please discuss with me'),
      'Medical Concern / Notes: ' + (value('notes') || 'None provided'),
      '',
      'Please confirm availability and pricing. Thank you.'
    ].join('\n');
    window.location.assign('https://wa.me/' + business.whatsapp + '?text=' + encodeURIComponent(appointmentMessage));
  });
  document.querySelector('#booking-link').disabled = false;
  const toggle = document.querySelector('.menu-toggle'); const navigation = document.querySelector('#navigation');
  function closeMenu(){ navigation.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation'); }
  toggle.addEventListener('click',()=>{ const expanded = toggle.getAttribute('aria-expanded') === 'true'; navigation.classList.toggle('open',!expanded); toggle.setAttribute('aria-expanded',String(!expanded)); toggle.setAttribute('aria-label',expanded ? 'Open navigation' : 'Close navigation'); });
  navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('click',e=>{ if(!e.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && toggle.getAttribute('aria-expanded')==='true'){ closeMenu(); toggle.focus(); } });
  window.matchMedia('(min-width: 801px)').addEventListener('change',closeMenu);
  const links=[...document.querySelectorAll('.nav-link')]; const sections=links.map(link=>document.querySelector(link.getAttribute('href'))); let scheduled=false;
  function updateActive(){ const threshold=document.querySelector('.site-header').offsetHeight+100; let current=sections[0]; sections.forEach(section=>{if(section.getBoundingClientRect().top<=threshold) current=section;}); if(innerHeight+scrollY>=document.documentElement.scrollHeight-12) current=sections.at(-1); links.forEach(link=>{const active=link.hash===`#${current.id}`; link.classList.toggle('active',active); if(active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');}); scheduled=false; }
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateActive);}}, {passive:true}); window.addEventListener('resize',updateActive); updateActive();
  const dialog=document.querySelector('#help-dialog'); document.querySelector('#help-open').addEventListener('click',()=>dialog.showModal()); document.querySelector('#help-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();}); dialog.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>dialog.close()));
})();

// Floating shortcuts step aside while the appointment form is visible.
if ('IntersectionObserver' in window) {
  const bookingAction = document.querySelector('#appointment-form');
  const shortcuts = document.querySelectorAll('.floating-actions, .help-toggle');
  new IntersectionObserver(entries => {
    shortcuts.forEach(element => element.classList.toggle('booking-visible', entries[0].isIntersecting));
  }, { threshold: 0.1 }).observe(bookingAction);
}

