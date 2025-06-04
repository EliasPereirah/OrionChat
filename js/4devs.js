// Downloads/Upload chat history and configuration
// Please be caution where to keep this files
// the file will be saved in JSON and is not encrypted
// This file will have sensitive info, as your conversations and API key

function downloadChatHistory() {
    let file_name = 'orion_chat_history_backup.json';
    let chatHistory = JSON.stringify(localStorage);
    let file_type = 'application/json';
    try {
        if (chatHistory) {
            chatHistory = JSON.parse(chatHistory);
        } else {
            chatHistory = []; // Return an empty array if no data is found
            addWarning(`No chat history found!`, true, 'fail_dialog');
        }
    } catch (error) {
        console.error("Error parsing JSON from localStorage:", error);
        addWarning("Error loading chat history.  The data in localStorage may be corrupted.", false, 'fail_dialog');
        return; // Stop execution if parsing fails
    }


    const jsonBlob = new Blob([JSON.stringify(chatHistory, null, 2)], {type: file_type});
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file_name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addWarning("Be careful where you save this file, as it contains your secret API keys and private conversations with the AI", false);

}


// Restores chat history from a JSON file
function restoreChatHistory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                let chatHistory = JSON.parse(e.target.result);
                for (let idx in chatHistory) {
                    localStorage.setItem(idx.toString(), chatHistory[idx]);
                }
                addWarning("Chat history restored successfully!", true, 'success_dialog');
                setTimeout(()=>{
                    reloadPage();
                },3500)
            } catch (error) {
                console.error("Error parsing JSON file:", error);
                addWarning("Error restoring chat history.  Please make sure you selected a valid JSON file.", false, 'fail_dialog');
            }
        };
        reader.readAsText(file);
    };
    input.click();

}
