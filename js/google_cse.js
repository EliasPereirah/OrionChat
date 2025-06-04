class GoogleSearch {
    constructor() {
        this.search_results = {};
    }

    /**
     * Unless rag_endpoint is set the search will only return title and snippet from Google results.
     **/
    async search(term, max_results = 10, start = 0) {
        let use_rag_endpoint = localStorage.getItem('use_rag_endpoint');
        if(use_rag_endpoint == null){
            ragEndpointDialog();
            toggleAiGenAnimation(false)
            removeLastMessage();
            enableChat();
            return false;
        }
        if (use_rag_endpoint === 'yes') {
            // advanced search
            return this.advancedSearch(term, 5);
        }
        let cse_active = await gcseActive();
        if (!cse_active) {
            addWarning('Google Custom Search Is Not Active!')
            return false;
        }

        let GOOGLE_SEARCH_API_KEY = localStorage.getItem('cse_google_api_key')
        let GOOGLE_SEARCH_CX = localStorage.getItem('cse_google_cx_id')

        if (max_results > 10) {
            throw new Error('max result per page is 10.');
        }
        if (start > 91) {
            throw new Error('Is not possible to list more then 100 results, start= 91 is the max possible');
        }

        const encodedTerm = encodeURIComponent(term);
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_CX}&q=${encodedTerm}&num=${max_results}&start=${start}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) {
                addWarning('Google CSE -> Error details: ' + JSON.stringify(data));
                console.error('Google CSE -> Error details:', data.error);
            }
            return this.search_results = data || {};
        } catch (error) {
            throw new Error(`Fetch Error: ${error.message}`);
        }
    }


    async advancedSearch(term, max_results = 5) {
        let is_cse_active = await gcseActive();
        let rag_endpoint = localStorage.getItem("rag_endpoint");

        if (!is_cse_active && !rag_endpoint) {
            moreOptions('cse')
            addWarning('Please set Google CSE API key and CX ID');
            toggleAiGenAnimation(false)
            enableChat();
            removeLastMessage();
            return false;
        }

        let GOOGLE_SEARCH_API_KEY = localStorage.getItem('cse_google_api_key')
        let GOOGLE_SEARCH_CX = localStorage.getItem('cse_google_cx_id')

        if (max_results > 10) {
            max_results = 10;
        }

        if (!rag_endpoint) {
            addWarning("No [rag_endpoint] found!");
            return false;
        }


        let lang = navigator.language.split("-")[0];
        let body_data = {
            query: term,
            //GOOGLE_SEARCH_API_KEY: GOOGLE_SEARCH_API_KEY,
            //GOOGLE_SEARCH_CX: GOOGLE_SEARCH_CX,
            max_results: max_results,
            language: lang
        };

        try {
            const response = await fetch(rag_endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(body_data)
            });
            const data = await response.json();
            if (data.error) {
                addWarning('Advanced Search Error: ' + JSON.stringify(data));
                console.error('Advanced Search Error:', data.error);
            }
            return this.search_results = data || {};
        } catch (error) {
            throw new Error(`Fetch Error: ${error.message}`);
        }
    }


}