// Speech-to-Text
let media_file = '';
let input_file = '';
let groq_api_key = '';
async function transcribeAudio() {
    base64String = '';
    toggleAiGenAnimation();
    toggleAnimation();
    if (!media_file) {
        let input_file = document.querySelector('#fileInput');
        media_file = input_file.files[0];
    }
    const apiUrl = 'https://api.groq.com/openai/v1/audio/transcriptions';

    const formData = new FormData();
    formData.append('file', media_file);
    formData.append('model', 'whisper-large-v3-turbo');
    // formData.append('temperature', '0');
    formData.append('response_format', 'json');
    //formData.append('language', 'en');
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groq_api_key}`,
            },
            body: formData
        });



        const result = await response.json();
        toggleAiGenAnimation();
        toggleAnimation();
        let text = result.text ?? '';
        if (text) {
            media_file = '';
            input_file.value = '';
            text = "<b>transcription.txt </b>:\n```text\n" + text + "\n```";
            text = converter.makeHtml(text);
            addConversation("assistant", text);
            hljs.highlightAll();
            setTimeout(() => {
                enableCopyForCode();
            }, 1000)
        } else {
            let err_code = result.error?.code ?? '';
            if(err_code === 'invalid_api_key'){
                addWarning('Please add a valid <a target="_blank" href="https://console.groq.com/keys">Groq API</a> to use this functionality.');
            }else {
                let res_text = JSON.stringify(result);
                addWarning("<b>Groq transcription error:</b> "+res_text);
                console.log('not expected result: '+result)
            }


        }
        media_file = '';
        input_file.value = '';
    } catch (error) {
        addWarning(error);
        console.error(error)
        toggleAiGenAnimation(false)
        media_file = '';
        input_file.value = '';
    }finally {
        removeAttachment();
    }

}

input_file = document.querySelector('#fileInput');
if (input_file) {
    groq_api_key = localStorage.getItem("groq.api_key");
    if(groq_api_key){
        input_file.addEventListener('change', () => {
            media_file = input_file.files[0];
            let media = media_file.type.split("/")[0] ?? '';
            if (media === 'audio' || media === 'video') {
                let msg = `<p>I noticed you added some ${media}. Would you like to transcribe it with Groq/Whisper?</p>
<p><button class="btn_special" onclick='transcribeAudio();closeDialogs();'>Yes</button><br>
<button class="btn_special" onclick='closeDialogs();'>No</button></p>`;
                addWarning(msg,false)
            }
        });
    }
}




async function transcribeAudioFromRecording() {
    toggleAiGenAnimation()
    const apiUrl = 'https://api.groq.com/openai/v1/audio/transcriptions';
    const formData = new FormData();
    const audioBlob = base64toBlob(base64String, 'audio/wav');
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model', 'whisper-large-v3-turbo');
    // formData.append('temperature', '0');
    formData.append('response_format', 'json');
    //formData.append('language', 'en');
    base64String = '';
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groq_api_key}`,
            },
            body: formData
        });

        const result = await response.json();
        toggleAiGenAnimation();
        let text = result.text ?? '';
        if (text) {
            //addConversation("assistant", text);
            chat_textarea.value = text;
            startChat();
            toggleBtnOptions();
        } else {
            let err_code = result.error?.code ?? '';
            if(err_code === 'invalid_api_key'){
                addWarning('Please add a valid <a target="_blank" href="https://console.groq.com/keys">Groq API</a> to use this functionality.');
            }else {
                let res_text = JSON.stringify(result);
                addWarning("<b>Groq transcription error:</b> "+res_text);
                console.log('not expected result: '+result)
            }
            toggleBtnOptions();
        }
    } catch (error) {
        addWarning(error);
        console.error(error)
        toggleAiGenAnimation(false)
        toggleBtnOptions();
    }finally {
        media_file = '';
        input_file.value = '';
    }

}

function base64toBlob(base64, mimeType) {
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([intArray], { type: mimeType });
}