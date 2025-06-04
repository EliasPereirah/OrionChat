let chosen_platform = localStorage.getItem('chosen_platform');
let model = localStorage.getItem('selected_model');
let api_key = localStorage.getItem(`${chosen_platform}.api_key`)
let story = '';
let story_reasoning = '';
let endpoint = localStorage.getItem('endpoint');
let last_role = '';
let last_cnt = '';
let all_chunks = [];
let has_chunk_error = false;
let past_nuggets = localStorage.getItem('nuggets');
past_nuggets = past_nuggets ? JSON.parse(past_nuggets) : [];

let nugget_task = localStorage.getItem('nugget_task') || '';
let system_prompt = nugget_task;
let nugget_topic = localStorage.getItem('nugget_topic') || '';
let nugget_lang = localStorage.getItem('nugget_lang') || '';
let infoWarning = document.querySelector(".info_warning");
let remove_nugget = document.querySelector("#remove_nugget")
if (nugget_task) {
    infoWarning.innerHTML = `<p>The topic of your current lesson is: <span class="nu_topic">${nugget_topic}</span>. Setting a new lesson will remove the previous one.</p>`;
} else {
    remove_nugget.remove();
}


/**
 * add a message on the screen
 * - text: text to be added
 * - duration_seconds: optional - total duration in seconds
 * - add_class_name: optional - add a personalized class to add new style to dialog
 * - can_delete - If the user will be able to remove the dialog
 **/
function createDialog(text, duration_seconds = 0, add_class_name = '', can_delete = true) {
    let all_dialogs = document.getElementById("all_dialogs");
    let dialog_close = document.createElement('span');
    dialog_close.classList.add('dialog_close');
    let dialog = document.createElement('div');
    dialog.classList.add('dialog');
    if (add_class_name) {
        dialog.classList.add(add_class_name);
    }
    dialog.innerHTML = text;
    dialog.append(dialog_close);
    dialog.style.display = 'block';
    all_dialogs.append(dialog);
    if (can_delete) {
        dialog_close.classList.add('can_delete');
    }
    dialog_close.onclick = () => {
        dialog.remove();
    }

    if (duration_seconds) {
        let ms = duration_seconds * 1000;
        setTimeout(() => {
            dialog.remove();
        }, ms)
    }


}


function addWarning(msg, self_remove = true, add_class = '') {
    if (typeof (msg) != 'string') {
        msg = JSON.stringify(msg);
    }
    let duration = 0;
    if (self_remove) {
        duration = 7;
    }
    console.warn(msg)
    createDialog(msg, duration, add_class)
}


let settings = document.querySelector("#settings");
settings.onclick = () => {
    let conversations = document.querySelector(".conversations");
    conversations.style.display = 'block';
    localStorage.setItem("hide_conversations", '0');
}


let spans_topic = document.querySelectorAll("#nugget_task .user_topic")
let spans_lang = document.querySelectorAll("#nugget_task .user_lang");
let input_lang = document.querySelector("input#lang");
let input_topic = document.querySelector("input#topic");
let set_nugget = document.querySelector("#set_nugget");
input_lang.onkeyup = () => {
    spans_lang.forEach(lang_ele => {
        lang_ele.innerText = input_lang.value;
    })
}
input_topic.onkeyup = () => {
    spans_topic.forEach(topic_ele => {
        topic_ele.innerText = input_topic.value;
    })
}

set_nugget.onclick = () => {
    let topic = input_topic.value.trim();
    let lang = input_lang.value.trim();
    if (!topic || !lang) {
        addWarning('Please fill in both <b>topic</b> and <b>language</b>', false, 'custom_dialog');
        return false;
    }
    let nugget_task = document.querySelector("#nugget_task");
    nugget_task = nugget_task.innerText;
    system_prompt = nugget_task
    localStorage.setItem('nugget_task', nugget_task);
    localStorage.setItem('nugget_topic', topic);
    localStorage.setItem('nugget_lang', lang);
    past_nuggets = []; // remove old nuggets
    localStorage.setItem('last_nugget_day', '12/10/1948'); // Allows new nugget for today

    localStorage.setItem('nuggets', JSON.stringify(past_nuggets)); // remove old nuggets
    addWarning(`<p>There you go. You will learn something new every day about <span class="nu_topic">${topic}</span>
    whenever you visit OrionChat.</p><p><button onclick="goHome()">Go to home page</button></p>`, false, 'success_dialog');
}

remove_nugget.onclick = () => {
    // remove nuggets
    localStorage.setItem('nugget_task', '');
    localStorage.setItem('nugget_topic', '');
    localStorage.setItem('nugget_lang', '');
    past_nuggets = []; // remove old nuggets
    localStorage.setItem('nuggets', JSON.stringify(past_nuggets)); // remove old nuggets
    localStorage.setItem('last_nugget_day', '12/10/1948');
    addWarning(`<p>Nuggets about <span class="nu topic">${nugget_topic} successfully removed!</span></p>
      <p>You can create another one any time you want.</p>
      <p><button onclick="goHome()">Go to home page</button></p>`, false, 'custom_dialog');
}


function goHome() {
    window.location.href = "../";
}

function howNuggetsWork() {
    let explanation =
        `<p>Choose a topic of your interest and receive a personalized lesson on it daily.</p>
        <p>Each lesson is generated by your currently active AI model.</p>
         <p>For now, it is only possible to maintain one active topic at a time.</p>
         <p>Enjoy your daily learning and have fun!</p>`;
    addWarning(explanation, false)
}