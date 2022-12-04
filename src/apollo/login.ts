import { apolloClient } from './apollo'
import { GET_CHALLENGE, AUTHENTICATION } from './queries'
import { gql } from '@apollo/client'

export const generateChallenge = (address: string) => {
    return apolloClient.query({
        fetchPolicy: 'no-cache',
        query: gql(GET_CHALLENGE),
        variables: {
            request: {
                address,
            },
        },
    });
};

export const authenticate = (address: string, signature: any) => {
    return apolloClient.mutate({
        mutation: gql(AUTHENTICATION),
        variables: {
            request: {
                address,
                signature,
            },
        },
    });
};