let past_nuggets = localStorage.getItem('nuggets');
past_nuggets = past_nuggets ? JSON.parse(past_nuggets) : [];
let nugget_task = localStorage.getItem('nugget_task') || '';
let nugget_topic = localStorage.getItem('nugget_topic') || '';
let nuggets_conversations = {};
nuggets_conversations.messages = [];

function showNuggets(text){
    if(past_nuggets.length > 21){
        past_nuggets.shift(); // For token saving, a maximum of 21 nuggets will be sent to the AI.
    }
    past_nuggets.push(text);
    localStorage.setItem("nuggets", JSON.stringify(past_nuggets));
    let show_text = `<p class="p_big">${nugget_topic}</p><p>${text}</p> <p><button class="discreet_button" onclick="goNuggets()">Manage Nuggets</button></p>`;
    addWarning(show_text, false, 'nuggets_dialog');
}





function generateNewNugget() {
    nuggets_conversations.messages = [];

    past_nuggets.forEach(nug => {
        nuggets_conversations.messages.push({
            "role": "user",
            "content": "Go:"
        });
        nuggets_conversations.messages.push({
            "role": "assistant",
            "content": nug
        });

    })

    if(nugget_task.trim() !== ""){
        if (chosen_platform === 'google') {
            return nuggetGeminiChat();
        }
        return nuggetStreamChat();
    }else {
        console.log('No nugget task');
    }
}






function nuggetGeminiChat(fileUri = '', with_stream = true, the_data = '') {
    let all_parts = [];
    if(nuggets_conversations.messages.length > 0){
        nuggets_conversations.messages.forEach(part => {
            let role = part.role === 'assistant' ? 'model' : part.role;
            all_parts.push({
                "role": role,
                "parts": [
                    {
                        "text": part.content
                    }
                ]
            });
        })
    }

    all_parts.push({
        "role": 'user',
        "parts": [
            {
                "text": "Go:"
            }
        ]
    });


    let data = {
        "contents": [all_parts]
    };

    if (nugget_task) {
        data.systemInstruction = {
            "role": "user",
            "parts": [
                {
                    "text": nugget_task
                }
            ]
        };
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

    if (the_data) {
        data = the_data;
    }


    if (with_stream) {
        return nuggetGeminiStreamChat(fileUri, data);
    }

    let gemini_endpoint = endpoint.replaceAll("{{model}}", model);
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
            if (typeof data === "object") {
                try {
                    text = data.candidates[0].content.parts[0]?.text ?? '';

                    if (!text) {
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
                    try {
                        // Verify if it is an error with the api key being not valid
                        let tt = data.error.message;
                        if (tt.match(/API key not valid/)) {
                            invalid_key = true;
                        }
                    } catch {
                        console.error('Ops error, no: data.error.message')
                    }
                }
            } else {
                text = data;
            }
            if (text !== '') {
                showNuggets(text);
            }

        })
        .catch(error => {
            addWarning('Nuggets Error: ' + error, false);
        })


}


async function nuggetStreamChat() {
    let first_response = true;
    let all_parts = [];
    let system_prompt_text = nugget_task;
    if (system_prompt_text) {
        let system_prompt = {content: system_prompt_text, 'role': 'system'};
        if (chosen_platform !== 'anthropic') {
            all_parts.push(system_prompt);
        }
    }



    nuggets_conversations.messages.forEach(part => {
            let cnt = part.content;
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


    let data =
        {
            model: model,
            stream: true,
            messages: all_parts,
        }
    if (chosen_platform === 'anthropic') {
        data.max_tokens = 8192;
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

    if (chosen_platform === 'groq' && model.match(/deepseek-r1/)) {
        data.reasoning_format = 'parsed';
    }

    const requestOptions = {
        method: 'POST',
        headers: HTTP_HEADERS,
        body: JSON.stringify(data)
    };


    endpoint = getEndpoint();

    try {
        const response = await fetch(endpoint, requestOptions);
        if (!response.ok) {
            response.json().then(data => {
                setTimeout(() => {
                    console.error("Error: Nuggets Error");
                    addWarning(data);
                }, 500)
            })
            return false;
        }


        story = '';
        story_reasoning = '';
        let cloned_response = response.clone();
        const reader = response.body.getReader();
        let buffer = '';
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                if (story === '') {
                    cloned_response.json().then(data => {
                        processFullData(data);
                        if (story) {
                            showNuggets(story);
                        } else {
                            // probably not stream - tool use
                            return false;
                        }
                    }, error => {
                        addWarning(error)
                        console.error("Error: Nuggets Error");
                    })

                } else {
                    processBuffer(buffer);
                    showNuggets(story);
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
                            console.error("Nuggets JSON error: ", jsonError);
                        }
                    }
                }
            }

            let full_story = `${story_reasoning}${story}`.trim();
            if (story.trim() && story_reasoning.trim()) {
                full_story = `<details><summary>See Reasoning</summary>${story_reasoning}</details>${story}`;
            }
            if (first_response) {
                first_response = false;
            }

        }

    } catch (error) {
        console.error("Nuggets Error:", error);
        if (error === {}) {
            error = 'Error: {}';

        }
        addWarning(error, false)
    }
}


async function nuggetGeminiStreamChat(fileUri, data) {

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
                    console.error("Error: Nuggets Error");
                    addWarning(data);
                }, 500)
            })
            return false;
        }
        const reader = the_response.body.getReader();
        story = '';

        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                if (story) {
                    showNuggets(story)
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
                        console.error("Nuggets Error:", error);
                    }
                }
            });
            if (first_response) {
                first_response = false;
            }
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
                nuggets_conversations.messages[nuggets_conversations.messages.length - 1].content = story.replace(/<img[^>]*>/g, '');
            }
        } // end has_chunk_error

        all_chunks = [];

    } catch (error) {
        console.error("Nuggets error:", error);
        addWarning('Error: ' + error.message)
    }
}


const date = new Date();

const day = date.getDate();
const month = date.getMonth() + 1; // Somar 1 porque os meses começam em 0
const year = date.getFullYear();
let today_date = `${month}/${day}/${year}`;

let last_nugget_day = localStorage.getItem('last_nugget_day') || '';
if(last_nugget_day !== today_date){
    localStorage.setItem('last_nugget_day', today_date);
    generateNewNugget();
}





