let can_delete_history = false;
let max_chats_history = 512;
let save_history = true;
let chosen_platform = localStorage.getItem('chosen_platform');
let model = localStorage.getItem('selected_model');
let is_mobile = window.matchMedia("(max-width: 768px)").matches;
let api_key = localStorage.getItem(`${chosen_platform}.api_key`)
let file_search_store_id = localStorage.getItem("file_search_store_id");
let base64String = '';
let mimeType = '';
let story = '';
let story_reasoning = '';
let endpoint = localStorage.getItem('endpoint');
let last_role = '';
let last_cnt = '';
let last_user_input = '';
let last_auto_yt_fn_call = 0;
let is_chat_enabled = true;
let SITE_TITLE = "OrionChat";
let js_code = '';
let js_code_exec_finished = true;
let js_code_exec_output = '';
let original_code = '';
let pre_function_text = '';
let all_chunks = [];
let has_chunk_error = false;
let grounding_rendered_cnt = '';
let dispatcher = 'user';
// Markdown to HTML
showdown.setFlavor('github');
showdown.setOption('ghMentions', false); // if true "@something" became github.com/something
showdown.setOption("openLinksInNewWindow", true);
let converter = new showdown.Converter();

let PLATFORM_DATA = {
    openai: {
        models: [
            "gpt-4.1",
            "gpt-4.1-mini",
            "gpt-4.1-nano",
        ],
        name: "OpenAI",
        endpoint: "https://api.openai.com/v1/chat/completions"
    },
    groq: {
        models: [
            "moonshotai/kimi-k2-instruct-0905",
            "openai/gpt-oss-120b"
        ],
        name: "Groq",
        endpoint: "https://api.groq.com/openai/v1/chat/completions"
    },
    google: {
        models: [
            "gemini-2.5-pro",
            "gemini-flash-latest",
            "gemini-2.0-flash-preview-image-generation"

        ],
        name: "Google",
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/{{model}}:{{gen_mode}}?key={{api_key}}'
    },
    cerebras: {
        models: [
            "qwen-3-235b-a22b-instruct-2507"
        ],
        name: "Cerebras",
        endpoint: "https://api.cerebras.ai/v1/chat/completions"
    },
    anthropic: {
        models: [
            "claude-opus-4-1-20250805",
            "claude-3-7-sonnet-20250219",
            "claude-3-5-haiku-20241022",
        ],
        name: "Anthropic",
        endpoint: "https://api.anthropic.com/v1/messages"
    },
    deepseek: {
        models: [
            "deepseek-reasoner",
            "deepseek-chat"
        ],
        name: "DeepSeek",
        endpoint: "https://api.deepseek.com/chat/completions"
    },
    cohere: {
        models: [
            "command-a-03-2025"
        ],
        name: "Cohere",
        endpoint: "https://api.cohere.com/v2/chat"
    },
    openrouter: {
        models: [
            "openai/gpt-5"
        ],
        name: "OpenRouter",
        endpoint: "https://openrouter.ai/api/v1/chat/completions"
    },
   /**
    sambanova: {
    models: [
    "DeepSeek-V3-0324",
    "Qwen2.5-Coder-32B-Instruct",
    "Meta-Llama-3.1-405B-Instruct",
    "Llama-3.2-90B-Vision-Instruct"
    ],
    needProxy: true,
    name: "SambaNova",
    endpoint: "https://api.sambanova.ai/v1/chat/completions"

    },
    **/
    hyperbolic: {
        models: [
            "deepseek-ai/DeepSeek-V3-0324"
        ],
        name: "Hyperbolic",
        endpoint: "https://api.hyperbolic.xyz/v1/chat/completions"
    },
    xai: {
        models: [
            "grok-4-latest"
        ],
        name: "xAI",
        endpoint: "https://api.x.ai/v1/chat/completions"
    },

    together: {
        models: [
            "deepseek-ai/DeepSeek-V3.1",
            "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
        ],
        name: "Together AI",
        endpoint: "https://api.together.xyz/v1/chat/completions"
    },
    deepinfra: {
        models: [
            "zai-org/GLM-4.5"
        ],
        name: "Deep Infra",
        endpoint: "https://api.deepinfra.com/v1/openai/chat/completions"
    },
    ollama: {
        models: [],
        name: "Ollama",
        get_models_endpoint: "http://localhost:11434/v1/models",
        endpoint: "http://localhost:11434/v1/chat/completions"
    }
}

const language_extension = {
    "python": "py",
    "markdown": "md",
    "javascript": "js",
    "js": "js",
    "java": "java",
    "c": "c",
    "cpp": "cpp",
    "csharp": "cs",
    "ruby": "rb",
    "go": "go",
    "swift": "swift",
    "kotlin": "kt",
    "php": "php",
    "typescript": "ts",
    "rust": "rs",
    "dart": "dart",
    "scala": "scala",
    "perl": "pl",
    "r": "r",
    "shell": "sh",
    "haskell": "hs",
    "lua": "lua",
    "objectivec": "m",
    "matlab": "m",
    "sql": "sql",
    "html": "html",
    "css": "css",
    "json": "json",
    "xml": "xml",
    "yaml": "yaml",
    "txt": "txt"
}


let settings = document.querySelector("#settings");
settings.onclick = () => {
    let conversations = document.querySelector(".conversations");
    conversations.style.display = 'block';
    localStorage.setItem("hide_conversations", '0');
    let hasTopic = document.querySelector(".conversations .topic");
    if (!hasTopic) {
        let ele = document.createElement('div');
        ele.innerText = 'No history';
        ele.classList.add('no_history')
        conversations.append(ele)
        setTimeout(() => {
            ele.remove();
            conversations.style.display = 'none';
        }, 3000);
    }
}


let options = document.querySelector("#open_options");
options.onclick = () => {
    let cvns = document.querySelector('.conversations');
    if (cvns && is_mobile) {
        cvns.style.display = 'none'; // if open will be closed on mobile
    }

    setOptions();
}


let new_chat = document.querySelector("#new_chat");
new_chat.addEventListener('click', () => {
    newChat(); // start new chat
})

jsClose = document.querySelector(".jsClose");
jsClose.onclick = () => {
    document.querySelector('.conversations').style.display = 'none';
    localStorage.setItem("hide_conversations", '1');
}


setTimeout(() => {
    let chatMessages = document.querySelector("#chat-messages");
    chatMessages.scroll(0, 9559999);
}, 1000);


let conversations = {
    'messages': []
};


function removeAttachment() {
    let has_att = document.querySelector(".has_attachment");
    if (has_att) {
        has_att.classList.remove('has_attachment');
    }
}

/**
 * Remove command prefix that may be at the beginning of a string/prompt
 **/
function stripCommand(text){
    // for example: if the text is "translate:pt-br love" it will remove the "translate:pt-br" command
    let rx = "^"+Object.keys(special_prompts).join(":(.*?)\\s|^")+":"
    return text.replace(new RegExp(rx), '').trim();
}


function addConversation(role, content, add_to_document = true, do_scroll = true, reasoning_content = '') {

    let clen_content = content;
    closeDialogs();
    removeAttachment();
    if (!clen_content.trim()) {
        addWarning('Empty conversation', true);
        return false;
    }
    let new_talk = {'role': role, 'content': clen_content};
    if (reasoning_content) {
        new_talk.reasoning_content = reasoning_content;
        reasoning_content = `<details><summary>See Reasoning</summary> ${reasoning_content}</details>`;
        //story_reasoning = ''; // reset
    }
    conversations.messages.push(new_talk);
    //chat_textarea.focus();
    let full_content = `${reasoning_content} ${clen_content}`.trim();
    let cnt;
    let div = document.createElement('div');
    div.classList.add('message');
    if (role === 'user') {
        div.classList.add('user');
        cnt = converter.makeHtml(full_content);
        div.innerHTML = cnt;
        if (base64String) {
            let media = mimeType.split("/")[0];
            if (media === 'image') {
                let imgEle = document.createElement('img');
                imgEle.src = base64String;
                div.prepend(imgEle);
                imgEle.className = 'appended_pic';
            } else if (media === 'audio') {
                let audioEle = document.createElement('audio');
                audioEle.src = base64String;
                audioEle.controls = true;
                div.prepend(audioEle);
                audioEle.className = 'appended_audio';
            } else if (media === 'video') {
                let videoEle = document.createElement('video');
                videoEle.src = base64String;
                videoEle.controls = true;
                div.prepend(videoEle);
                videoEle.className = 'appended_video';
            }

        }

    } else {
        if (add_to_document) {
            div.classList.add('bot');

            cnt = converter.makeHtml(full_content);
            div.innerHTML = cnt;
            genAudio(clen_content, div);

        } else {
            let lastBot = document.querySelectorAll(".bot")[document.querySelectorAll(".bot").length - 1];
            genAudio(clen_content, lastBot);
        }

    }
    document.querySelector('#chat-messages').append(div);
    mediaFull();
    if (do_scroll) {
        div.scrollIntoView();

    }
    saveLocalHistory();
}


function saveLocalHistory() {
    if(save_history){
        try {
            localStorage.setItem(chat_id.toString(), JSON.stringify(conversations));
        }catch (e) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'){
                addWarning('Your browser has reached the maximum number of items allowed for local storage. Please clear out some old chats to free up space.', false);
            }
        }
    }
    save_history = true;
   loadOldChatTopics();
}

function getPreviousChatTopic() {
    let all_topics = [];
    // get all ids
    let ids = [];
    let total_chats = 0;
    for (let i = 0; i < localStorage.length; i++) {
        let id = localStorage.key(i);
        id = parseInt(id);
        if (!isNaN(id)) {
            // important to the correct order
            ids.push(id);
        }
    }
    ids.sort((a, b) => b - a);  // descendent order
    let all_keys = [];

    ids.forEach(key => {
        if (total_chats >= max_chats_history) {
            // If it has to many messages remove the old ones
            localStorage.removeItem(key.toString());
        } else {
            all_keys.push(key);
        }
        total_chats++;
    })

    let tmp_div = document.createElement('div');

    all_keys.forEach(id => {
        try {
            let topic = JSON.parse(localStorage.getItem(id))?.messages?.[0]?.content ?? '';
            tmp_div.innerHTML = topic;
            tmp_div.querySelector("details")?.remove();
            tmp_div.querySelector("img")?.remove();
            tmp_div.querySelector("video")?.remove();
            tmp_div.querySelector("audio")?.remove();
            tmp_div.querySelector("iframe")?.remove();
            topic = tmp_div.innerText.trim();
            let last_interaction = JSON.parse(localStorage.getItem(id))?.last_interact ?? id;
            if (topic ==='') {
               topic = '...';
            }
            all_topics.push({'topic': topic, 'id': id, 'last_interaction': last_interaction});
        } catch (error) {
            console.error('Error parser to JSON: ' + error)
        }
    });
    return all_topics;
}

// force=true will ignore can_delete_history
function removeChat(div, id, force = false) {
    if (can_delete_history || force) {
        let the_chat = JSON.parse(localStorage.getItem(id));
        if (div.classList.contains('confirm_deletion')) {
            localStorage.removeItem(id);
        } else {
            let tot_msgs = the_chat.messages.length;
            div.classList.add('confirm_deletion');
            if (tot_msgs < 19) {
                localStorage.removeItem(id);
            } else {
                let old_delete_warning = document.querySelector(".del_caution");
                if (old_delete_warning) {
                    old_delete_warning.remove();
                }
                let alert_msg =
                    `<p>Are you sure you want to delete?</p>
                    <p>This conversation has ${tot_msgs} messages.</p>
                    <p>If yes, click again to delete.</p>`;
                addWarning(alert_msg, false)
                div.classList.add('del_caution')
                return false;
            }
        }
        document.querySelectorAll(".del_caution").forEach((dc => {
            dc.classList.remove('del_caution');
        }))

        document.querySelectorAll(".confirm_deletion").forEach((cd => {
            cd.classList.remove('confirm_deletion');
        }))


        localStorage.removeItem(id);
        let ele = document.createElement('div');
        let content = document.querySelector(".container");
        ele.classList.add('chat_deleted_msg');
        if (id === chat_id) {
            // current chat - so clean the screen
            let all_user_msg = document.querySelectorAll("#chat-messages .message.user");
            let all_bot_msg = document.querySelectorAll("#chat-messages .message.bot");
            if (all_user_msg) {
                all_user_msg.forEach(um => {
                    um.remove();
                })
            }
            if (all_bot_msg) {
                all_bot_msg.forEach(bm => {
                    bm.remove();
                })
            }
            ele.innerText = "Current chat deleted!";
            content.prepend(ele);
            conversations.messages = []; // clean old conversation
            chat_id = new Date().getTime(); // generate a new chat_id

        } else {
            content.prepend(ele);
            ele.innerText = "Chat deleted!";
        }
        setTimeout(() => {
            ele.remove();
        }, 2000);
        div.remove();
    } else {
        //div.id will be id of chat (key de localStorage)
        // loadOldConversation(div.id); // update conversation
    }
}

/**
 * Starts a new chat without any context from past conversation
 **/
function newChat() {
    //toggleAnimation(true);


    is_chat_enabled = true;
    toggleAiGenAnimation(false);
    closeDialogs();
    document.title = SITE_TITLE;
    chat_id = new Date().getTime(); // generate a new chat_id
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    new_url += "#" + chat_id;
    history.pushState({url: new_url}, '', new_url);
    removeScreenConversation();
    conversations.messages = []; // clean old conversation


}

function removeScreenConversation() {
    let chatMessages = document.querySelector("#chat-messages")
    //remove old message on screen
    chatMessages.querySelectorAll(".message.user").forEach(userMsg => {
        userMsg.remove();
    })
    chatMessages.querySelectorAll(".message.bot").forEach(botMsg => {
        botMsg.remove();
    })
}


function loadOldConversation(old_talk_id) {
    chat_id = old_talk_id;
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    new_url += "#" + old_talk_id;
    history.pushState({url: new_url}, '', new_url);

    let past_talk = localStorage.getItem(old_talk_id); // grab the old conversation

    localStorage.removeItem(old_talk_id); // remove old conversation from localstorage
    //chat_id = new Date().getTime(); // renew ID
    let last_interaction_id = new Date().getTime();

    //let btn_star_old_chat = document.querySelector("[data-id='" + old_talk_id + "']");
    let btn_star_old_chat = document.querySelector("[data-id='" + old_talk_id + "']");

    //btn_star_old_chat.setAttribute("data-id", chat_id);
    btn_star_old_chat.setAttribute("data-last-interaction", last_interaction_id.toString());
    document.title = btn_star_old_chat.innerText;


    let chatMessages = document.querySelector("#chat-messages");
    if (past_talk) {
        let messages = JSON.parse(past_talk).messages;
        conversations.messages = messages;
        conversations.last_interact = last_interaction_id;
        localStorage.setItem(old_talk_id.toString(), JSON.stringify(conversations));

        removeScreenConversation();
        messages.forEach(msg => {
            let div_talk = document.createElement('div');
            div_talk.classList.add('message');
            if (msg.role === 'user') {
                div_talk.classList.add('user');
                div_talk.innerHTML = converter.makeHtml(msg.content);
            } else {
                div_talk.classList.add('bot');
                let full_content = msg.content;
                if (msg.reasoning_content) {
                    full_content = `<details><summary>See Reasoning</summary>${msg.reasoning_content}</details>${msg.content}`;
                }
                div_talk.innerHTML = converter.makeHtml(full_content);
            }
            chatMessages.append(div_talk);

        });


    } else {
        let topic_with_no_chat = document.querySelector(".topic[data-id='" + chat_id + "']");
        if (topic_with_no_chat) {
            topic_with_no_chat.remove();
        }
        createDialog('Conversation not found!', 10)
    }
    hljs.highlightAll();
    setTimeout(() => {
        enableCopyForCode();
    }, 500)

}


function loadOldChatTopics() {
    let all_topics = getPreviousChatTopic();
    let history = document.querySelector(".conversations .history");
    let to_remove = history.querySelectorAll(".topic");
    // remove to add again updating with the current chat
    to_remove.forEach(ele => {
        ele.remove();
    })
    for (let i = 0; i < all_topics.length; i++) {
        let prev = all_topics[i];
        let div = document.createElement('div');
        let divWrap = document.createElement('div');
        div.classList.add('topic');
        div.classList.add('truncate');
        if (can_delete_history) {
            div.classList.add('deletable')
        }
        div.textContent = prev.topic.substring(0, 50);
        div.title = prev.topic.substring(0, 90);

        div.setAttribute('data-id', prev.id)
        div.setAttribute('data-last-interaction', prev.last_interaction)
        div.addEventListener('click', () => {
            let the_id = div.getAttribute('data-id');
            if (can_delete_history) {
                removeChat(div, the_id);
            } else {
                let all_active_topic = document.querySelectorAll(".active_topic");
                all_active_topic.forEach(t => {
                    t.classList.remove('active_topic');
                })
                div.classList.add('active_topic')
                loadOldConversation(the_id)
            }
        })
        divWrap.append(div);
        history.append(divWrap);
    }
}

loadOldChatTopics();

function getSystemPrompt() {
    let system_prompt = localStorage.getItem('system_prompt');
    if (!system_prompt) {
        return system_prompt;
    }
    let today = whatTimeIsIt();
    system_prompt = system_prompt.replaceAll("{{date}}", today);
    system_prompt = system_prompt.replaceAll("{{lang}}", navigator.language)
    return system_prompt;
}


function toggleAiGenAnimation(do_animate = 'toggle') {
    //return ''; // remove
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (do_animate === 'toggle') {
        let has_old = document.querySelector(".thinking-container");
        do_animate = !has_old;
    }
    if (do_animate === true && ele) {
        if (ele.classList.contains('user')) {
            let ai_gen_animation = document.createElement('div');
            ai_gen_animation.innerHTML =
                `<div class="ai-avatar">AI</div>
                 <div class="ai_dots-container">
                   <div class="dot_ai"></div>
                   <div class="dot_ai"></div>
                   <div class="dot_ai"></div>
                 </div>`;
            ai_gen_animation.classList.add('thinking-container');
            ele.insertAdjacentElement('afterend', ai_gen_animation)
            ai_gen_animation.scrollIntoView();
        }
    } else if (do_animate === false) {
        let thinking_container = document.querySelector(".thinking-container");
        if (thinking_container) {
            thinking_container.remove();
        }
    }
}

/**
 * checks if there is an url in a given text, if so it returns the url, otherwise it returns false
 **/
function hasURL(text) {
    let match_url = text.match(/https?:\/\/\S+/g);
    if (match_url) {
        return match_url[0];
    }
    return false;

}

function isYouTubeURL(url) {
    return url.includes("youtube.com") || url.includes("youtu.be");
}


async function changeUserInputIfNeeded() {
    last_user_input = conversations.messages[conversations.messages.length - 1].content;

    let url = hasURL(last_user_input);
    let use_rag = localStorage.getItem('use_rag_endpoint');

    if (url && !isYouTubeURL(url) && last_user_input.length < 500) {
        if(use_rag !== 'yes'){
            console.log('rag is not enabled')
            return false;
        }
        try {
            let data = await retrieveContentFromUrl(url);
            if (data?.text) {
                let new_input = `<details><summary><b>URL</b>: ${url}</summary><br><b>Content</b>: ${data.text}</details> ${last_user_input}`;
                conversations.messages[conversations.messages.length - 1].content = new_input;
                const ui_user_messages = document.querySelectorAll('.message.user');
                const last_user_message = ui_user_messages[ui_user_messages.length - 1];
                if (last_user_message) {
                    last_user_message.innerHTML = new_input;
                }
            } else {
                addWarning("Unable to get content from shared URL: " + url)
            }
        } catch {
            addWarning("error while trying to get content from shared URL: " + url);
        }
    }


}


function chat() {
    toggleAiGenAnimation(true);
    changeUserInputIfNeeded().then(() => {
        if (chosen_platform === 'google') {
            return geminiChat();
        }
        return streamChat();
    })

}


/**
 * Remove the last message in the chat
 * if from_user = true will remove just messages from the user
 **/
function removeLastMessage(from_user = true) {
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (ele) {
        if (!ele.classList.contains('user') && from_user) {
            return false;
        }
        document.querySelector(".chat-input textarea").value = ele.innerText;
        toggleBtnOptions();
        conversations.messages.pop();
        if (conversations.messages.length) {
            localStorage.setItem(chat_id.toString(), JSON.stringify(conversations));
        } else {
            localStorage.removeItem(chat_id.toString());
        }
        ele.remove();
    }
}

let chatButton = document.querySelector("#send");
let chat_textarea = document.querySelector(".chat-input textarea");
let voice_rec = document.getElementById('voice_rec');
let wrap_rec_and_up = document.querySelector(".wrap_rec_and_up");

function toggleBtnOptions() {
    // when not fired by addEventListener
    if (chat_textarea.value.trim().length) {
        chatButton.classList.remove('ds_none');
        voice_rec.classList.add('ds_none');
    } else {
        voice_rec.classList.remove('ds_none');
        chatButton.classList.add('ds_none');
    }
    // when fired by addEventListener
    chat_textarea.addEventListener('input', () => {
        if (chat_textarea.value.trim().length) {
            chatButton.classList.remove('ds_none');
            voice_rec.classList.add('ds_none');
        } else {
            voice_rec.classList.remove('ds_none');
            chatButton.classList.add('ds_none');
        }
    })
}

toggleBtnOptions();
voice_rec.addEventListener('click', () => {
    chatButton.classList.remove('ds_none');
    voice_rec.classList.add('ds_none');
    recordVoice();
})


function startChat() {

    document.querySelector(".message.user img")?.remove();
    document.querySelector(".message.user video")?.remove();
    document.querySelector(".message.user audio")?.remove();

    stopRecorder();
    if (!is_chat_enabled) {
        //addWarning('Chat is busy. Please wait!');
        return false;
    }
    let input_text = chat_textarea.value;
    if (input_text.trim().length > 0) {
        //toggleAnimation();
        toggleAiGenAnimation();
        chat_textarea.value = '';
        toggleBtnOptions();
        disableChat()
        addConversation('user', input_text);
        chat();
    }
}

chatButton.onclick = () => {
    startChat();
}


let base_textarea_height = 70;
chat_textarea.onkeyup = (event) => {
    let total_lines = chat_textarea.value.match(/\n/g)?.length ?? 0;
        let new_pxl = total_lines * 10;
        if(new_pxl > 70){
            new_pxl = 70
        }
        let new_textarea_height = base_textarea_height + new_pxl;
        chat_textarea.style.height = `${new_textarea_height}px`;
        wrap_rec_and_up.style.height = `${new_textarea_height}px`;
    if (event.key === 'Enter' && !event.shiftKey) {
        chat_textarea.style.height = `${base_textarea_height}px`;
        wrap_rec_and_up.style.height = `${base_textarea_height}px`;
        startChat();
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


function disableChat() {
    is_chat_enabled = false;
}

function enableChat() {
    is_chat_enabled = true;
}

function toggleAnimation(force_off = false) {
    let loading = document.querySelector("#loading")
    if (loading.style.display === 'inline-flex') {
        loading.style.display = 'none';
    } else {
        loading.style.display = 'inline-flex';
    }
    if (force_off) {
        loading.style.display = 'none';
    }
}


let can_delete = document.querySelector("#can_delete");
if (can_delete != null) {
    can_delete.addEventListener('change', (event) => {
        if (event.target.checked) {
            can_delete_history = true;
            let all_topics = document.querySelectorAll(".conversations .topic");
            all_topics.forEach(topic => {
                topic.classList.add('deletable');
            })
        } else {
            can_delete_history = false;
            let all_topics = document.querySelectorAll(".conversations .topic");
            all_topics.forEach(topic => {
                topic.classList.remove('deletable');
            })
        }
    });
}

function closeDialogs() {
    let dialog_close = document.querySelectorAll(".dialog_close");
    if (dialog_close) {
        dialog_close.forEach(dc => {
            if (dc.classList.contains('can_delete')) {
                dc.click();
            }
        })
    }

}


function enableCopyForCode(enable_down_too = true) {

    document.querySelectorAll('pre code').forEach(block => {
        let block_group = block.previousElementSibling;

        let has_copy_btn = false;
        if (block_group) {
            has_copy_btn = block_group.querySelector(".copy-btn");
        }
        if (!has_copy_btn) {   // to not be added more the one time
            const button = document.createElement('button');
            const div_ele = document.createElement('div');
            div_ele.className = 'btn-group';
            button.className = 'copy-btn';
            button.innerText = 'Copy';
            button.title = "Copy code";
            const btn_down = button.cloneNode(false);
            const btn_preview = button.cloneNode(false);
            btn_down.className = 'down-btn';
            btn_down.innerText = 'Down';
            btn_down.title = "Download code";

            btn_preview.className = 'preview-btn';
            btn_preview.innerText = 'Preview';
            btn_preview.title = "Preview code";
            div_ele.append(button);
            if(block.classList.contains('html')) {
                btn_preview.setAttribute('onclick', "savePreviewCode(event)");
                div_ele.append(btn_preview)
            }
            if (enable_down_too) {
                div_ele.append(btn_down);
            }
            let pre = block.parentElement;
            pre.classList.add('code_header');
            let code_lines_length = block.innerText.split("\n").length


            // if code have more then x lines, button will be on the top too
            const div_ele_bottom = div_ele.cloneNode(true);
            div_ele_bottom.classList.add('btn-group');
            div_ele_bottom.classList.add('btn-group-top');
            pre.prepend(div_ele_bottom);
            let btn_bottom = div_ele_bottom.querySelector(".copy-btn");
            addEventClickToDownAndCopyBtn(btn_bottom, block);

            if (code_lines_length > 22) {
                pre.append(div_ele);
                addEventClickToDownAndCopyBtn(button, block);

            }



        }
    });

    if (enable_down_too) {
        enableCodeDownload();
    }
    enableFullTextCopy();
}

function addEventClickToDownAndCopyBtn(button, block) {
    button.addEventListener('click', () => {
        const codeText = block.innerText.replace('Copy', '');
        navigator.clipboard.writeText(codeText)
            .then(() => {
                button.innerText = 'Copied!';
                setTimeout(() => button.innerText = 'Copy', 2000);
            })
            .catch(err => console.error('Error:', err));
    });
}


function enableFullTextCopy() {
    document.querySelectorAll('.chat .bot').forEach(div => {
        let div_copy = document.createElement('div');
        div_copy.innerHTML = div.innerHTML;
        let btn_groups = div_copy.querySelectorAll(".btn-group");
        btn_groups.forEach(btn => {
            // So that it is not copied along with the text
            btn.remove();
        })

        let all_ele = div_copy.querySelectorAll("*");
        all_ele.forEach(element => {
            element.removeAttribute('id');
        })

        let play_audio_btn = div_copy.querySelector(".play_audio_btn");
        if (play_audio_btn) {
            // So that it is not copied along with the text
            play_audio_btn.remove();
        }

        let has_copy_btn = div.classList.contains('has_full_text_copy_btn')
        if (!has_copy_btn) {   // to not be added more the one time
            const button = document.createElement('button');
            const btn_info = document.createElement('button');
            const btn_edit = document.createElement('button');
            const ele = document.createElement('div');
            ele.className = 'btn-ft-group';
            button.className = 'copy-btn';
            btn_info.className = 'see_info';
            btn_edit.className = 'btn-edit';
            button.innerText = 'Copy text';
            btn_info.innerText = 'Info';
            btn_edit.innerText = 'Edit';
            btn_info.onclick = () => {
                showInfo();
            }
            btn_edit.onclick = ()=>{
                window.open('experiments/chat_editing?chat_id='+chat_id,'_blank');

            }
            ele.append(button);
            ele.append(btn_info)
            ele.append(btn_edit)
            div.append(ele);
            button.addEventListener('click', () => {
                //const full_text = div_copy.innerHTML;
                const full_text = div_copy.innerText;
                navigator.clipboard.writeText(full_text)
                    .then(() => {
                        button.innerText = 'Copied!';
                        setTimeout(() => button.innerText = 'Copy text', 2000);
                    })
                    .catch(err => console.error('Error:', err));
            });
            div.classList.add('has_full_text_copy_btn');
        }
    });

}

function ucFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showInfo() {
    closeDialogs();
    let active_platform = ucFirst(chosen_platform);
    addWarning(`Active model: ${model} from ${active_platform}`, true);
}

function enableCodeDownload() {
    let downloadCodeBtn = document.querySelectorAll(".down-btn");
    if (downloadCodeBtn) {
        downloadCodeBtn.forEach(btn => {
            btn.addEventListener("click", function () {
                const code = btn.parentElement.parentElement.querySelector("code");
                let lang_name = code.classList[0] ?? 'txt';
                if (lang_name === "hljs") {
                    lang_name = code.classList[1]?.split("-")[1] ?? 'txt';
                }
                let extension = language_extension[lang_name] ?? 'txt';
                let ai_full_text = btn.parentElement.parentElement.parentElement.innerHTML;
                let file_name = ai_full_text.match(new RegExp(`([a-zA-Z0-9_-]+\\.${extension})`, 'g'));
                let more_than_one = btn.parentElement.parentElement.parentElement.querySelectorAll("." + lang_name);
                // more_then_one = more than one code with the same extension
                if (file_name) {
                    file_name = file_name[0];
                    if (more_than_one.length >= 2) {
                        file_name = 'file.' + extension;
                        // can't determine precisely the file name(because have two or more),
                        // so file_name will be default to file.ext
                    }
                } else {
                    file_name = 'file.' + extension;
                }


                let code_text = code.innerText;
                const blob = new Blob([code_text]);
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = file_name;
                a.click();
                URL.revokeObjectURL(url);
            });
        })
    }
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

function geminiChat(fileUri = '', with_stream = true, the_data = '') {
    let gemini_model = model;
    let all_parts = [];
    let system_prompt = getSystemPrompt();
    addFileToPrompt();
    conversations.messages.forEach(part => {
        let role = part.role === 'assistant' ? 'model' : part.role;
        part.content = part.content.replace(/<img[^>]*>/g, ' '); // remove attached images
        all_parts.push({
            "role": role,
            "parts": [
                {
                    "text": part.content
                }
            ]
        });
    })

    if (base64String) {
        geminiUploadImage().then(response => {
            console.log('uploading')
            return response;
        }).then(fileUri => {
            base64String = '';
            geminiChat(fileUri)
        })
        return false;
    }

    if (fileUri) {
        all_parts[(all_parts.length - 1)].parts.push({
            "file_data":
                {
                    "mime_type": mimeType,
                    "file_uri": fileUri
                }
        })
    }
    mimeType = '';
    let data = {
        "contents": [all_parts]
    };

    if (system_prompt) {
        data.systemInstruction = {
            "role": "user",
            "parts": [
                {
                    "text": system_prompt
                }
            ]
        };
    }

    last_user_input = conversations.messages[conversations.messages.length - 1].content;
    let allow_tool_use = true;
    if(dispatcher !== 'user'){
        allow_tool_use = false;
        dispatcher = 'user';
        last_user_input = '';
    }
    let cmd = commandManager(last_user_input)
    if (cmd) {
        let last_part = data.contents[0].pop();
        last_part.parts[0].text = cmd;
        data.contents[0].push(last_part);
    }

    data.safetySettings = [
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ];


    data.generationConfig = {
        // "temperature": 1,
        // "topK": 40,
        // "topP": 0.95,
        // "maxOutputTokens": 8192,
    };


    let pog = whichTool(last_user_input);
    if(pog === 'dt'){
        data.generationConfig.thinkingConfig =  { thinkingBudget: 8000 };
    }
    if(pog === 'pic' || pog === 'imagine'){
        save_history = false;
        console.log('image generation command activated');
        gemini_model = "gemini-2.0-flash-preview-image-generation";
    }

    if(gemini_model.includes("image")){
        with_stream = false;
        if(data.systemInstruction){
            delete data.systemInstruction;
        }
        data.generationConfig.responseModalities = ["IMAGE", "TEXT"];
    }

    if (the_data) {
        data = the_data;
    }

    if (needToolUse(last_user_input)) {
        let tool_name = whichTool(last_user_input);
        let tool_compatibility = `google_compatible`;
        let the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
        if (the_tool) {
            with_stream = false; // in this case for tool use we will not use stream mode
            data.tools = [the_tool];
            data.toolConfig = {
                "functionCallingConfig": {
                    "mode": "ANY"
                }
            };
        }
    }

    if (!data.tools) {
        if (last_user_input.match(/^py:|^python:/i)) {
            // code execution command
            data.tools = [{'code_execution': {}}];
        }
        if (last_user_input.match(/^g:/i)) {
            // Grounding with Google Search
            data.tools = [{'google_search': {}}];
        }

        conversations.messages.forEach(cnv=>{
            if(cnv.role === "user" && cnv.content.match(/^fs:/i)){
                if(file_search_store_id){
                    with_stream = false;
                    data.tools =  [{'file_search' : { file_search_store_names: file_search_store_id}}];
                }else {
                    addWarning("File Search is not configured!", false)
                }
            }
        })


    }


    if (with_stream) {
        return geminiStreamChat(fileUri, data, allow_tool_use);
    }

    let gemini_endpoint = endpoint.replaceAll("{{model}}", gemini_model);
    gemini_endpoint = gemini_endpoint.replaceAll("{{api_key}}", api_key);
    gemini_endpoint = gemini_endpoint.replaceAll("{{gen_mode}}", "generateContent");

    let invalid_key = false;
    fetch(gemini_endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            let text = '';
            let inlineData = '';
            if (typeof data === "object") {
                try {
                    text = data.candidates[0].content.parts[0]?.text ?? '';
                    inlineData = data.candidates[0].content.parts[0]?.inlineData ?? '';
                    if(!inlineData){
                        inlineData = data.candidates[0].content.parts[1]?.inlineData ?? '';
                    }
                    if(inlineData){
                            inlineData = `<img class="img_output" src="data:${inlineData.mimeType};base64,${inlineData.data}" alt="">`
                    }
                    text += `${inlineData}`;
                    let g_tool = data.candidates[0].content.parts[0]?.functionCall ?? '';
                    if (g_tool === '') {
                        g_tool = data.candidates[0].content.parts[1]?.functionCall ?? '';
                    }
                    if (g_tool) {
                        pre_function_text = text;
                        toolHandle(g_tool);
                    }
                    if (!text && !g_tool) {
                        addWarning('Error: Unexpected response', true, 'fail_dialog')
                    }

                    let finished_reason = data.candidates[0].finishReason ?? '';
                    if (finished_reason && finished_reason !== 'STOP') {
                        setTimeout(() => {
                            addWarning('finishReason: ' + finished_reason, false, 'fail_dialog')
                        }, 500)
                    }

                } catch {
                    text += '<pre>' + JSON.stringify(data) + '</pre>';
                    console.log('Error')
                    try {
                        // Verify if it is an error with the api key being not valid
                        let tt = data.error.message;
                        if (tt.match(/API key not valid/)) {
                            invalid_key = true;
                        }
                    } catch {
                        console.error('Ops error, no: data.error.message')
                    }
                    removeLastMessage()
                }
            } else {
                text = data;
            }
            if (text !== '') {
                addConversation('assistant', text);
            }

        })
        .catch(error => {
            addWarning('Error: ' + error, false);
            removeLastMessage();
        }).finally(() => {
        //toggleAnimation(true);
        toggleAiGenAnimation(false);
        enableChat();
        if (invalid_key) {
            setApiKeyDialog();
        }
        hljs.highlightAll();
        enableCopyForCode();

    })


}


function setApiKey() {
    let set_api_key = document.querySelector('#set_api_key');
    if (set_api_key) {
        api_key = set_api_key.value.trim();
        if (api_key.length > 10) {
            localStorage.setItem(`${chosen_platform}.api_key`, api_key)
            closeDialogs();
            createDialog('Saved with success!', 4);
        }
    }
}


function setApiKeyDialog() {
    let platform_name = PLATFORM_DATA[chosen_platform].name;
    let cnt =
        `<div>Enter your API key for <strong>${platform_name}</strong>!</div>
         <input id="set_api_key" type="text" name="api_key" placeholder="Your API key">
         <button onclick="setApiKey()">Save</button>
         <div>
         <p>Your API key will be saved in localStorage.</p>
         </div>`;
    createDialog(cnt, 0, 'setApiDialog');
}


function ragEndpointDialog() {
    let use_rag = localStorage.getItem('use_rag_endpoint');
    let disable_advanced_rag = '';
    if (use_rag === 'yes' || use_rag == null) {
        disable_advanced_rag = `
             <div><p><b class="beta_warning">Warning</b> If you no longer wish to use or see this alert, click disable.</p>
             <button onclick="disableRag()">Disable</button></div>`;
    }
    let cnt =
        `<div>
          <p>Configure an endpoint for advanced search.</p>
         </div>
         <input id="set_rag_endpoint" type="text" name="set_rag_endpoint" placeholder="RAG endpoint">
         <button onclick="saveRagEndpoint()">Activate</button>
         <div>
         ${disable_advanced_rag}
         <p>Learn more about this feature here:
          <a href="https://github.com/EliasPereirah/OrionChat#rag-endpoint">RAG endpoint</a></p>
         </div>`;
    createDialog(cnt, 0, 'optionsDialog');
}

function disableRag() {
    localStorage.setItem('use_rag_endpoint', 'no');
    closeDialogs();
}

function saveRagEndpoint(activate) {
    let input_ele = document.querySelector('#set_rag_endpoint');
    if (input_ele) {
        let rag_endpoint = input_ele.value.trim();
        if (rag_endpoint) {
            localStorage.setItem("rag_endpoint", rag_endpoint)
            localStorage.setItem('use_rag_endpoint', 'yes');
        }
    }
    closeDialogs()
}

function setOptions() {
    closeDialogs(); // close opened dialogs before show options dialog
    let system_prompt = localStorage.getItem('system_prompt');
    if (!system_prompt) {
        system_prompt = '';
    }
    let prompts_options = '';
    let prompt_id = 0;
    let by_user = '';
    if (typeof (all_prompts) !== "undefined") {
        prompts_options += '<select name="prompt"><option selected="selected" disabled="disabled">Awesome Prompts</option>';
        all_prompts.forEach(the_prompt => {
            if (the_prompt.by_user) {
                by_user = `class="by_user" data-created_time="${the_prompt.created_time}"`;
            } else {
                by_user = '';
            }
            let prompt_text = the_prompt.prompt.replace(/"/g, '&quot;');
            prompts_options += `<option ${by_user} id="prompt_id${prompt_id}" value="${prompt_text}">${the_prompt.act}</option>`;
            prompt_id++;
        });
        prompts_options += '</select>';
    }
    let platform_info = '';
    let platform_name = '';
    if (chosen_platform) {
        platform_name = PLATFORM_DATA[chosen_platform]?.name ?? '';
        platform_info = `<p class="platform_info">Active:<b> ${model}</b> from <b>${platform_name}</b></p>`;
    }
    let platform_options = '<div><p>Choose a Model</p><select name="platform"><option disabled="disabled" selected="selected">Select</option>';
    let mark_as_select = '';
    Object.keys(PLATFORM_DATA).forEach(platform => {
        let list_models = PLATFORM_DATA[platform].models;
        let platform_name = PLATFORM_DATA[platform].name;
        platform_options += `<optgroup label="${platform_name}">`;
        list_models.forEach(model_name => {
            if (model_name === model) {
                mark_as_select = "selected='selected'";
            }
            platform_options += `<option ${mark_as_select} data-platform="${platform}" value="${model_name}">${model_name}</option>`;
            mark_as_select = '';
        })
        platform_options += `</optgroup>`;
    })
    platform_options += `</select></div>`;

    let plugin_option = `<button class="plugin_opt_btn" onclick="pluginOptions()">Plugins</button>`;
    let add_new_models = `<button class="more_opt_btn" onclick="addModelsOptions()">Add Models</button>`;
    let more_option = `<button class="more_opt_btn" onclick="moreOptions()">More Options</button>`;
    let btn_youtube_api = `<button class="more_opt_btn" onclick="dialogSetYouTubeCaptionApiEndpoint()">YouTube Captions</button>`;

    let file_search_tool = `<button class="more_opt_btn" onclick="dialogFileSearchTool()">File Search</button>`;

    let cnt =
        `<div>${platform_options}
         <input type="text" name="api_key" placeholder="API Key(if not defined yet)">
         <button onclick="saveModel()" class="save_model">Save Model</button></div><hr>
         <div><strong>System Prompt</strong>
         ${prompts_options}
         <input id="prompt_name" type="text" name="prompt_name" placeholder="Name your prompt">
         <textarea class="system_prompt" placeholder="(Optional) How the AI should respond?">${system_prompt}</textarea>
         <button onclick="savePrompt()" class="save_prompt">Save Prompt</button> <button id="delete_prompt">Delete Prompt</button><br>
         ${platform_info}
          <span>${add_new_models}</span>
         <span>${plugin_option}</span>
         <span>${more_option}</span>
         <span>${file_search_tool}</span>
         <span>${btn_youtube_api}</span>
        
         </div>`;
    createDialog(cnt, 0, 'optionsDialog');

    setTimeout(() => {

        let sys_prompt = document.querySelector("textarea.system_prompt");
        let last_prompt = sys_prompt.value.trim();
        let prompt_name = document.querySelector("#prompt_name");
        if (sys_prompt) {
            sys_prompt.onkeyup = () => {
                let current_prompt = sys_prompt.value.trim();
                if (current_prompt !== last_prompt) {
                    prompt_name.style.display = 'inline-block';
                    prompt_name.setAttribute("required", "true");
                    let del_prompt = document.querySelector("#delete_prompt");
                    if (del_prompt) {
                        del_prompt.style.display = 'none';
                    }
                } else {
                    prompt_name.style.display = 'none';
                    prompt_name.value = '';
                    prompt_name.setAttribute("required", "false");

                }
            }
        }

        let sl_platform = document.querySelector("select[name=platform]");
        if (sl_platform) {
            sl_platform.onchange = () => {
                let btn_sm = document.querySelector('.save_model');
                if (btn_sm) {
                    btn_sm.classList.add('animate');
                }
            }
        }

        let sl_prompt = document.querySelector("select[name=prompt]");
        if (sl_prompt) {
            sl_prompt.onchange = (item => {
                let selectedOption = sl_prompt.options[sl_prompt.selectedIndex];
                let delete_prompt_bnt = document.querySelector("#delete_prompt");
                if (selectedOption.getAttribute('data-created_time')) {
                    if (delete_prompt_bnt) {
                        delete_prompt_bnt.style.display = 'inline-block';
                        delete_prompt_bnt.onclick = () => {
                            deletePrompt();
                        }
                    }
                } else {
                    delete_prompt_bnt.style.display = 'none';
                }
                prompt_name.style.display = 'none';
                prompt_name.value = '';
                prompt_name.setAttribute("required", "false");
                let btn_sp = document.querySelector('.save_prompt');
                if (btn_sp) {
                    btn_sp.classList.add('animate');
                }
                let txt_area = document.querySelector("textarea.system_prompt");
                if (txt_area) {
                    txt_area.value = item.target.value;
                    last_prompt = item.target.value;
                }

            })
        }
    }, 500)

}

function loadPlugins() {
    let plugin_url = localStorage.getItem("plugin_url");
    if (plugin_url) {
        let sc = document.createElement('script');
        sc.src = plugin_url.trim();
        document.body.append(sc);
    }
    let plugin_code = localStorage.getItem("plugin_code");
    if (plugin_code) {
        let sc_inline = document.createElement('script');
        sc_inline.innerHTML = plugin_code.trim();
        document.body.append(sc_inline);

    }
}

function savePlugin() {
    let plugin_url = document.querySelector("#plugin_url");
    let plugin_code = document.querySelector("#plugin_code");
    if (plugin_code && plugin_code.value.trim()) {
        plugin_code = plugin_code.value.trim();
        if (plugin_code) {
            localStorage.setItem("plugin_code", plugin_code);
        }
    } else {
        localStorage.removeItem("plugin_code");
    }
    if (plugin_url && plugin_url.value.trim()) {
        plugin_url = plugin_url.value.trim();
        if (plugin_url) {
            localStorage.setItem('plugin_url', plugin_url)
        }
    } else {
        localStorage.removeItem("plugin_url");
    }
    closeDialogs();
}

function pluginOptions() {
    closeDialogs(); // close opened dialogs before show options dialog
    let plugin_url = localStorage.getItem("plugin_url")
    let plugin_code = localStorage.getItem("plugin_code");
    let value_plugin_code = '';
    if (plugin_code) {
        value_plugin_code = `${plugin_code}`;
    }

    let value_plugin_url = '';
    if (plugin_url) {
        value_plugin_url = `value="${plugin_url}"`;
    }
    let cnt =
        `<div>
         <p>Add new functionality by adding a script.</p>
         <input ${value_plugin_url} placeholder="JavaScript URL" type="url" id="plugin_url">
         <p>and/or code</p>
         <textarea placeholder="JavaScript code" id="plugin_code">${value_plugin_code}</textarea>
         <p><button onclick="savePlugin()">Save Plugin</button></p>
         </div>`;

    createDialog(cnt, 0, 'optionsDialog');
}// end addPlugin


function moreOptions(show = 'all') {
    closeDialogs(); // close opened dialogs before show options dialog

    let m_disable_audio_option = '';
    let m_is_audio_feature_active = localStorage.getItem('audio_feature')
    m_is_audio_feature_active = parseInt(m_is_audio_feature_active);
    let m_is_eleven_keys_set = localStorage.elabs_api_key ?? '';
    if (m_is_audio_feature_active) {
        m_disable_audio_option = `<p><b id="audio_txt_status">Audio active:</b> <button class="disable_btn" onclick="disableAudioFeature()">Disable Audio</button></p>`;
    } else {
        if (m_is_eleven_keys_set) {
            m_disable_audio_option = `<p><b id="audio_txt_status">Audio is disabled:</b> <button onclick="enableAudioFeature()">Enable Audio</button></p>`;
        }
    }
    let m_audio_options =
        `<p>If you want an audio response, you can set up an API key for ElevenLabs below.</p>
         <input type="text" name="elabs_api_key" placeholder="ElevenLabs API Key">
         <button onclick="enableAudioFeature()">Save Key</button>
        `;
    let cse_option = `
    <hr>
    <p><span class="beta_warning"></span><b>RAG: Search With Google</b></p>
    <p>By enabling Google <abbr title="Custom Search Engine">CSE</abbr> You will be able to ask the AI to search the internet.</p>
    <input type="text" id="cse_google_api_key" name="cse_google_api_key" placeholder="Google CSE API Key">
    <input type="text" id="cse_google_cx_id" name="cse_google_cx_id" placeholder="Google CX ID">
    <button onclick="enableGoogleCse()">Activate</button>
    `;

    let rag_options = `
             <div><hr>
             <p>For a more efficient RAG configure advanced search</p>
             <button onclick="ragEndpointDialog()">Advanced</button>
             </div>`;

    let g_cse_status = '';
    if (isGoogleCseActive()) {
        g_cse_status = `<button id="disable_g_cse" class="disable_btn" onclick="disableGoogleCse()">Disable CSE</button`;
    }


    let import_export_configs =
        `<div>
         <hr>
         <p>Import or export settings and saved chats.</p>
          <button onclick="downloadChatHistory()">Export</button>
          <button onclick="restoreChatHistory()">Import</button>
         </div>`;

    let cnt =
        `<div>
         ${m_audio_options}
         ${m_disable_audio_option}
         ${cse_option}
         ${g_cse_status}
         ${rag_options}
         ${import_export_configs}
         </div>`;
    if (show === 'cse') {
        cnt =
            `<div>
              ${cse_option}
              ${g_cse_status}
         </div>`;
    }
    createDialog(cnt, 0, 'optionsDialog');
}


function addModelsOptions() {
    closeDialogs(); // close opened dialogs before show new one
    let provider_options =
        '<div><p>Add a new AI model</p>' +
        '<p>Select the provider for which you want to add the new model.</p>' +
        '<select name="provider">' +
        '<option disabled="disabled" selected="selected">Select</option>';

    Object.keys(PLATFORM_DATA).forEach(platform => {
        if (platform !== 'ollama') {
            // Ollama models is fetched automatically
            let platform_name = PLATFORM_DATA[platform].name;
            provider_options += `<option value="${platform}">${platform_name}</option>`;
        }

    })


    let extra_models = localStorage.getItem("extra_models");
    extra_models = JSON.parse(extra_models);
    let remove_models = '';
    if (extra_models) {
        remove_models = '<div><p>To remove a model, simply click on it below!</p>';
    }
    for (const provider in extra_models) {
        if (extra_models.hasOwnProperty(provider)) {
            let provide_name = PLATFORM_DATA[provider].name;
            let idx = 0;
            extra_models[provider].forEach(model => {
                remove_models += `<button class="remove_model_btn" data-id="js_btn_${idx}" onclick="removeModel('${provider}', '${model}', ${idx})" title="From ${provide_name}">${model}</button>`;
                let has_model = PLATFORM_DATA[provider].models.includes(model);
                if (!has_model) {
                    PLATFORM_DATA[provider].models.push(model);
                }
                idx++;
            })
        }
    }
    if (remove_models) {
        remove_models += '</div>';
    }

    provider_options += `</select></div>`;

    let new_model =
        '<input name="new_model" placeholder="Model ID">' +
        '<button onclick="addNewModel()" class="save_new_model">Add Model</button>';
    let cnt =
        `<div>${provider_options}</div><div>${new_model}</div>${remove_models}`;
    createDialog(cnt, 0, 'optionsDialog');
}


function removeModel(provider, model, id) {
    let extra_models = localStorage.getItem('extra_models');
    extra_models = JSON.parse(extra_models);
    extra_models[provider] = extra_models[provider].filter(item => item !== model);
    localStorage.setItem('extra_models', JSON.stringify(extra_models));
    let btn = document.querySelector(`[data-id=js_btn_${id}]`);
    btn.remove();
    addWarning(`Model ${model} removed with success!`, true, 'success_dialog')
    loadExtraModels();
}

function addNewModel() {
    let provider = document.querySelector("select[name=provider]");
    let new_model = document.querySelector("input[name=new_model]");
    new_model = new_model.value.trim();
    provider = provider.value.trim().toLowerCase();
    if (provider === 'select') {
        addWarning('Please select a provider', true, 'fail_dialog');
        provider = '';
    }
    if (provider && new_model) {
        let has_model = PLATFORM_DATA[provider]?.models?.includes(new_model) ?? false;
        if (!has_model) {
            let extra_models = localStorage.getItem("extra_models");
            if (extra_models === null) {
                extra_models = '{}';
            }
            extra_models = JSON.parse(extra_models);
            if (extra_models[provider]) {
                extra_models[provider].push(new_model);
            } else {
                extra_models[provider] = [new_model];
            }

            localStorage.setItem('selected_model', new_model);
            localStorage.setItem('chosen_platform', provider);
            endpoint = PLATFORM_DATA[provider].endpoint;
            localStorage.setItem('endpoint', endpoint)
            api_key = localStorage.getItem(`${provider}.api_key`);
            chosen_platform = provider;
            model = new_model;

            localStorage.setItem('extra_models', JSON.stringify(extra_models));
            addWarning('New model added successfully!', true, 'success_dialog');
            updateChatPlaceholder();

        } else {
            let msg = `Model ${new_model} for ${provider} already exists!`;
            addWarning(msg, true, 'fail_dialog');
        }
    }
    loadExtraModels();
}

function setYouTubeCaptionApiEndpoint() {
    let ele = document.querySelector("#yt_down_caption_endpoint");
    if (ele) {
        let yt_down_caption_endpoint = ele.value.trim();
        localStorage.setItem('yt_down_caption_endpoint', yt_down_caption_endpoint);
    }
    closeDialogs();
}

function dialogSetYouTubeCaptionApiEndpoint() {
    let input_value = '';
    let cnt =
        `<div><p>Configure a YouTube caption extraction API endpoint.</p>
        <input ${input_value} id="yt_down_caption_endpoint" name="yt_down_caption_endpoint" placeholder="API Endpoint">
        <button onclick="setYouTubeCaptionApiEndpoint()">Save</button>
        <p>This will allow you to share a YouTube URL, and the AI will respond based on the caption of the shared video.</p></div>
        <div><p>For more information check out the 
        <a target="_blank" href="https://github.com/EliasPereirah/OrionChat/tree/master#youtube-caption">link</a></p></div>
        `

    createDialog(cnt, 0, 'optionsDialog');
}

async function dialogFileSearchTool() {

    let cnt =
        `<div><p>Gemini File Search</p>
        <p>Select a store:</p>
        <select id="file_search_tool" name="file_search_tool"></select>
        <button onclick="setFileSearchTool()">Save</button>
        <p>The Gemini API enables Retrieval Augmented Generation ("RAG") through the <a target="_blank" href="https://ai.google.dev/gemini-api/docs/file-search">File Search</a> tool.</p>
        <p>If you already have a store with indexed files, select the store you want to use above.</p>
        <p>Whenever you want a response from Gemini based on the indexed data, type "fs: + your prompt"</p>
        </div>
        <div></div>
        `
    createDialog(cnt, 0, 'optionsDialog');
    let gemini_api_key = localStorage.getItem("google.api_key");
    let ele_fs_store = document.getElementById('file_search_tool');
    if (gemini_api_key) {
        let client = new GeminiFileSearchApiClient(gemini_api_key);
        let options = '';
        try {
            let store_list = await client.listStores();
            store_list.fileSearchStores.forEach(store=>{
                let store_id = store.name;
                let store_display_name = store.displayName;
                options += `<option value="${store_id}">${store_display_name}</option>`;
            })
        }catch (error){
            console.warn(error);
        }
        if(options){
            ele_fs_store.innerHTML = options;
        }else {
            addWarning("Make sure you have a store associated with your Gemini API Key.", false, 'fail_dialog');
        }
        console.log("["+options+"]");
    } else {
        addWarning("No Gemini API key configured.");
    }

}

function setFileSearchTool(){
    let ele = document.querySelector("#file_search_tool");
    if (ele) {
        let file_search_tool = ele.value.trim();
        localStorage.setItem('file_search_store_id', file_search_tool);
        file_search_store_id = file_search_tool;
    }
    closeDialogs();
}

function orderTopics() {
    let topics = document.querySelectorAll('.topic');
    if (topics.length) {
        let topicsArray = Array.prototype.slice.call(topics);
        topicsArray.sort(function (a, b) {
            let interactionA = parseInt(a.getAttribute('data-last-interaction'));
            let interactionB = parseInt(b.getAttribute('data-last-interaction'));
            return interactionB - interactionA;
        });
        let parent = topicsArray[0].parentNode;
        topicsArray.forEach(function (topic) {
            parent.appendChild(topic);
        });
    }

}

function savePrompt(close_dialog = true) {
    let btn_sp = document.querySelector('.save_prompt');
    if (btn_sp) {
        btn_sp.classList.remove('animate');
    }
    let sys_prompt = document.querySelector("textarea.system_prompt").value.trim();
    if (sys_prompt.length) {
        let prompt_name = document.querySelector("#prompt_name");
        if (prompt_name && prompt_name.value.trim().length > 0) {
            // new prompt add by the user
            let user_prompts = localStorage.getItem('user_new_prompts');
            if (user_prompts) {
                user_prompts = JSON.parse(user_prompts);
            } else {
                user_prompts = [];
            }
            let current_time = Date.now();
            let u_new_prompt = {act: prompt_name.value, prompt: sys_prompt, by_user: true, created_time: current_time};
            user_prompts.unshift(u_new_prompt);
            all_prompts.unshift(u_new_prompt);
            localStorage.setItem('user_new_prompts', JSON.stringify(user_prompts));
        }
        localStorage.setItem('system_prompt', sys_prompt);
    } else {
        localStorage.removeItem('system_prompt')
    }

    saveModel();
    if (close_dialog) {
        closeDialogs();
    }
}


function saveModel() {
    let btn_sm = document.querySelector('.save_model');
    if (btn_sm) {
        btn_sm.classList.remove('animate');
    }

    let sl_platform = document.querySelector("select[name=platform]")
    let selected_option = sl_platform.options[sl_platform.selectedIndex];
    model = selected_option.value.trim();
    localStorage.setItem('selected_model', model);
    let selected_platform = selected_option.getAttribute('data-platform');
    let input_api_key = document.querySelector("input[name=api_key]").value.trim();
    if (input_api_key) {
        api_key = input_api_key; /// need to be like that
    }
    localStorage.setItem('chosen_platform', selected_platform);
    chosen_platform = selected_platform;
    let platform_name = PLATFORM_DATA[chosen_platform].name;
    endpoint = PLATFORM_DATA[selected_platform].endpoint;
    localStorage.setItem('endpoint', endpoint)
    if (input_api_key) {
        localStorage.setItem(`${chosen_platform}.api_key`, api_key)
    } else {
        api_key = localStorage.getItem(`${chosen_platform}.api_key`)
    }
    if (!api_key && chosen_platform === 'ollama') {
        api_key = 'i_love_ollama_'.repeat(3);
        localStorage.setItem(`${chosen_platform}.api_key`, api_key);
    }
    let platform_info = document.querySelector(".platform_info");
    if (platform_info) {
        platform_info.innerHTML = `Active: <b>${model}</b> from <b>${platform_name}</b>`;
    }
    createDialog('Saved with success!', 3);
    updateChatPlaceholder();

}

let hc = localStorage.getItem("hide_conversations");
if (hc === '1') {
      document.querySelector('.conversations').style.display = 'none';
} else {
    if (!is_mobile) {
          document.querySelector('.conversations').style.display = 'block';
    }
}

if (!api_key) {
    let open_options = document.querySelector("#open_options");
    open_options.click();
}

let page_chat_id = document.URL.split("#")[1];
let current_chat = document.querySelector("[data-id='" + page_chat_id + "']");

if (current_chat) {
    current_chat.click();
} else if (page_chat_id) {
    // Chat id doesn't exist, will update the URL to home page
    let new_url = document.URL;
    new_url = new_url.split('?')[0];
    new_url = new_url.split("#")[0];
    history.pushState({url: new_url}, '', new_url);
}

orderTopics();


function ollamaGuide() {
    if (is_mobile) {
        console.log('User seems to be on a mobile device')
        return false;
    }
    let this_domain = `${location.protocol}//${location.hostname}`;
    let guide = `<div>
  <p>If you want to use Ollama, you may need to make some configurations in your local Ollama setup.</p>
  <p>Please take a look at the Ollama docs:</p>
  <p>See these links:<br>
    -> <a target="_blank" href="https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama">Additional web origins</a><br>
    -> <a target="_blank" href="https://github.com/ollama/ollama/blob/main/docs/faq.md#setting-environment-variables-on-linux">Setting environment variables</a>
  </p>
  <p>Linux CLI example:</p>
  <pre><code>systemctl edit ollama.service</code></pre>
  <p>Add the following:</p>
  <pre><code>[Service]
Environment="OLLAMA_ORIGINS=${this_domain}"</code></pre>
  <p><br>This will allow <strong>${this_domain}</strong> to access http://localhost:11434/</p>
</div>`

    createDialog(guide, 0, 'cl_justify')
    hljs.highlightAll();
    setTimeout(() => {
        enableCopyForCode(false);
    }, 500)

}


function getOllamaModels() {
    let ollama_models_endpoint = PLATFORM_DATA.ollama.get_models_endpoint;
    let optgroup_ollama = document.querySelector("select[name=platform] [label=Ollama]")
    let start_time = new Date().getTime();
    fetch(ollama_models_endpoint)
        .then(response => {
            return response.json();
        })
        .then(data => {
            data = data.data ?? [];
            data.forEach(ollama_model => {
                let option_element = document.createElement('option');
                option_element.setAttribute("data-platform", "ollama");
                option_element.value = ollama_model.id;
                option_element.innerText = ollama_model.id;
                if (optgroup_ollama) {
                    optgroup_ollama.append(option_element)
                }
                PLATFORM_DATA.ollama.models.push(ollama_model.id);
            })
        }).catch(error => {
            console.warn(error)
            let end_time = new Date().getTime()
            let past_time = end_time - start_time;
            if (past_time > 1200) {
                //console.log("user don't seem to have ollama running");
            } else {
                console.log('user seems to have ollama running with cors policy')
                let guide_warnings = localStorage.getItem('guide_warnings');
                if (!guide_warnings) {
                    guide_warnings = 0;
                }
                guide_warnings = parseInt(guide_warnings);
                guide_warnings++
                if (guide_warnings <= 4) {
                    ollamaGuide();
                }
                localStorage.setItem('guide_warnings', guide_warnings.toString());
            }
        }
    )
}

getOllamaModels();

function disableAudioFeature() {
    let audio_txt_status = document.querySelector("#audio_txt_status");
    audio_txt_status.innerText = 'Audio is disabled!'
    localStorage.setItem('audio_feature', '0');
    addWarning('Audio feature disabled', true)
}

function enableAudioFeature() {
    let audio_txt_status = document.querySelector("#audio_txt_status");
    localStorage.setItem('audio_feature', '1');
    let input_ele = document.querySelector("input[name=elabs_api_key]");

    if (input_ele && input_ele.value.trim().length > 5) {
        elabs_api_key = input_ele.value.trim();
        localStorage.setItem('elabs_api_key', elabs_api_key)
        addWarning('Audio feature enabled', true)
        if (audio_txt_status) {
            audio_txt_status.innerText = 'Audio is enabled!'
        }
    } else {
        if (!elabs_api_key) {
            addWarning('Ops. No key provided!', false)
        } else {
            addWarning('Audio feature enabled', true)
            if (audio_txt_status) {
                audio_txt_status.innerText = 'Audio is enabled!'
            }
        }
    }

}


function needToolUse(last_user_input) {
    let lui = last_user_input.trim();
    let cmd = lui.match(/^[a-z]+:/i)?.[0];
    let cmd_list = [
        'search:', 's:',
        'javascript:', 'js:',
        'youtube:', 'yt:',
        'dt:',
        'pic:','imagine:'
    ]
    if (cmd_list.includes(cmd)) {
        return true;
    } else if (last_user_input.match(/youtube\.com|youtu\.be/)) {
        let time_now = new Date().getTime();
        let past_seconds = (time_now - last_auto_yt_fn_call) / 1000;
        if (past_seconds > 10) {
            last_auto_yt_fn_call = time_now;
            return true
        }
    }
    return false;
}

function whichTool(last_user_input) {
    let lui = last_user_input.trim();
    let cmd = lui.match(/^[a-z]+:/i)?.[0] ?? '';
    if (cmd === "search:" || cmd === 's:') {
        return 'googleSearch';
    } else if (cmd === 'javascript:' || cmd === 'js:') {
        return 'javascriptCodeExecution';
    } else if (cmd === 'youtube:' || cmd === 'yt:') {
        return 'youtubeCaption';
    } else if (last_user_input.match(/youtube\.com\/watch|youtu\.be/)) {
        return 'youtubeCaption';
    }else if(cmd === 'dt:'){
        // Activate extend thinking for Claude
        return 'dt';
    }else if(cmd.trim() !== ''){
        return cmd.replaceAll(":","");
    }
    return '';
}

function commandManager(input_text) {
    input_text = input_text.trim() + " ";
    let arr = input_text.match(/^[a-z]+:(.*?)\s/i);
    let cmd = '';
    let args = '';
    if (arr) {
        cmd = arr[0];
        cmd = cmd.replace(/:(.*)/, "");
        if (arr[1]) {
            args = arr[1];
        }
    }

    let prompt = special_prompts[cmd] ?? '';
    if (!prompt) {
        return false; // no command passed
    }

    input_text = input_text.replace(/^[a-z]+:(.*?)\s/i, " ").trim();
    prompt = prompt.replaceAll("{{USER_INPUT}}", input_text);

    prompt = prompt.replaceAll("{{ARG1}}", args);
    return prompt; // return the new prompt formated
}


async function youtubeCaption(data) {
    dispatcher = 'system';
    let video_title = '';
    let yt_down_caption_endpoint = localStorage.getItem("yt_down_caption_endpoint") ?? ''
    if (!yt_down_caption_endpoint) {
        dialogSetYouTubeCaptionApiEndpoint();
        removeLastMessage();
        enableChat();
        //toggleAnimation(true);
        toggleAiGenAnimation(false);
        return false;
    }

    let url = data.url ?? '';
    if (!url) {
        addWarning('youtubeCaption() received no URL param');
    }
    console.log('Extracting caption from ' + url);
    let caption = '';


    const urlencoded = new URLSearchParams();
    urlencoded.append('yt_url', url);
    let data_init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencoded
    }
  try {
      await fetch(yt_down_caption_endpoint, data_init).then(function (res) {
          return res.json();
      }).then(function (json) {
          if (json.caption) {
              caption = json.caption;
          }
          if (json.title) {
              video_title = json.title;
          }

      });
  }catch{
        console.log('Error fetching '+yt_down_caption_endpoint)
  }
    if (caption === '') {
        addWarning('Could not get subtitles for this video', false)

        if (chosen_platform === 'google') {
            await geminiChat()
            // toggleAnimation(true);
            toggleAiGenAnimation(false);
        } else {
            await streamChat(false); // false to prevent infinite loops
            // toggleAnimation(true);
            toggleAiGenAnimation(false)
        }
        setTimeout(() => {
            loadVideo()
        }, 1000)

        //removeLastMessage();
    } else {
        let last_input = last_user_input.replace(/^[a-z]+:(.*?)\s/i, " "); // remove cmd
        let ele = document.querySelector(".message:nth-last-of-type(1)");
        if (pre_function_text) {
            last_input = pre_function_text;
        }
        let cnt = `${last_input} <details><summary><b>Title</b>: ${video_title}</summary><br><b>Caption</b>: ${caption}</details>`;
        if (ele) {
            ele.innerHTML = cnt;
        }
        pre_function_text = '';
        //   conversations.messages[conversations.messages.length - 1].content = `User prompt: ${last_input} \n the caption of the video: <caption>${caption}</caption>`;
        conversations.messages[conversations.messages.length - 1].content = cnt;
        setTimeout(() => {
            loadVideo()
        }, 1000)
        if (chosen_platform === 'google') {
            await geminiChat()
            // toggleAnimation(true);
            toggleAiGenAnimation(false);
        } else {
            await streamChat(false); // false to prevent infinite loops
            // toggleAnimation(true);
            toggleAiGenAnimation(false)
        }

    }


} // youtubeCaption


async function retrieveContentFromUrl(url) {
    if (!url) {
        addWarning('retrieveContentFromUrl() received no URL param');
        return false;
    }
    let rag_endpoint = localStorage.getItem("rag_endpoint");
    if (!rag_endpoint) {
        addWarning("No [rag_endpoint] found!");
        return false;
    }



    console.log('retrieveContentFromUrl: ' + url);
    const urlencoded = new URLSearchParams();
    urlencoded.append('url', url);
    let data_init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencoded
    }
    return await fetch(rag_endpoint, data_init).then(function (res) {
        return res.json();
    })

} // retrieveContentFromUrl


async function streamChat(can_use_tools = true) {
    let first_response = true;
    addFileToPrompt();
    last_user_input = conversations.messages[conversations.messages.length - 1].content;
    let cmd = commandManager(last_user_input)
    let all_parts = [];
    let invalid_key = false;
    let system_prompt_text = getSystemPrompt();
    if (system_prompt_text) {
        let system_prompt = {content: system_prompt_text, 'role': 'system'};
        if (chosen_platform !== 'anthropic') {
            if (!cmd) {
                if (!base64String) {
                    all_parts.push(system_prompt);
                }
            }
        }
    }

    conversations.messages.forEach(part => {
            let cnt = part.content;
            if(part.role === 'user'){
                cnt = stripCommand(cnt);
            }
            last_role = part.role;
            last_cnt = part.content;
            if (chosen_platform === 'anthropic') {
                let ant_part =
                    {
                        role: part.role,
                        content: [{type: 'text', text: cnt}]
                    }
                all_parts.push(ant_part);
            } else if (chosen_platform === 'cohere') {
                let cohere_part =
                    {
                        role: part.role,
                        content: cnt
                    };
                all_parts.push(cohere_part);

            } else {
                all_parts.push({content: part.content, role: part.role});
            }

        }
    ); // end forEach

    if (base64String && last_role === 'user' && chosen_platform === 'anthropic') {
        let ant_part = {
            role: last_role,
            content: [{
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": mimeType,
                    "data": base64String.split(',')[1]
                }
            }, {type: 'text', text: last_cnt}]
        };
        all_parts.pop(); // remove last
        all_parts.push(ant_part); // add with image scheme
        base64String = '';
        mimeType = '';
    } else if (base64String && last_role === 'user') {
        all_parts.pop();
        all_parts.push({
            "role": last_role,
            "content": [
                {
                    "type": "text",
                    "text": last_cnt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": base64String
                    }
                }]
        });
        base64String = '';
        mimeType = '';
    }

    if (cmd) {

        all_parts.pop() // remove last
        // have cmd - so will just past the last user message in the command
        if (chosen_platform === 'anthropic') {
            let ant_part =
                {
                    role: 'user',
                    content: [{type: 'text', text: cmd}]
                };
            all_parts.push(ant_part);
        } else {
            all_parts.push({content: cmd, role: 'user'});
        }
    }

    let data =
        {
            model: model,
            stream: true,
            messages: all_parts,
        }
    if (chosen_platform === 'anthropic') {
       data.max_tokens = 8192;
        let pog = whichTool(last_user_input);
        if(pog === 'dt' && model.match(/claude-3-7/)){
            data.thinking = {
                type: "enabled",
                budget_tokens: 2048
            }
        }
        if (system_prompt_text) {
            data.system = system_prompt_text;
        }
    }


    let HTTP_HEADERS = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
        'x-api-key': `${api_key}`, // for Anthropic

    };
    if (chosen_platform === 'anthropic') {
        HTTP_HEADERS["anthropic-version"] = "2023-06-01";
        HTTP_HEADERS['anthropic-dangerous-direct-browser-access'] = "true";
    }

    if (chosen_platform === "azure") {
        HTTP_HEADERS['api-key'] = api_key;
    }
    if (chosen_platform === 'ollama') {
        HTTP_HEADERS = {};
    }
    let the_tool = '';
    if (can_use_tools) {
        if (needToolUse(last_user_input)) {
            let tool_name = whichTool(last_user_input);
            let tool_compatibility = `openai_compatible`;
            if (chosen_platform === 'anthropic') {
                tool_compatibility = 'anthropic_compatible';
            } else if (chosen_platform === 'cohere') {
                tool_compatibility = 'cohere_compatible';
            }

            the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
            if (the_tool) {
                data.stream = false; // in this case for tool use we will not use stream mode
                data.tools = [the_tool];
                if (chosen_platform !== 'cohere') {
                    data.tool_choice = "required";
                }
                if (chosen_platform === 'anthropic') {
                    data.tools = [the_tool];
                    data.tool_choice = {"type": "tool", "name": tool_name};
                }
            }
        }
    }

    if (chosen_platform === 'groq' && model.match(/deepseek-r1/)) {
        data.reasoning_format = 'parsed';
    }

    const requestOptions = {
        method: 'POST',
        headers: HTTP_HEADERS,
        body: JSON.stringify(data)
    };


    if (!endpoint) {
        setOptions();
        // toggleAnimation(true);
        toggleAiGenAnimation(false);
        removeLastMessage();
        enableChat();
        return false;
    }

    endpoint = getEndpoint();

    try {
        const response = await fetch(endpoint, requestOptions);
        if (!response.ok) {
            response.json().then(data => {
                setTimeout(() => {
                    addWarning(data);
                }, 500)
                removeLastMessage();
                //toggleAnimation(true);
                toggleAiGenAnimation(false);
                enableChat();
                let the_code = data.code ?? data.error?.code ?? data.error?.message ?? data.message ?? '';
                if (the_code === "wrong_api_key" || the_code === "invalid_api_key" || the_code === "invalid x-api-key" || the_code === "invalid api token") {
                    setApiKeyDialog();
                }
            })
            return false;
        }


        story = '';
        story_reasoning = '';
        let cloned_response = response.clone();
        const reader = response.body.getReader();
        let chatContainer = document.querySelector('#chat-messages');
        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot');
        if (!the_tool) {
            chatContainer.append(botMessageDiv);
        }
        let buffer = '';
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                if (story === '') {
                    cloned_response.json().then(data => {
                        processFullData(data);
                        if (story) {
                            addConversation('assistant', story, true, true, story_reasoning);
                            enableCopyForCode(true);
                            hljs.highlightAll();
                        } else {
                            // probably not stream - tool use
                            // toggleAnimation(true);
                            toggleAiGenAnimation(false);
                            toolHandle(data);
                            return false;
                        }
                    }, error => {
                        addWarning(error)
                    })

                } else {
                    processBuffer(buffer);
                    addConversation('assistant', story, false, false, story_reasoning);
                }
                break;
            }

            const textDecoder = new TextDecoder('utf-8');
            const chunk = textDecoder.decode(value, {stream: true});
            buffer += chunk;
            let separator = chosen_platform === 'anthropic' ? '\n\n' : '\n';
            let parts = buffer.split(separator);

            buffer = parts.pop() || '';

            for (let part of parts) {
                if (part.startsWith('data: ') || part.startsWith('event: content_block_delta')) {
                    if (!part.startsWith('data: [DONE]')) {
                        try {
                            processDataPart(part);
                        } catch (jsonError) {
                            addWarning(JSON.stringify(jsonError));
                            console.error("JSON error: ", jsonError);
                        }
                    }
                }
            }

            let full_story = `${story_reasoning}${story}`.trim();
            if (story.trim() && story_reasoning.trim()) {
                full_story = `<details><summary>See Reasoning</summary>${story_reasoning}</details>${story}`;
            }
            botMessageDiv.innerHTML = converter.makeHtml(full_story);
            hljs.highlightAll();
            if (first_response) {
                first_response = false;
                botMessageDiv.scrollIntoView();
            }

        }

    } catch (error) {
        console.error("Error:", error);
        if (error === {}) {
            error = 'Error: {}';

        }

        addWarning(error, false)
        // Display error message in the chat
        if (invalid_key) {
            setApiKeyDialog();
        }
    } finally {
        enableCopyForCode();
        enableChat();
        toggleAiGenAnimation(false);
        toggleAiGenAnimation(false);
    }
}


// add file like json, md, txt to user prompt
// the addition will occur if it is not an audio, video or image file
function addFileToPrompt() {
    if (base64String === '') {
        return false;
    }

    let gemini_supported_mimeTypes = [
        "application/pdf",
        "application/x-javascript",
        "text/javascript",
        "application/x-python",
        "text/x-python",
        "text/plain",
        "text/html",
        "text/css",
        "text/md",
        "text/csv",
        "text/xml",
        "text/rtf"
    ]

    if (chosen_platform === 'google' && gemini_supported_mimeTypes.includes(mimeType)) {
        // No need to convert to text, gemini can handle that type of file
        return false;
    }


    let last_input_from_user = conversations.messages[conversations.messages.length - 1].content;
    let mime = mimeType.split("/")[0].toLowerCase();
    let the_type = mimeType.split("/")[1];
    if (the_type && the_type.toLowerCase() === 'pdf') {
        return false;
    }
    let except = ['audio', 'video', 'image'];
    let appended_txt_file = '';
    if (!except.includes(mime)) {
        let real_b64 = base64String.split(',')[1];
        appended_txt_file = atob(real_b64)
        let ele = document.querySelector(".message:nth-last-of-type(1)");
        if (appended_txt_file.trim().length > 0) {
            last_input_from_user = `${last_input_from_user} \n <pre><code>${appended_txt_file}</code></pre>`;
        }
        if (ele && ele.classList.contains('user')) {
            ele.innerHTML = last_input_from_user;
        }
        conversations.messages[conversations.messages.length - 1].content = last_input_from_user;
        base64String = '';
        mimeType = '';
    }
}

function detectAttachment() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                mimeType = file.type;
                const reader = new FileReader();
                reader.onload = function (event) {
                    base64String = event.target.result;
                    fileInput.parentElement.classList.add('has_attachment')
                    fileInput.value = '';
                }
                reader.readAsDataURL(file);
            }
        }
    }
}


detectAttachment();

async function geminiUploadImage() {
    if (!base64String) {
        return false;
    }

    // the same content will not be uploaded again in less than 23 hours for Google Gemini
    let md5_value = MD5(decodeURIComponent(encodeURIComponent(base64String)));
    let upload_date = localStorage.getItem(md5_value);
    let today_date = new Date().getTime();
    if (upload_date) {
        upload_date = parseInt(upload_date);
        upload_date = new Date(upload_date);
        const differ_ms = today_date - upload_date;
        const d_seconds = Math.floor(differ_ms / 1000);
        const d_minutes = Math.floor(d_seconds / 60);
        const d_hours = Math.floor(d_minutes / 60);
        if (d_hours < 48) {
            let store_fileUri = localStorage.getItem('file_' + md5_value); // stored fileUri
            if (store_fileUri) {
                console.log('no need to upload again')
                return store_fileUri;
            }
        }

    } else {
        console.log('file is new')
    }

    let baseUrl = 'https://generativelanguage.googleapis.com';

    mimeType = base64String.substring(base64String.indexOf(":") + 1, base64String.indexOf(";"));

    const byteCharacters = atob(base64String.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    let imgBlob = new Blob([byteArray], {type: mimeType});
    try {
        // Define headers and initiate the resumable upload
        const startUploadOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Upload-Protocol': 'resumable',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-Header-Content-Length': imgBlob.size,
                'X-Goog-Upload-Header-Content-Type': imgBlob.type,
            },
            body: JSON.stringify({'file': {'display_name': 'TEXT'}}),
        };

        const startRes = await fetch(`${baseUrl}/upload/v1beta/files?key=${api_key}`, startUploadOptions);
        const uploadUrl = startRes.headers.get('X-Goog-Upload-URL');

        // Upload the actual bytes
        const uploadOptions = {
            method: 'POST',
            headers: {
                'Content-Length': imgBlob.size,
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize',
            },
            body: imgBlob,
        };

        const uploadRes = await fetch(uploadUrl, uploadOptions);
        const fileInfo = await uploadRes.json();
        const fileUri = fileInfo.file.uri;


        let file_state = ''
        let start_time = new Date().getTime();
        while (file_state !== 'ACTIVE') {
            console.log('while: file_state:' + file_state)
            await fetch(fileUri + "?key=" + api_key)
                .then(response => response.json())
                .then(data => {
                    file_state = data.state;
                })
                .catch(error => {
                    console.error('Request error:', error);
                });
            if (file_state === 'ACTIVE') {
                break;
            } else {
                await delay(5000); // wait 5 seconds
                // wait 5 secs before verify again
            }
            let past_time = new Date().getTime() - start_time;
            let past_seconds = past_time / 1000;
            if (past_seconds > 180) {
                addWarning('Upload is taking to much time. Try again later.', false)
                console.log('Upload is taking to much time')
                break;
            }


        }

        localStorage.setItem('file_' + md5_value, fileUri);
        localStorage.setItem(md5_value, new Date().getTime().toString());

        return fileUri;


    } catch (error) {
        console.error('Error:', error);
    }
    return false;
}


async function geminiStreamChat(fileUri, data, allow_tool_use = true) {
    last_user_input = conversations.messages[conversations.messages.length - 1].content;

    if (allow_tool_use && needToolUse(last_user_input)) {
        let tool_name = whichTool(last_user_input);
        let tool_compatibility = `google_compatible`;
        let the_tool = tools_list[tool_compatibility]?.[tool_name] ?? '';
        if (the_tool) {
            geminiChat(fileUri, false)
        }
    }
    // const endpoint_stream = `https://generativelanguage.googleapis.com/v1beta/models/${{model}}:streamGenerateContent?alt=sse&key=${{api_key}}`;

    let endpoint_stream = endpoint.replaceAll("{{model}}", model);
    endpoint_stream = endpoint_stream.replaceAll("{{gen_mode}}", "streamGenerateContent");
    endpoint_stream = endpoint_stream.replaceAll("{{api_key}}", api_key + "&alt=sse");

    let first_response = true;
    try {
        const the_response = await fetch(endpoint_stream, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!the_response.ok) {
            the_response.json().then(data => {
                setTimeout(() => {
                    addWarning(data);
                }, 500)
                removeLastMessage();
                // toggleAnimation(true);
                toggleAiGenAnimation(false);
                enableChat();
                let tt = data.error?.message ?? 'nada';
                if (tt.match(/API key not valid/)) {
                    setApiKeyDialog();
                }
            })
            return false;
        }
        const reader = the_response.body.getReader();
        let chatContainer = document.querySelector('#chat-messages'); // Get the chat container
        const botMessageDiv = document.createElement('div');  // Create the bot message div
        botMessageDiv.classList.add('message', 'bot');      // Add the classes
        chatContainer.append(botMessageDiv);           // Append to the chat

        story = '';

        all_chunks = [];
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                if (story) {
                    addConversation('assistant', story, false, false)
                }
                break;
            }

            const textDecoder = new TextDecoder('utf-8');
            const chunk = textDecoder.decode(value);
            all_chunks.push(chunk);
            // Parse the SSE stream
            chunk.split('\n').forEach(part => {
                if (part.startsWith('data: ')) {
                    try {
                        let jsonData = null;
                        try {
                            jsonData = JSON.parse(part.substring('data: '.length));
                        } catch {
                            has_chunk_error = true;
                            return false;
                        }

                        processPartGemini(jsonData);

                    } catch (error) {
                        addWarning(error, false);
                        console.error("Error:", error);
                    }
                }
            });
            if (first_response) {
                first_response = false;
                botMessageDiv.scrollIntoView();
            }
            if (story) {
                botMessageDiv.innerHTML = converter.makeHtml(story);
            }
            hljs.highlightAll();
        }


        /// workaround to fix json parse error
        story = '';
        if (has_chunk_error) {
            let all_fixed_chunks = '';
            let pieces = [];
            all_chunks.forEach(the_chunk => {
                if (the_chunk.startsWith('data: ')) {
                    try {
                        JSON.parse(the_chunk.substring('data: '.length));
                        if (pieces.length > 0) {
                            let the_piece = pieces.join('');
                            all_fixed_chunks += the_piece;
                            pieces = [];
                        }
                        all_fixed_chunks += the_chunk;
                    } catch {
                        pieces.push(the_chunk);
                    }
                } else {
                    pieces.push(the_chunk);
                }
            })

            all_fixed_chunks = all_fixed_chunks.split("\ndata: ");
            all_fixed_chunks[0] = all_fixed_chunks[0].replace(/^data: /, '');
            all_fixed_chunks.forEach(fixed_chunk => {
                let jsonData = null;
                try {
                    jsonData = JSON.parse(fixed_chunk);
                } catch {
                    return false;
                }
                processPartGemini(jsonData);
            })
            if (story) {
                // remove base64 image to save tokens
                conversations.messages[conversations.messages.length - 1].content = story.replace(/<img[^>]*>/g, ' ');
                saveLocalHistory();
                botMessageDiv.innerHTML = converter.makeHtml(story);
            }
            hljs.highlightAll();
        } // end has_chunk_error

        all_chunks = [];


    } catch (error) {
        console.error("Error:", error);
        addWarning('Error: ' + error.message)
    } finally {
        if(grounding_rendered_cnt){
            const all_div_bots = document.querySelectorAll('.bot');
            if(all_div_bots.length){
                const last_div_bot = all_div_bots[all_div_bots.length - 1];
                last_div_bot.innerHTML += grounding_rendered_cnt;
                grounding_rendered_cnt = '';
            }
        }
        enableCopyForCode();
        enableChat();
        toggleAiGenAnimation(false);
        toggleAiGenAnimation(false);
    }
} // geminiStreamChat


function processPartGemini(jsonData) {
    let inlineData = '';
    if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
        story += jsonData.candidates[0].content?.parts[0].text;
        inlineData = jsonData.candidates[0].content?.parts[0]?.inlineData ?? '';
        if (!inlineData) {
            inlineData = jsonData.candidates[0].content?.parts[1]?.inlineData ?? '';
        }
        if (inlineData) {
            inlineData = `<img class="img_output" src="data:${inlineData.mimeType};base64,${inlineData.data}" alt="">`
        }
        story += inlineData;
    } else if (jsonData.candidates?.[0]?.content?.parts?.[0]?.executableCode?.code) {
        let code = jsonData.candidates[0].content.parts[0].executableCode.code;
        let code_lang = jsonData.candidates[0].content.parts[0].executableCode.language;
        code_lang = code_lang.toLowerCase();
        code = `<pre><code class="${code_lang} language-${code_lang} hljs code_execution">${code}</code></pre>`;
        story += code;
        inlineData = jsonData.candidates[0].content?.parts[0]?.inlineData ?? '';
        if (!inlineData) {
            inlineData = jsonData.candidates[0].content?.parts[1]?.inlineData ?? '';
        }
        if (inlineData) {
            inlineData = `<img class="img_output" src="data:${inlineData.mimeType};base64,${inlineData.data}" alt="">`
        }
        story += inlineData;
    } else if (jsonData.candidates?.[0]?.content?.parts?.[0]?.codeExecutionResult?.output) {
        let ce_outcome = jsonData.candidates[0].content.parts[0].codeExecutionResult.outcome; // OUTCOME_OK == success
        let ce_output = jsonData.candidates[0].content.parts[0].codeExecutionResult.output;
        ce_output = ce_output.replaceAll("\n", "<br>");
        story += `<div class="code_outcome ${ce_outcome}">${ce_output}</div>`;

        inlineData = jsonData.candidates[0].content?.parts[0]?.inlineData ?? '';
        if (!inlineData) {
            inlineData = jsonData.candidates[0].content?.parts[1]?.inlineData ?? '';
        }
        if (inlineData) {
            inlineData = `<img class="img_output" src="data:${inlineData.mimeType};base64,${inlineData.data}" alt="">`
        }
        story += inlineData;
    }

    if(jsonData.candidates[0]?.groundingMetadata?.searchEntryPoint?.renderedContent){
        grounding_rendered_cnt = jsonData.candidates[0].groundingMetadata.searchEntryPoint.renderedContent;
        grounding_rendered_cnt = grounding_rendered_cnt.replaceAll('class="container','class="g_container');
        grounding_rendered_cnt = grounding_rendered_cnt.replaceAll('.container','.g_container');
    }


    let finished_reason = jsonData.candidates[0].finishReason ?? '';
    if (finished_reason && finished_reason !== 'STOP') {
        setTimeout(() => {
            addWarning('finishReason: ' + finished_reason, false, 'fail_dialog')
        }, 500)
    }
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function processDataPart(part) {
    let jsonData;
    if (chosen_platform === 'anthropic') {
        jsonData = JSON.parse(part.substring('event: content_block_delta'.length + 6));
        if (jsonData.delta?.text) {
            story += jsonData.delta.text;
        }
        if (jsonData.delta?.thinking) {
            story_reasoning += jsonData.delta.thinking;
        }
    } else {
        jsonData = JSON.parse(part.toString().substring('data: '.length));
        if (chosen_platform === 'cohere') {
            if (jsonData.delta?.message?.content?.text) {
                story += jsonData.delta.message.content.text;
            }
        } else {
            if (jsonData.choices?.[0]?.delta?.content) {
                story += jsonData.choices[0].delta.content;
            }
            if (jsonData.choices?.[0]?.delta?.reasoning_content) {
                story_reasoning += jsonData.choices[0].delta.reasoning_content;
            }
            if (jsonData.choices?.[0]?.delta?.reasoning) {
                story_reasoning += jsonData.choices[0].delta.reasoning;
            }

        }
    }
}


function processFullData(jsonData) {
    if (chosen_platform === 'anthropic') {
        if (jsonData.content?.[0].text) {
            story += jsonData.content[0].text;
        }
    } else {
        if (chosen_platform === 'cohere') {
            if (jsonData.message?.content?.[0]?.text) {
                story += jsonData.message.content[0].text;
            }
        } else {
            if (jsonData.choices?.[0]?.message?.content) {
                story += jsonData.choices[0].message.content;
            }
        }
    }
}

function processBuffer(remainingBuffer) {
    if (remainingBuffer.trim().length > 0) {
        try {
            processDataPart(remainingBuffer);
        } catch (error) {
            console.error('Error processing final buffer', error);
            addWarning(JSON.stringify(error));
        }
    }
}

function enableGoogleCse() {
    let g_api_key = document.querySelector("#cse_google_api_key")?.value.trim() ?? '';
    let g_cx_id = document.querySelector("#cse_google_cx_id")?.value.trim() ?? '';
    if (g_api_key && g_cx_id) {
        localStorage.setItem('cse_google_api_key', g_api_key)
        localStorage.setItem('cse_google_cx_id', g_cx_id)
        closeDialogs();
        addWarning('Google CSE successfully defined!', true, 'success_dialog');
    } else {
        addWarning("Error: API Key and/or CX ID not defined for Google Custom Search", true, 'fail_dialog')
    }
}

function disableGoogleCse() {
    localStorage.removeItem('cse_google_api_key')
    localStorage.removeItem('cse_google_cx_id')
    let disable_g_cse = document.querySelector("#disable_g_cse");
    if (disable_g_cse) {
        disable_g_cse.remove();
    }
    closeDialogs();
}

function isGoogleCseActive() {
    let g_api_key = localStorage.getItem('cse_google_api_key')
    let g_cx_id = localStorage.getItem('cse_google_cx_id')
    return !!(g_api_key && g_cx_id);

}

async function gcseActive() {
    return isGoogleCseActive();
}


async function googleSearch(data) {
    let is_cse_active = await isGoogleCseActive();
    let rag_endpoint = localStorage.getItem("rag_endpoint");
    if (!is_cse_active && !rag_endpoint) {
        let cse_opt = `<button class="more_opt_btn" onclick="moreOptions('cse')">See Options</button>`;
        cse_opt = `<p>You need activate Google CSE to use this feature!</p> <p>${cse_opt}</p>`;
        cse_opt += "<p>Once enabled, simply type: <code><span class='hljs-meta'>s: question</span></code> or <code><span class='hljs-meta'>search: question</span></code> where <span class='hljs-meta'>question</span> is the question the AI will answer based on the results from the web.</p>";
        addWarning(cse_opt, false, 'dialog_warning');
        // toggleAnimation(true);
        toggleAiGenAnimation(false);
        enableChat();
        removeLastMessage();
        return false;
    }

    let term = data.term ?? '';
    if (!term) {
        addWarning('googleSearch() received no search param');
    }
    console.log('Searching for ' + term);
    let gs = new GoogleSearch();
    let results = await gs.search(term);
    let txt_result = '';
    if (results.items) {
        results.items.forEach(item => {
            txt_result += `\n- **Title**: ${item.title}\n- **Snippet**: ${item.snippet}\n\n`;
        })
    } else if (results.text || results.snippets) {
        txt_result += results.text;
        let snippets = '';
        let sp_id = 1;
        results.snippets.forEach(snpt => {
            snippets += `<p>${sp_id}: ${snpt}</p>`;
        })
        txt_result += " \n <b>Snippets</b>: " + snippets;
    } else {
        if (is_cse_active) {
            addWarning('Got no result from Google Search');
        }
        removeLastMessage();
        //toggleAnimation();
        toggleAiGenAnimation()
        enableChat();
        return false;
    }
    //  let last_input = conversations.messages[conversations.messages.length - 1].content;

    let last_input = last_user_input.replace(/^[a-z]+:(.*?)\s/i, " "); // remove cmd
    if (pre_function_text) {
        last_input = pre_function_text;
    }
    let ele = document.querySelector(".message:nth-last-of-type(1)");
    if (ele) {
        let cnt = `${last_input} <details><summary>Search Results [${term}]: </summary>${txt_result}</details>`;
        ele.innerHTML = converter.makeHtml(cnt);
    }
    pre_function_text = '';

    conversations.messages[conversations.messages.length - 1].content = `User prompt: ${last_input} \n respond based on this context: <details><summary>Search Results [${term}]: </summary>${txt_result}</details>`;
    if (chosen_platform === 'google') {
        await geminiChat()
        //toggleAnimation(true);
        toggleAiGenAnimation(false);
    } else {
        await streamChat(false); // false to prevent infinite loop
        //toggleAnimation(true);
        toggleAiGenAnimation(false);

    }

}

function toolHandle(data) {
    if (chosen_platform === 'google') {
        try {
            let fn_name = data.name;
            let arguments = data.args;
            this[fn_name](arguments);
        } catch (error) {
            console.log(error)
        }
    } else if (chosen_platform === 'anthropic') {
        if (data.content?.[0]) {
            let fn_name = data.content[0].name;
            let arguments = data.content[0].input;
            this[fn_name](arguments);
        } else {
            addWarning('A tool was expected, got none.', false)
        }
    } else if (chosen_platform === 'cohere') {
        if (data.message?.tool_calls?.[0]?.function) {
            let fn_name = data.message.tool_calls[0]?.function.name
            let arguments = JSON.parse(data.message.tool_calls[0]?.function.arguments)
            this[fn_name](arguments);
        } else {
            addWarning('A tool was expected, got none.', false)
        }
    } else {
        if (data.choices?.[0]?.message?.tool_calls?.[0]?.function) {
            let tool = data.choices[0].message.tool_calls[0].function;
            let fn_name = tool.name;
            let arguments = JSON.parse(tool.arguments);
            this[fn_name](arguments);
        } else {
            addWarning(data, false);
            // addWarning('A tool was expected, got none.', false)
        }
    }
}

let start_msg = document.querySelector(".start_msg");
let doc_title = document.title;
start_msg.onmouseover = () => {
    document.title = model + ' -> ' + chosen_platform;
    start_msg.title = document.title;
}
start_msg.onmouseleave = () => {
    document.title = doc_title;
    start_msg.removeAttribute('title');
}

chatButton.onmouseover = () => {
    document.title = 'Send to ' + model + ' -> ' + chosen_platform;
}

chatButton.onmouseleave = () => {
    document.title = doc_title;
}

function removeOnlineOfflineMessages() {
    let off_ele = document.querySelectorAll(".offline");
    off_ele.forEach(ele => {
        ele.remove();
    });

    let on_ele = document.querySelectorAll(".online");
    on_ele.forEach(ele => {
        ele.remove();
    })
}

window.addEventListener('online', () => {
    removeOnlineOfflineMessages();
    addWarning("You are online again!", false, 'online')
});

window.addEventListener('offline', () => {
    removeOnlineOfflineMessages();
    addWarning("You are offline!", false, 'offline')
});


function javascriptCodeExecution(obj) {
    //toggleAnimation(true);
    toggleAiGenAnimation(false);
    js_code = obj.code;
    js_code.replace(/\\n/g, "\n")
        .replace(/\\"/g, "'")
        .replace(/\\'/g, "'")
        .replace(/console\.log/g, "")
        .replace(/document\.write/, "")
        .replace("<script>", "")
        .replace("<script", "")
        .replace("</script>", "");
    original_code = obj.code;
    let msg = `The AI want to execute the following code: <div class="center"><button class="accept_code_execution" onclick="executeJsCode(js_code, original_code)">Accept</button></div> <pre class="exclude_btn_group"><code class="javascript language-javascript hljs">${obj.code}</code></pre>`;
    addWarning(msg, false)
    setTimeout(() => {
        hljs.highlightAll();
    }, 500)
}

async function executeJsCode(code, realCode = '') {
    js_code = ''; // reset
    original_code = '' // reset
    let response;
    try {
        response = await jsCodeExecutionSandbox(code);
    } catch (error) {
        response = error;
    }
    if (realCode) {
        // code that will be shown
        code = realCode;
    }
    let timer_jc = setInterval(() => {
        if (js_code_exec_finished) {
            clearInterval(timer_jc);
            chat_textarea.value = `Executing the following code: <pre><code class="javascript language-javascript hljs">${code}</code></pre>\nGot this output:  <span class="js_output">${js_code_exec_output}</span>`;
            document.querySelector("#send").click();
        }
    })
}


async function jsCodeExecutionSandbox(code) {
    js_code_exec_finished = false;
    js_code_exec_output = '';
    let old_iframe = document.querySelector("iframe#sandbox");
    if (old_iframe) {
        old_iframe.remove();
    }
    let results = '';
    const targetOrigin = window.location.origin;
    const iframe = document.createElement("iframe");
    iframe.id = 'sandbox';
    iframe.style.display = 'none';
    iframe.src = "sandbox.html";
    document.body.append(iframe)
    iframe.onload = () => {
        iframe.contentWindow.postMessage({code: code}, targetOrigin);
    };
    window.onmessage = (event) => {
        if (event.data) {
            console.log(event.data)
            let clog = event.data?.args?.[0] ?? false;
            if (clog !== false) {
                clog = stringifyComplexValue(clog)
                results += clog + '<br>';
            } else {
                results += stringifyComplexValue(event.data);
                if (event.data.type === undefined) {
                    js_code_exec_output = results;
                    js_code_exec_finished = true;
                }
            }
        } else {
            js_code_exec_output = results;
            js_code_exec_finished = true;
        }
    }
}

loadPlugins(); // load plugins

function reloadPage() {
    // this code can be used be plugins
    document.location.reload()
}


// When in stream mode the scrolling may get blocked, this should free up the scrolling
function unlockScroll() {
    let chat_msg = document.querySelector("#chat-messages");
    if (chat_msg) {
        let last_position = chat_msg.scrollTop;
        //  chat_msg.addEventListener("keydown", (event) => {
        window.addEventListener("keydown", (event) => {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                if(document.activeElement.value !== ''){
                    return;
                }

            }
            if (event.key === "ArrowDown") {
                if (chat_msg.scrollTop <= last_position) {
                    chat_msg.scrollTop += 30;
                    //console.log('forcing scroll down')
                } else {
                    //  console.log('all fine: down')
                }
                last_position = chat_msg.scrollTop;
            } else if (event.key === "ArrowUp") {
                if (chat_msg.scrollTop >= last_position) {
                    chat_msg.scrollTop -= 30;
                    //console.log('forcing scroll up')
                } else {
                    //console.log('all fine: up')
                }
                last_position = chat_msg.scrollTop;
            }
        })
    }
}

unlockScroll();


function stringifyComplexValue(value, indent = 0) {
    const indentString = "  ".repeat(indent); // Two spaces for indentation
    if (value === null) {
        return "null";
    } else if (typeof value === 'undefined') {
        return "undefined";
    } else if (typeof value !== 'object') { //Handle non-object and non-array values
        return String(value); // Convert to string for non-objects, non arrays and null values
    } else if (Array.isArray(value)) {
        const elements = value.map(item => stringifyComplexValue(item, indent + 1));
        return `[\n${indentString}  ${elements.join(`,\n${indentString}  `)}\n${indentString}]`;
    } else { // Handle objects
        const properties = Object.entries(value)
            .map(([key, val]) => `${indentString}  "${key}": ${stringifyComplexValue(val, indent + 1)}`)
            .join(`,\n`);
        return `{\n${properties}\n${indentString}}`;
    }
}

function whatTimeIsIt() {
    const today = new Date();
    return today.toLocaleDateString(navigator.language) + " " + today.toLocaleTimeString();
}

function extractVideoId(text) {
    let video_id = text.match(/youtube.com\/watch\?v=(.*)/)?.[1] ?? null;
    if (video_id) {
        return video_id.substring(0, 11);
    }
    return null;
}

function loadVideo() {
    let all_user_msgs = document.querySelectorAll(".user");
    if (all_user_msgs.length) {
        let last_user_msg_ele = all_user_msgs[all_user_msgs.length - 1];
        let last_user_msg = last_user_msg_ele.innerHTML;
        let videoId = extractVideoId(last_user_msg);
        if (!videoId) {
            return
        }
        let videoContainer = document.createElement("div");
        videoContainer.className = "video-container";
        const videoFrame = document.createElement("iframe");
        videoFrame.id = "videoFrame";
        videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
        videoContainer.append(videoFrame);
        last_user_msg_ele.prepend(videoContainer)

    }

}


function mediaFull() {
    const all_images = document.querySelectorAll(".user img");
    all_images.forEach(media => {
        media.onclick = () => {
            let newTab = window.open();
            newTab.document.body.innerHTML = `<img src="${media.src}" alt="Imagem Base64">`;
        };
    });
}

mediaFull();


function loadExtraModels() {
    let extra_models = localStorage.getItem("extra_models");
    extra_models = JSON.parse(extra_models);
    for (const provider in extra_models) {
        if (extra_models.hasOwnProperty(provider)) {
            extra_models[provider].forEach(model => {
                let has_model = PLATFORM_DATA[provider].models.includes(model);
                if (!has_model) {
                    PLATFORM_DATA[provider].models.push(model);
                }
            })
        }
    }
}

loadExtraModels();

document.addEventListener('keydown', function (e) {

    let active_tagName = document.activeElement.tagName;

    if (e.shiftKey && e.key.toLowerCase() === 't') {
        // Shift + T to toggle between dark/light theme mode
        if (active_tagName !== 'INPUT' && active_tagName !== 'TEXTAREA') {
            themeToggle();
        }
    }


    if (e.ctrlKey && e.key === 'q') {
        //Closes the current chat and starts a new one
        newChat();
        e.preventDefault();
    } else if (!e.ctrlKey && !e.altKey && e.key) {
        if (active_tagName !== 'INPUT' && active_tagName !== 'TEXTAREA') {
            if (/^[a-zA-Z0-9]$/.test(e.key)) {
                document.getElementById('ta_chat').focus();
            }
        }
    } else if (e.ctrlKey && e.key === 'Delete') {
        let div_topic = document.querySelector(`[data-id='${chat_id}']`);
        if (div_topic) {
            removeChat(div_topic, chat_id, true);
        }
    }


});

function loadUserAddedPrompts() {
    let u_prompt = localStorage.getItem('user_new_prompts');
    if (u_prompt) {
        try {
            u_prompt = JSON.parse(u_prompt);
            u_prompt.forEach(new_prompt => {
                all_prompts.unshift(new_prompt)

            })
        } catch (e) {
            console.error(e)
        }
    }
}

loadUserAddedPrompts()


// returns endpoint address
function getEndpoint() {
    return PLATFORM_DATA[chosen_platform]?.endpoint;
}


function deletePrompt() {
    let sl_prompt = document.querySelector("select[name=prompt]");
    let selectedOption = sl_prompt.options[sl_prompt.selectedIndex];
    if (selectedOption) {
        let created_time = selectedOption.getAttribute('data-created_time');
        if (created_time) {
            created_time = parseInt(created_time);
            let all_user_prompt = localStorage.getItem('user_new_prompts');
            if (all_user_prompt) {
                all_user_prompt = JSON.parse(all_user_prompt);
                for (let i = 0; i < all_user_prompt.length; i++) {
                    if (all_user_prompt[i].created_time === created_time) {
                        all_user_prompt.splice(i, 1);
                        break;
                    }
                }
                localStorage.setItem('user_new_prompts', JSON.stringify(all_user_prompt));

                // update all_prompts removing the prompt deleted
                for (let i = 0; i < all_prompts.length; i++) {
                    if (all_prompts[i].created_time === created_time) {
                        all_prompts.splice(i, 1);
                        break;
                    }
                }

                selectedOption.remove();
                document.querySelector("textarea.system_prompt").value = '';
                savePrompt();
            }

        }
    }

}


function updateChatPlaceholder (){
    let textarea_chat = document.querySelector("#ta_chat");
    if(model){
        let short_model_name = model.replace(/.*\//,""); // eg.: moonshotai/kimi-k2-instruct > kimi-k2-instruct
        textarea_chat.placeholder = `Ask ${short_model_name}`;
    }else {
       textarea_chat.placeholder = 'Ask me something';
    }

}
updateChatPlaceholder();
function themeToggle() {
    let theme_toggle_button = document.querySelector("#theme_toggle");
    let theme = document.querySelector("[data-theme]");
    if (theme) {
        let current_theme = theme.getAttribute("data-theme");
        if (current_theme === 'light') {
            localStorage.setItem('theme', 'light');
            theme_toggle_button.innerText = "Light Mode 🔆";
            theme.setAttribute('data-theme', 'dark');
        } else {
            localStorage.setItem('theme', 'dark');
            theme_toggle_button.innerText = "Dark Mode 🌙";
            theme.setAttribute('data-theme', 'light');

        }
    }
}


function savePreviewCode(event){
    let chat_box = event.target.parentElement.parentElement.parentElement;
    let html_target = event.target.parentElement.parentElement;
    let html_code_to_preview = document.createElement('div');
    html_code_to_preview.innerHTML = html_target.querySelector(".html").innerText;
    let css_elements = html_code_to_preview.querySelectorAll("[rel='stylesheet']");
    let js_elements = html_code_to_preview.querySelectorAll('script[src]:not([src^="http:"]):not([src^="https:"]):not([src^="//"])');
    let css_idx = 0;
    let js_idx = 0;
    chat_box.querySelectorAll(".css").forEach(css=>{
        let css_ele = css_elements[css_idx] ?? '';
        if(css_ele){
            let style_tag = document.createElement('style');
            style_tag.innerHTML = css.innerText;
            css_ele.after(style_tag);
            css_ele.remove();

        }
        css_idx++;
    });

    chat_box.querySelectorAll(".language-javascript").forEach(js=>{
        let js_ele = js_elements[js_idx] ?? '';
        if(js_ele){
            let script_tag = document.createElement('script');
            script_tag.textContent = js.innerText;
            js_ele.after(script_tag);
            js_ele.remove();

        }
        js_idx++;
    });
    localStorage.setItem('preview', html_code_to_preview.innerHTML);
    window.open('experiments/preview','_blank');

}


let theme_toggle_button = document.querySelector("#theme_toggle");
theme_toggle_button.onclick = () => {
    themeToggle();
}

let current_theme = localStorage.getItem('theme');
let theme = document.querySelector("[data-theme]");
if (theme && current_theme) {
    if (current_theme === 'light') {
        theme_toggle_button.innerText = "Light Mode 🔆";
        theme.setAttribute('data-theme', 'dark');
    } else {
        theme_toggle_button.innerText = "Dark Mode 🌙";
        theme.setAttribute('data-theme', 'light');

    }
}


let new_url = document.URL;
let O_URL = new URL(document.URL);
let url_set_model = O_URL.searchParams.get('model')?.trim();
let url_set_platform = O_URL.searchParams.get('platform')?.trim().toLowerCase();
if(url_set_model && url_set_platform){
    url_set_model = url_set_model.replace(/[^a-z0-9._:/-]/ig, '').replaceAll("..","")
    if(PLATFORM_DATA[url_set_platform]){
        model = url_set_model;
        chosen_platform = url_set_platform;
        localStorage.setItem('selected_model', model);
        localStorage.setItem('chosen_platform', chosen_platform);
        endpoint = PLATFORM_DATA[chosen_platform].endpoint;
        localStorage.setItem('endpoint', endpoint)
        api_key = localStorage.getItem(`${chosen_platform}.api_key`);

        let has_model = PLATFORM_DATA[chosen_platform]?.models?.includes(model) ?? false;
        if (!has_model) {
            let extra_models = localStorage.getItem("extra_models");
            if (extra_models === null) {
                extra_models = '{}';
            }
            extra_models = JSON.parse(extra_models);
            if (extra_models[chosen_platform]) {
                extra_models[chosen_platform].push(model);
            } else {
                extra_models[chosen_platform] = [model];
            }
            localStorage.setItem('extra_models', JSON.stringify(extra_models));
            addWarning('New model added successfully!', true, 'success_dialog');
        }


        updateChatPlaceholder();
    }else {
        addWarning('<p>This provider is not valid!</p> <p> Valid providers are: '+Object.keys(PLATFORM_DATA).join(", ")+'</p>')
    }



}
new_url = new_url.split('?')[0];
new_url = new_url.split("#")[0];
new_url += "#" + chat_id;
if(!url_set_model){
    history.pushState({url: new_url}, '', new_url);
}