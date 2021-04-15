const init = () => {

  // Comprobamos si tenemos soporte en nuestro navegador
  if (!'speechSynthesis' in window) {
    showNotify({
      msn: 'Your browser not support tha Web Speech API',
      show: true,
      type: 'success'
    });
    return false; 
  }
  
  // Interface de la API
  let voice = new SpeechSynthesisUtterance();

  // Objeto de la API
  let jarvis = window.speechSynthesis;

  let disabledPlay = true;

  const store = window.localStorage.getItem('dataSave') || '';
  const text = document.querySelector('#text');
  const btnSave = document.querySelector('#btnSave');
  const btnLoad = document.querySelector('#btnLoad');
  const btnPlay = document.querySelector('#btnPlay');
  const renderText = document.querySelector('.conversation');
  const select = document.getElementById("voices");

  // Controlamos el botón para cargar datos del localstorage
  btnLoad[store ? 'removeAttribute' : 'setAttribute']('disabled', true);

  // Observamos la propiedad 'innerHTML' para observar los cambios que se producen
  const SET = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
  const handler = {
    set(value) {
      const hasConversation = Object.values(this.classList).includes('conversation') && disabledPlay;
      if (hasConversation) {
        btnPlay.removeAttribute('disabled');
        disabledPlay = false;
      }
      return SET.call(this, value);
    }
  };
  Object.defineProperty(Element.prototype, 'innerHTML', handler);

  text.addEventListener('keydown', function({ code }) {
    if (['Enter', 'NumpadEnter'].includes(code)) {
      const lastWord = this.value.split('\n');
      renderText.innerHTML += `<div>${this.value}</div>`;
      this.value = '';
      // Convertimos el texto a voz
      playVoice(lastWord[lastWord.length - 1]);
    }
  });

  btnSave.addEventListener('click', () => {
    showNotify({
      msn: 'The text has been saved success',
      show: true,
      type: 'success'
    });
    const dataSave = renderText.innerHTML;
    // Guardamos los datos en el localStorage
    storeData(dataSave);
  });

  btnLoad.addEventListener('click', () => {
    showNotify({
      msn: 'The text has been loaded success',
      show: true,
      type: 'success'
    });
    // Recuperamos los daots del localStorage
    const text = storeData('', false);
    renderText.innerHTML = text;
  });

  btnPlay.addEventListener('click', () => {
    // Reproducimos la voz
    pauseVoice();
    stopVoice();
    showNotify({
      msn: 'The text is playing',
      show: true,
      type: 'success'
    });
    playVoice(renderText.innerHTML);
  });

  const playVoice = text => {
    // Reproduce la voz
    voice.text = text;
    jarvis.speak(voice);
  };

  const stopVoice = () => {
    // Cancela la reproducción de la voz
    jarvis.cancel()
  };

  const pauseVoice = () => {
    // Pausa la reproducción de la voz
    jarvis.resume();
  }

  // Obtenemos todas las voces soportadas
  const getVoices = function() {
    const voices = jarvis.getVoices();
    voices.forEach(item => {
      const { name, lang } = item;
      const option = document.createElement('option');
      option.textContent = `${name} - [${lang}]`;
      option.setAttribute('data-language', lang);
      option.setAttribute('data-name', name);
      select.appendChild(option);
    });
    voice.lang = this.selectedOptions?.[0]?.dataset.language.split('-')[0] || 'es';
  };

  getVoices();
  jarvis.onvoiceschanged = getVoices;
  select.addEventListener('input', getVoices);

  // Función extra, no es necesario para el funcionamiento
  const storeData = (data = '', save = true) => {
    return window.localStorage[save ? 'setItem' : 'getItem']('dataSave', data);
  };
};

// Mostra una notificación
const showNotify = ({ msn = '', duration = 3000, show = false, type = '' }) => {
  if (show) {
    const notification = document.querySelector('.notification');
    const bgNotification = ['info', 'warning', 'success'].includes(type) ? type : 'info';
    notification.innerHTML = msn;
    notification.classList.add('show', bgNotification);
    setTimeout(() => {
      notification.classList.remove('show');
    }, duration);
  }
};

document.addEventListener('DOMContentLoaded', init);