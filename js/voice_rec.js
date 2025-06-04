let stream = null;
let audioContext = null;
let source = null;
let mediaRecorder = null;
let audioChunks = [];
let audioOutput = document.createElement("audio");
async function recordVoice() {
    if (!stream) {
        // Start stream
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new AudioContext();
            source = audioContext.createMediaStreamSource(stream);
            // source.connect(audioContext.destination);
            //audioOutput.srcObject = stream;
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.onstop = handleStop;
            mediaRecorder.start();
            toggleRecAnimation("flex");
        } catch (err) {
            console.error('Error:', err);
        }
    }
}

function toggleRecAnimation(display = '') {
    let rec_animation = document.querySelector(".recording-animation");
    if(display){
        rec_animation.style.display = display;
    }else {
        if(rec_animation.style.display === "none"){
            rec_animation.style.display = "flex";
        }else {
            rec_animation.style.display = "none";
        }
    }
}

function stopRecorder() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    if (source) {
        source.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
    if(stream && stream.getTracks){
        stream.getTracks().forEach(track => track.stop());
    }
    stream = null;
    audioContext = null;
    source = null;
    audioOutput.srcObject = null;
    toggleRecAnimation("none");
}

function handleDataAvailable(event) {
    if(event.data.size > 0){
        audioChunks.push(event.data);
    }

}

function handleStop() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    audioChunks = [];
    blobToBase64(audioBlob).then(base64Audio =>{
        base64String = base64Audio;
        transcribeAudioFromRecording();
    });
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            let b64String = reader.result.split(',')[1];
            resolve(b64String);
        };
        reader.readAsDataURL(blob);
    });
}
