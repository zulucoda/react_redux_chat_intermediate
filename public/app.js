const reducer  = Redux.combineReducers({
  activeThreadId: activeThreadIdReducer,
    threads: threadsReducer
});

function activeThreadIdReducer (state = '1-fca2', action) {
  if(action.type === 'OPEN_THREAD'){
    return action.id;
  } else {
    return state;
  }
}

function findThreadIndex (threads, action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return threads.findIndex(
        (t) => t.id === action.threadId
      );
    case 'DELETE_MESSAGE':
      return threads.findIndex(
        (t) => t.messages.find((m) => (
          m.id === action.id
        ))
      );
  }
}

function threadsReducer(state = [
  {
    id: '1-fca2',
    title: 'Shaka Zulu',
    messages: messageReducer(undefined, {})
  },
  {
    id: '2-be91',
    title: '50 Cent',
    messages: messageReducer(undefined, {})
  },
], action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
    case 'DELETE_MESSAGE':
      const threadIndex = findThreadIndex(state, action);

      const oldThread = state[threadIndex];
      const newThread = {
        ...oldThread,
        messages: messageReducer(oldThread.messages, action)
      };

      return [
        ...state.slice(0, threadIndex),
        newThread,
        ...state.slice(
          threadIndex + 1, state.length
        )
      ];

    default: {
      return state
    }
  }
}

function messageReducer (state = [], action) {
  switch (action.type) {
    case 'ADD_MESSAGE': {
      const newMessage = {
        text: action.text,
        timestamp: Date.now(),
        id: uuid.v4()
      };
      return state.concat(newMessage);
    }

    case 'DELETE_MESSAGE': {
      const messageIndex = state.findIndex((m) => m.id === action.id);
      return [
        ...state.slice(0, messageIndex),
        ...state.slice(
          messageIndex + 1, state.length
        )
      ];
    }

    default: {
      return state;
    }
  }

  if(action.type === ''){

  } else {
    return state;
  }
}

const initialState = {
  activeThreadId: '1-fca2',
  threads: [
    {
      id: '1-fca2',
      title: 'Shaka Zulu',
      messages: [
        {
          text: 'The English have surrendered.',
          timestamp: Date.now(),
          id: uuid.v4()
        }
      ]
    },
    {
      id: '2-be91',
      title: '50 Cent',
      messages: [
        {
          text: 'Get Rich or Die Trying is a classic.',
          timestamp: Date.now(),
          id: uuid.v4()
        }
      ]
    },
  ]
};

const store = Redux.createStore(reducer);

const App = React.createClass({
  componentDidMount: function () {
    store.subscribe(() => this.forceUpdate());
  },
  render: function () {
    const state = store.getState();
    const activeThreadId = state.activeThreadId;
    const threads = state.threads;
    const activeThread = threads.find((t) => t.id === activeThreadId);
    const tabs = threads.map(t => ({
      title: t.title,
      active: t.id === activeThreadId,
      id: t.id
    }));
    return (
      <div className='ui segment'>
        <ThreadTabs tabs={tabs} />
        <Thread thread={activeThread} />
      </div>
    );
  },
});

const ThreadTabs = React.createClass({
  handleClick(id){
    store.dispatch({
      type: 'OPEN_THREAD',
      id: id
    })
  },
  render(){
    const tabs = this.props.tabs.map((tab, index) => (
      <div
        key={index}
        className={tab.active ? 'active item' : 'item'}
        onClick={()=>this.handleClick(tab.id)}>
        {tab.title}
      </div>
    ));
    return (
      <div className="ui top attached tabular menu">
        {tabs}
      </div>
    );
  }
});

const MessageInput = React.createClass({
  handleSubmit: function () {
    store.dispatch({
      type: 'ADD_MESSAGE',
      text: this.refs.messageInput.value,
      threadId: this.props.threadId
    });
    this.refs.messageInput.value = '';
  },
  render: function () {
    return (
      <div className='ui input'>
        <input
          ref='messageInput'
          type='text'
        >
        </input>
        <button
          onClick={this.handleSubmit}
          className='ui primary button'
          type='submit'
        >
          Submit
        </button>
       </div>
    );
  },
});

const Thread = React.createClass({
  handleClick: function (id) {
    store.dispatch({
      type: 'DELETE_MESSAGE',
      id: id,
    });
  },
  render: function () {
    const messages = this.props.thread.messages.map((message, index) => (
      <div
        className='comment'
        key={index}
        onClick={() => this.handleClick(message.id)}
      >
        <div className="text">
          {message.text}
          <span className="metadata">@{message.timestamp}</span>
        </div>
      </div>
    ));
    return (
      <div className='ui center aligned basic segment'>
        <div className='ui comments'>
          {messages}
        </div>
        <MessageInput threadId={this.props.thread.id}></MessageInput>
      </div>
    );
  },
});

ReactDOM.render(
  <App />,
  document.getElementById('content')
);
