let tools_list = {};

/* OpenAI compatible tool/functions */
tools_list.openai_compatible = {
    googleSearch: {
        "type": "function",
        "function": {
            "name": "googleSearch",
            "description": "Search for a term in Google Search. Call this whenever you need to make a search on Google, for example when a customer asks 'What is the news today' or something like 'Nvidia stock price today'",
            "parameters": {
                "type": "object",
                "properties": {
                    "term": {
                        "type": "string",
                        "description": "The term to be searched on Google"
                    }
                },
                "required": ["term"],
                "additionalProperties": false
            }
        },
        "strict": true
    },
    youtubeCaption : {
        "type": "function",
        "function": {
            "name": "youtubeCaption",
            "description": "Extracting subtitles from a YouTube video. This function should be called when the user enters some YouTube video URL.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The YouTube URL"
                    }
                },
                "required": ["url"],
                "additionalProperties": false
            }
        },
        "strict": true
    },

    javascriptCodeExecution: {
        "type": "function",
        "function": {
            "name": "javascriptCodeExecution",
            "description": "Use this function to interact with the user's computer by executing JavaScript code.",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "The code to be executed in the user browser. The response will be returned to you"
                    }
                },
                "required": ["code"],
                "additionalProperties": false
            }
        },
        "strict": true
    }
}




/* Google Gemini compatible tool/functions */
tools_list.google_compatible = {
    googleSearch: {
            "functionDeclarations": [
                {
                    "name": "googleSearch",
                    "description": "Search for a term in Google Search. Call this whenever you need to make a search on Google, for example when a customer asks 'What is the news today' or something like 'Nvidia stock price today'",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "term": {
                                "type": "string"
                            }

                        },
                        "required": [
                            "term"
                        ]
                    }
                }
            ]
        },

    youtubeCaption: {
        "functionDeclarations": [
            {
                "name": "youtubeCaption",
                "description": "Extracting subtitles from a YouTube video. This function should be called when the user enters some YouTube URL",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "url"
                    ]
                }
            }
        ]
    },
    javascriptCodeExecution: {
        "functionDeclarations": [
            {
                "name": "javascriptCodeExecution",
                "description": "Use this function to interact with the user's computer by executing JavaScript code.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "code": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "code"
                    ]
                }
            }
        ]
    }
}


/* Anthropic compatible tool */
tools_list.anthropic_compatible = {
    googleSearch: {
        "name": "googleSearch",
        "description": "Search for a term in Google Search. Call this whenever you need to make a search on Google, for example when a customer asks 'What is the news today' or something like 'Nvidia stock price today'",
        "input_schema": {
            "type": "object",
            "properties": {
                "term": {
                    "type": "string",
                    "description": "The term to be searched on Google"
                }
            },
            "required": ["term"]
        }
    },
    youtubeCaption: {
        "name": "youtubeCaption",
        "description": "Extracting subtitles from a YouTube video. This function should be called when the user enters some YouTube URL",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The YouTube URL"
                }
            },
            "required": ["url"]
        }
    },
    javascriptCodeExecution: {
        "name": "javascriptCodeExecution",
        "description": "Use this function to interact with the user's computer by executing JavaScript code.",
        "input_schema": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The code to be executed in the user browser. The response will be returned to you"
                }
            },
            "required": ["code"]
        }
    }
};



tools_list.cohere_compatible = {
    googleSearch: {
        "type": "function",
        "function": {
            "name": "googleSearch",
            "description": "Search for a term in Google Search. Call this whenever you need to make a search on Google, for example when a customer asks 'What is the news today' or something like 'Nvidia stock price today'",
            "parameters": {
                "type": "object",
                "properties": {
                    "term": {
                        "type": "string",
                        "description": "The term to be searched on Google"
                    }
                },
                "required": ["term"]
            }
        }
    },
    youtubeCaption: {
        "type": "function",
        "function": {
            "name": "youtubeCaption",
            "description": "Extracting subtitles from a YouTube video. This function should be called when the user enters some YouTube URL",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The YouTube URL"
                    }
                },
                "required": ["url"]
            }
        }
    },


    javascriptCodeExecution: {
        "type": "function",
        "function": {
            "name": "javascriptCodeExecution",
            "description": "Use this function to interact with the user's computer by executing JavaScript code.",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "The code to be executed in the user browser. The response will be returned to you"
                    }
                },
                "required": ["code"]
            }
        }
    },
}