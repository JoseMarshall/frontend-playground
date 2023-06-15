import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createUploadLink } from 'apollo-upload-client';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  Observable,
} from '@apollo/client';
import { print, getOperationAST } from 'graphql';
import { createClient } from 'graphql-sse';
import { split } from '@apollo/client/link/core';
import App from './App';

const graphqlUri = 'http://localhost:4000/api/graphql';

class SSELink extends ApolloLink {
  constructor(options) {
    super();
    this.options = options;
    this.client = createClient(options);
  }

  request(operation) {
    const url = new URL(this.options.url);
    url.searchParams.append('query', print(operation.query));
    if (operation.operationName) {
      url.searchParams.append('operationName', operation.operationName);
    }
    if (operation.variables) {
      url.searchParams.append('variables', JSON.stringify(operation.variables));
    }
    if (operation.extensions) {
      url.searchParams.append(
        'extensions',
        JSON.stringify(operation.extensions)
      );
    }

    return new Observable(sink => {
      const eventsource = new EventSource(url.toString(), this.options);
      eventsource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        sink.next(data);
        if (eventsource.readyState === 2) {
          sink.complete();
        }
      };
      eventsource.onerror = function (error) {
        sink.error(error);
      };
      eventsource.addEventListener('complete', () => {
        eventsource.close(); // If operation ends, close the connection and prevent the client from reconnecting
      });
      return () => eventsource.close();
    });
  }
}

const httpLink = createUploadLink({
  uri: graphqlUri,
  credentials: 'include',
});

const sseLink = new SSELink({
  url: graphqlUri,

  headers: () => {
    const session = {
      token: 'my-token',
    };
    return {
      Authorization: `Bearer ${session.token}`,
    };
  },
});

const link = split(
  ({ query, operationName }) => {
    const definition = getOperationAST(query, operationName);

    return (
      definition?.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  sseLink,
  httpLink
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

// Supported in React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
