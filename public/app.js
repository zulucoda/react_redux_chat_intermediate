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

const store = Redux.createStore(reducer);

function deleteMessage(id) {
  return {
    type: 'DELETE_MESSAGE',
    id: id
  };
}

function addMessage (text, threadId) {
  return {
    type: 'ADD_MESSAGE',
    text: text,
    threadId: threadId
  };
}

function openThread (id) {
  return {
    type: 'OPEN_THREAD',
    id: id
  }
}

const App = () => (
  <div className="ui segment">
    <ThreadTabs></ThreadTabs>
    <ThreadDisplay></ThreadDisplay>
  </div>
);

const Tabs = (props) => (
  <div className="ui top attached tabular menu">
    { props.tabs.map((tab, index) =>(
      <div key={index}
       className={tab.active ? 'active item' : 'item'}
       onClick={()=>props.onClick(tab.id)}>
        {tab.title}
      </div>
      ))
    }
  </div>
);

const mapStateToTabsProps = (state) => {
  const tabs = state.threads.map(t=>({
    title: t.title,
    active: t.id === state.activeThreadId,
    id: t.id
  }));
  return {
    tabs
  }
};

const mapDispatchToTabsProps = (dispatch) => (
  {
    onClick: (id) => {
      dispatch(openThread(id))
    }
  }
);

const ThreadTabs = ReactRedux.connect(
  mapStateToTabsProps,
  mapDispatchToTabsProps
)(Tabs);

const TextFieldSubmit = (props) => {
  let input;

  return (
    <div className="ui input">
      <input
        ref={node => input = node}
        type="text"
      />
      <button
        className="ui primary button"
        onClick={()=> {
          props.onSubmit(input.value);
          input.value = '';
        }}
        type="submit"
        >
        Submit
      </button>
    </div>
  );
};

const MessageList = (props) => (
  <div className="ui comments">
    {
      props.messages.map((m, index) => (
        <div
          className="comment"
          key={index}
          onClick={() => props.onClick(m.id)}
          >
          <div className="text">
            {m.text}
            <span className="metadata">@{m.timestamp}</span>
          </div>
        </div>
      ))
    }
  </div>
);

const Thread = (props) => (
  <div className="ui center aligned basic segment">
    <MessageList
      messages={props.thread.messages}
      onClick={props.onMessageClick}
    />
    <TextFieldSubmit
      onSubmit={props.onMessageSubmit}
    />
  </div>
);

const mapStateToThreadProps = (state) => (
  {
    thread: state.threads.find(
      t => t.id === state.activeThreadId
    )
  }
);

const mapDispatchToThreadProps = (dispatch) => (
  {
    onMessageClick: (id) => (
      dispatch(deleteMessage(id))
    ),
    dispatch: dispatch
  }
);

const mergeThreadProps = (stateProps, dispatchProps) => (
  {
    ...stateProps,
    ...dispatchProps,
    onMessageSubmit: (text) => (
      dispatchProps.dispatch(
        addMessage(text, stateProps.thread.id)
      )
    )
  }
);

const ThreadDisplay = ReactRedux.connect(
  mapStateToThreadProps,
  mapDispatchToThreadProps,
  mergeThreadProps
)(Thread);

ReactDOM.render(
  <ReactRedux.Provider store={store}>
  <App />
  </ReactRedux.Provider>,
  document.getElementById('content')
);
