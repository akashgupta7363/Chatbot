const textarea = document.querySelector('.chatbox_input');

textarea.addEventListener('input', function () {
  let line = textarea.value.split('\n').length;
  if (textarea.rows < 4 || line < 4) {
    textarea.rows = line;
  }
});

const chatboxForm = document.querySelector('.chatbox_message_form');
const today = new Date();
const chatboxMessageWrapper = document.querySelector('.chatbox_main');

chatboxForm.addEventListener('submit', function (e) {
  e.preventDefault();
  if (textarea.value === '') return;

  let message = `
    <div class="chatbox_item sent">
          <span class="item_text"
            >${textarea.value.trim().replace(/\n/g, '<br/>\n')}</span
          >
          <span class="item_time">${generateTime()}</span>
        </div>`;

  chatboxMessageWrapper.insertAdjacentHTML('beforeend', message);

  textarea.value = '';
  chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight);

  setTimeout(() => {
    chatboxMessageWrapper.insertAdjacentHTML(
      'beforeend',
      `<div class="chatbox_item received last">
          <span class="item_text"
            >Responding...</span>
          <span class="item_time">${generateTime()}</span>
        </div>`
    );
    chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight);
    getRespond();
    chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight);
  }, 700);
});
function getRespond() {
  const API_URL = 'https://api.openai.com/v1/chat/completions';
  const API_KEY = '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';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: textarea.value }],
      stream: true,
      max_tokens: 100,
      temperature: 0.8,
      top_p: 1,
      presence_penalty: 1,
    }),
  };

  fetch(API_URL, options)
    .then((res) => res.json())
    .then((data) => {
      const received = document.querySelector('.last');
      received.remove();
      chatboxMessageWrapper.insertAdjacentHTML(
        'beforeend',
        `<div class="chatbox_item received">
          <span class="item_text"
            > ${
              data.hasOwnProperty('choices')
                ? data.choices[0].message.content
                : data.error.code
            }</span>
          <span class="item_time">${generateTime()}</span>
        </div>`
      );
    })
    .catch((err) => {
      console.log(err);
      chatboxMessageWrapper.insertAdjacentHTML(
        'beforeend',
        `<div class="chatbox_item received">
          <span class="item_text"
            > Opps Something went wrong...</span>
          <span class="item_time">${generateTime()}</span>
        </div>`
      );
    });
}

function generateTime() {
  return `${addTime(new Date().getHours())}:${addTime(
    new Date().getMinutes()
  )}:${addTime(new Date().getSeconds())}`;
}
function addTime(num) {
  return num < 10 ? '0' + num : num;
}
