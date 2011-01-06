var FourSquare = {
    endpoints: {
        users:    {
            methods: {
               search: ['phone','email','twitter','twitterSource','fbid','name'],
               requests: []
            },
            aspects: {
                badges: [],
                checkins: ['limit','offset','afterTimestamp','beforeTimestamp']  ,
                friends: [],
                tips: ['sort','ll'],
                todos: ['sort','ll'],
                venuehistory: [],
            },
            // actions: {
            //     request: [],
            //     unfriend: [],
            //     approve:[],
            //     deny:[],
            //     setpings: ['value'] 
            // },
        },
        venues:   {
            methods: {
                add: ['name','address','crossStreet','city','state','zip','phone','ll','primaryCategoryId'],
                categories: [],
                search: ['ll','llAcc','alt','altAcc','query','limit','intent']
            },
            aspects: {
                herenow: [],
                tips: ['sort']
            },
            // actions: {
            //     marktodo: ['text'],
            //     flag: ['problem:mislocated|closed|duplicate'],
            //     proposeedit: ['name','address','crossStreet','city','state','zip','phone','ll','primaryCategoryId'],
            // },
        },
        checkins: {
            methods: {
                add: ['venueId','venue','shout','broadcast','ll','llAcc','alt','altAcc'],
                recent: ['ll','limit','offset','afterTimestamp']
            },
            // actions: {
            //     addcomment: ['text'],
            //     deletecomment: ['commentId']
            // },
        },
        tips:     {
            methods: {
                add: ['venueId','text','url'],
                search: ['ll','limit','offset','filter','query']
            },
            // actions: {
            //     marktodo: [],
            //     markdone:[],
            //     unmark:[]
            // },
        },
        photos:   {
            methods: {
                add: ['checkingId','tipId','venueId','broadcast','ll','llAcc','alt','altAcc']
            }
        },
        settings: {
            methods: {
                all:  [] 
            },
            // actions: {
            //     set: ['value']
            // },
        }
    }
};