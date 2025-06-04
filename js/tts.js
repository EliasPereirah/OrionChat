// Text-to-Speech With ElevenLabs
let voice_id  = "pFZP5JQG7iQjIQuC4Bku"; // Lily - ElevenLabs voice_id
// More voices here: https://elevenlabs.io/docs/product/voices/default-voices
let elabs_api_key = localStorage.getItem("elabs_api_key");
let audio_in_queue = false;

function genAudio(text, div){
    let already_generated = false;
    let audio_elem = document.createElement('audio'); // clean old audio
    let audio_button_ele = document.createElement('button');
    audio_button_ele.className = 'play_audio_btn';
    audio_button_ele.setAttribute('aria-label','Read aloud');

    if(audio_in_queue){
        console.warn('There is an audio on queue');
        return false;
    }
    let audio_feature_enabled = localStorage.getItem('audio_feature');
    if(audio_feature_enabled !== '1'){
        return false;
    }
    if(!div){
        console.log('empty div')
        return false;
    }
    div.append(audio_button_ele);

    if(!elabs_api_key){
        console.error('No API key defined for ElevenLabs')
        return false;
    }
    audio_button_ele.onclick = ()=>{
        if(already_generated){
            if(audio_elem.paused){
                audio_elem.play();
                audio_button_ele.classList.add('pause_audio_btn')
                audio_button_ele.classList.remove('play_audio_btn');
            }else {
                audio_elem.pause();
                audio_button_ele.classList.add('play_audio_btn');
                audio_button_ele.classList.remove('pause_audio_btn')

            }
            return false;
        }
        already_generated = true;
        const fields = {
            text: text,
           // model_id: "eleven_multilingual_v2",
            model_id: "eleven_flash_v2_5",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        };
        let endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
        audio_in_queue = true;
        fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": `${elabs_api_key}`
            },
            body: JSON.stringify(fields)
        })
            .then(response => {
                if (!response.ok) {
                    showError(response)
                    throw new Error(response.status.toString());
                }
                return response.arrayBuffer();
            })
            .then(audioData => {
                const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audio_elem = new Audio(audioUrl);
                audio_elem.className = 'eleven_audio';
                audio_elem.play().finally(()=>{
                    audio_in_queue = false;
                });
                audio_button_ele.classList.add('pause_audio_btn')
                audio_button_ele.classList.remove('play_audio_btn');


                audio_elem.addEventListener('ended', () => {
                    audio_button_ele.classList.add('play_audio_btn');
                    audio_button_ele.classList.remove('pause_audio_btn')
                });

                audio_elem.addEventListener('pause', () => {
                    audio_button_ele.classList.add('play_audio_btn');
                    audio_button_ele.classList.remove('pause_audio_btn');

                });

                audio_elem.addEventListener('play', () => {
                    audio_button_ele.classList.remove('play_audio_btn');
                    audio_button_ele.classList.add('pause_audio_btn')

                });

            })
            .catch(error => {
                already_generated = false;
                audio_in_queue = false;
                addWarning('Unable to generate audio. '+error,true);
            });
    }
}

function showError(response){
    response.json().then(data=>{
        addWarning(data);
    })
}