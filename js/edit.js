let edit_url = new URL(document.URL);
chat_id = edit_url.searchParams.get('chat_id')?.trim();
let chat_data = localStorage.getItem(chat_id);
let form_ele = document.createElement('div');
form_ele.id = 'my_form';
let edit_task = document.querySelector('#edit_task');

if (chat_data) {
    chat_data = JSON.parse(chat_data);
    let txt_area,delete_btn, block;
    let idx = 0;
    chat_data.messages.forEach(data=>{
        block = document.createElement('div');
        block.innerHTML = data.role+":";
        block.classList.add('block');
        txt_area = document.createElement('textarea');
        txt_area.oninput = ()=>{
            document.querySelector("#save_changes").classList.add('save')
        }
        delete_btn = document.createElement('button');
        delete_btn.innerText = 'Delete';
        let part_id = idx;
        let block_rm = block;
        delete_btn.addEventListener('click',()=>{
            removeChatPart(part_id, block_rm);
        })
        idx++;

        let tot_lines = data.content.match(/\n/g)?.length ?? 0;
        if(tot_lines > 2){
            let px = tot_lines * 16;
            if(px > 90){
                px = 90;
            }
            txt_area.style.height = `${px}px`;
        }
        txt_area.value = data.content;
        txt_area.setAttribute('data-role',data.role);
        block.appendChild(txt_area);
        block.append(delete_btn);
        form_ele.append(block)
    })
    edit_task.append(form_ele)

}else {
    console.log('no chat data')
}

function removeChatPart(id, block){
    block.remove();
    chat_data.messages.splice(id, 1);
    localStorage.setItem(chat_id, JSON.stringify(chat_data));
}

function saveChanges(){
    let all_inputs = document.querySelectorAll('#my_form textarea');
    let new_messages = [];
    all_inputs.forEach(input=>{
        if(input.value.trim() !== ""){
            let role = input.getAttribute('data-role');
            let part = {'role': role, content: input.value};
            new_messages.push(part);
        }
    })
    chat_data.messages = new_messages;
    localStorage.setItem(chat_id, JSON.stringify(chat_data));
    window.open('../../#'+chat_id, '_self');

}


function addField(){
    const all_textarea = document.querySelectorAll('#edit_task textarea');
    const lastTextarea = all_textarea[all_textarea.length - 1];
    let role = 'user';
    if(lastTextarea.getAttribute('data-role') === 'user'){
        role = 'assistant';
    }
    let ta,del_button, div_block;
    let idx = chat_data.messages.length - 1;
    div_block = document.createElement('div');
    div_block.innerHTML = role+":";
    div_block.classList.add('block');
    ta = document.createElement('textarea');
    ta.oninput = ()=>{
        document.querySelector("#save_changes").classList.add('save')
    }
    del_button = document.createElement('button');
    del_button.innerText = 'Delete';
    let part_id = idx;
    del_button.addEventListener('click',()=>{
        removeChatPart(part_id, div_block);
    })
    idx++;

    ta.setAttribute('data-role', role);
    div_block.appendChild(ta);
    div_block.append(del_button);
    form_ele.append(div_block)
    ta.scrollIntoView();
}