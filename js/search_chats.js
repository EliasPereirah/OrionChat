let input_search = document.querySelector("#input_search");

function escapeRegExp(string) {
    if (string === null || string === undefined) {
        return '';
    }
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function openOldChat(chat_id) {
    let chat = document.querySelector("[data-id='" + chat_id + "']");
    if(chat){
        closeDialogs();
        if(can_delete_history){
            // avoid deleting chat if can_delete_history is true
            can_delete_history = false;
            chat.click();
            can_delete_history = true;
        }else {
            chat.click();
        }

    }
}

function getAllChats() {
    let all_chats = [];
    let ids = [];
    let total_chats = 0;
    for (let i = 0; i < localStorage.length; i++) {
        let id = localStorage.key(i);
        id = parseInt(id);
        if (!isNaN(id)) {
            ids.push(id);
        }
    }
    ids.sort((a, b) => b - a);  // descendent order
    let all_keys = [];

    ids.forEach(key => {
        all_keys.push(key);
        total_chats++;
    })
    all_keys.forEach(id => {
        let msg;
        try {
            msg = JSON.parse(localStorage.getItem(id))?.messages ?? '';
            if (msg !== '') {
                all_chats.push({id: id, msg: msg});
            }
        } catch (error) {
            console.error('Error parser to JSON: ' + error)
        }

    });
    return all_chats;
}


function searchPastChats(query) {
    query = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    query = query.trim();
    let original_query = query;
    if (query === "") {
        console.log("Empty query");
        return [];
    }
    query = ` ${query} `; // space
    query = query.replace(/\s[a-z]{1,2}\b/gi, " ").replace(/\s+/g, " ").trim();
    if (query === "") {
        if(original_query === ''){
            addWarning(`Please enter at least 3 characters to search!`, true, 'fail_dialog');

        }
        return [];
    }
    const all_chats = getAllChats();
    let escapedQuery = escapeRegExp(query);
    escapedQuery = escapedQuery.replace(/\s+/g, '|');

    const regex = new RegExp(escapedQuery, 'gi');
    console.log(`Searching for: "${query}" (Regex: /${escapedQuery}/gi)`);
    const chatScores = [];
    all_chats.forEach((chat, chatIndex) => {
        let matchesInChatCount = 0;
        let first_msg = '';
        chat.msg.forEach(msg => {
            let msg_cnt = msg?.content ?? '';
            let cnt = msg_cnt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            if (first_msg === '') {
                first_msg = msg_cnt;
            }
            if (cnt) {
                const currentMatches = cnt.match(regex);
                if (currentMatches) {
                    if (msg.role === 'user') {
                        matchesInChatCount += (currentMatches.length + 15);
                        if(first_msg !== ''){
                            matchesInChatCount += 30;
                        }
                    }else {
                        matchesInChatCount += currentMatches.length;
                    }
                }
            }

        });

        if (matchesInChatCount > 0) {
            chatScores.push({
                chat_id: chat.id,
                match_count: matchesInChatCount,
                recency_score: chatIndex,
                first_msg: first_msg
            });
        }
    });

    chatScores.sort((a, b) => {
        if (b.match_count !== a.match_count) {
            return b.match_count - a.match_count;
        }
        return a.recency_score - b.recency_score;
    });
    let  results = chatScores.map(score => ({id: score.chat_id, matches: score.match_count, first_msg: score.first_msg}));
    if(results.length === 0){
        closeDialogs();
        addWarning(`No results found for "${query}"`, true, 'fail_dialog');
    }
    return results;
}
let search_timer;
input_search.onkeyup = () => {
    if(typeof search_timer !== 'undefined'){
        clearTimeout(search_timer);
    }
    search_timer = setTimeout(() => {
        console.log('searching...');
        let search_query = input_search.value.trim();
        let search_results = searchPastChats(search_query);
        if (search_results.length > 0) {
            let div_show = document.createElement('div');
            let idx = 0;
            search_results.forEach(result => {
                idx++;
                if(idx > 25){
                    return;
                }
                let past_seconds = (new Date().getTime() - parseInt(result.id)) / 1000;
                let past_days = past_seconds / 86400;
                let date_info = '';
                if(past_days > 1){
                   if(past_days >= 2){
                       date_info = `<div class="date_info">${past_days.toFixed(0)} days ago</div>`;
                   }else {
                       date_info = `<div class="date_info">1 day ago</div>`;
                   }
                }else {
                    let past_hours = past_seconds / (60 * 60);
                    if(past_hours > 1){
                        date_info = `<div class="date_info">${past_hours.toFixed(0)} hours ago</div>`;
                    }else {
                        date_info = `<div class="date_info">Minutes ago</div>`;
                    }
                }
                let open_chat = document.createElement('div');
                open_chat.setAttribute('chat_id', result.id);
                open_chat.innerHTML = result.first_msg;
                open_chat.querySelector('details')?.remove();
                open_chat.querySelector('iframe')?.remove();
                open_chat.querySelector('img')?.remove();
                open_chat.querySelector('video')?.remove();
                open_chat.querySelector('audio')?.remove();
                if(open_chat.innerText.length > 137){
                    open_chat.innerText = open_chat.innerText.substring(0, 133) + '...';
                }else if(open_chat.innerText.trim().length ===0){
                    open_chat.innerText = 'Click to view';
                }
                open_chat.innerHTML += date_info;
                open_chat.classList.add('result_item');
                open_chat.setAttribute('onclick', `openOldChat(${result.id})`);
                div_show.appendChild(open_chat);
            })
            let show_html = `<div><p class="search_header">Search results in your chat history</p></div>`;
            show_html += div_show.innerHTML;
            closeDialogs();
            createDialog(show_html, 0, 'search_results');
        }
    }, 500)
}