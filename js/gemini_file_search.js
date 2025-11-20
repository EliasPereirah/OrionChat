class GeminiFileSearchApiClient {
    static API_BASE_URL = 'https://generativelanguage.googleapis.com';
    static API_VERSION = 'v1beta';

    constructor(apiKey) {
        if (!apiKey) throw new Error('An API key is required.');
        this.apiKey = apiKey;
    }

    async createStore(displayName) {
        const url = `${GeminiFileSearchApiClient.API_BASE_URL}/${GeminiFileSearchApiClient.API_VERSION}/fileSearchStores?key=${this.apiKey}`;
        return this._makeRequest(url, 'POST', { displayName });
    }

    async listStores() {
        const url = `${GeminiFileSearchApiClient.API_BASE_URL}/${GeminiFileSearchApiClient.API_VERSION}/fileSearchStores?key=${this.apiKey}`;
        return this._makeRequest(url, 'GET');
    }

    async deleteStore(storeName, force = true) {
        const url = `${GeminiFileSearchApiClient.API_BASE_URL}/${GeminiFileSearchApiClient.API_VERSION}/${storeName}?key=${this.apiKey}&force=${force}`;
        return this._makeRequest(url, 'DELETE');
    }

    async listDocumentsInStore(storeName) {
        const url = `${GeminiFileSearchApiClient.API_BASE_URL}/${GeminiFileSearchApiClient.API_VERSION}/${storeName}/documents?key=${this.apiKey}`;
        return this._makeRequest(url, 'GET');
    }

    async deleteDocumentInStore(documentName) {
        const url = `${GeminiFileSearchApiClient.API_BASE_URL}/${GeminiFileSearchApiClient.API_VERSION}/${documentName}?key=${this.apiKey}`;
        return this._makeRequest(url, 'DELETE');
    }

    async uploadFileToStore(storeName, fileObject) {
        if (!(fileObject instanceof File)) throw new Error("Invalid File object.");

        const fileSize = fileObject.size;
        let mimeType = fileObject.type || "application/octet-stream";

        // 1. Start Resumable Upload
        const startUrl = `${GeminiFileSearchApiClient.API_BASE_URL}/upload/${GeminiFileSearchApiClient.API_VERSION}/${storeName}:uploadToFileSearchStore?key=${this.apiKey}`;

        const startResponse = await fetch(startUrl, {
            method: 'POST',
            headers: {
                'X-Goog-Upload-Protocol': 'resumable',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-Header-Content-Length': fileSize.toString(),
                'X-Goog-Upload-Header-Content-Type': mimeType,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "document": { "displayName": fileObject.name } })
        });

        if (!startResponse.ok) throw new Error(`Erro Start Upload: ${startResponse.status}`);
        const uploadUrl = startResponse.headers.get('x-goog-upload-url');

        // 2. Upload Bytes
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Content-Length': fileSize.toString(),
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize'
            },
            body: fileObject
        });

        if (!uploadResponse.ok) throw new Error(`Error Upload Bytes: ${uploadResponse.status}`);
        return await uploadResponse.json();
    }

    async generateContent(prompt, storeNames, model = 'gemini-2.5-flash') {
        const url = `${GeminiFileSearchApiClient.API_BASE_URL}/${GeminiFileSearchApiClient.API_VERSION}/models/${model}:generateContent?key=${this.apiKey}`;
        const payload = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            tools: [{ file_search: { file_search_store_names: storeNames } }]
        };
        return this._makeRequest(url, 'POST', payload);
    }

    async _makeRequest(url, method, data = null) {
        const config = { method, headers: { 'Content-Type': 'application/json' } };
        if (data) config.body = JSON.stringify(data);

        const response = await fetch(url, config);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message || 'Unknown API error');
        return json;
    }
}