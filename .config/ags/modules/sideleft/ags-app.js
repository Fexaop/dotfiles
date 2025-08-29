// search.js
import Service from 'resource:///com/github/Aylur/ags/service.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

// Custom Service to handle API calls
const SearchService = new Service({
    'available': false,
    'loading': false,
    'response': null,
    'error': null,
    'query': '',
});

// API call function
async function queryAPI(question) {
    SearchService.loading = true;
    SearchService.error = null;
    
    try {
        const response = await fetch('http://localhost:8000/query/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });

        if (!response.ok) throw new Error('Failed to fetch response');
        
        const data = await response.json();
        SearchService.response = {
            ...data,
            timestamp: Date.now(),
        };
    } catch (error) {
        SearchService.error = error.message;
    } finally {
        SearchService.loading = false;
    }
}

// Main Widget
export default () => Widget.Box({
    vertical: true,
    className: 'search-widget',
    children: [
        // Search Input
        Widget.Box({
            children: [
                Widget.Entry({
                    onChange: ({ text }) => SearchService.query = text,
                    placeholder: 'Ask me anything...',
                }),
                Widget.Button({
                    label: 'Search',
                    onClicked: () => {
                        if (SearchService.query) {
                            queryAPI(SearchService.query);
                        }
                    },
                }),
            ],
        }),

        // Loading Indicator
        Widget.Revealer({
            revealChild: SearchService.bind('loading'),
            child: Widget.Label({
                label: 'Processing...',
                className: 'loading-indicator',
            }),
        }),

        // Error Display
        Widget.Revealer({
            revealChild: SearchService.bind('error'),
            child: Widget.Label({
                label: SearchService.bind('error').transform(e => e || ''),
                className: 'error-message',
            }),
        }),

        // Response Display
        Widget.Revealer({
            revealChild: SearchService.bind('response'),
            child: Widget.Box({
                vertical: true,
                className: 'response-container',
                children: [
                    // Question
                    Widget.Label({
                        label: SearchService.bind('response').transform(r => 
                            r ? r.question : ''),
                        className: 'question',
                        wrap: true,
                        justification: 'left',
                    }),

                    // Final Answer
                    Widget.ScrolledWindow({
                        vexpand: true,
                        child: Widget.Label({
                            label: SearchService.bind('response').transform(r => 
                                r ? r.final_answer : ''),
                            className: 'final-answer',
                            wrap: true,
                            justification: 'left',
                        }),
                    }),

                    // Sources
                    Widget.Box({
                        className: 'sources-container',
                        children: [
                            Widget.Label({
                                label: 'Sources:',
                                className: 'sources-label',
                            }),
                            Widget.Box({
                                className: 'sources-list',
                                setup: box => {
                                    SearchService.connect('response', () => {
                                        const response = SearchService.response;
                                        if (!response) return;
                                        
                                        box.children = response.scrape_logs
                                            .filter(log => log.status === 'success')
                                            .map(log => Widget.Button({
                                                label: new URL(log.url).hostname,
                                                className: 'source-link',
                                                onClicked: () => Utils.execAsync(['xdg-open', log.url]),
                                            }));
                                    });
                                },
                            }),
                        ],
                    }),

                    // New Search Button
                    Widget.Button({
                        label: 'New Search',
                        className: 'new-search-button',
                        onClicked: () => {
                            SearchService.response = null;
                            SearchService.query = '';
                        },
                    }),
                ],
            }),
        }),
    ],
});