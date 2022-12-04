import { apolloClientAuth, apolloClient } from "./apollo";
import { gql } from '@apollo/client'
import { CREATE_POST_TYPED_DATA, EXPLORE_PUBLICATIONS, COLLECT_PUBLICATION, GET_USER_NFTS } from './queries'


export const createPostTypedData = (createPostTypedDataRequest: any) => {
    return apolloClientAuth.mutate({
        mutation: gql(CREATE_POST_TYPED_DATA),
        variables: {
            request: createPostTypedDataRequest,
        },
    });
};

export const explorePublications = (explorePublicationQueryRequest: any) => {
    return apolloClient.query({
        query: gql(EXPLORE_PUBLICATIONS),
        variables: {
            request: explorePublicationQueryRequest,
        },
        fetchPolicy: 'no-cache'
    })
}

export const collectPublication = (collectPublicationRequest: any) => {
    return apolloClientAuth.mutate({
        mutation: gql(COLLECT_PUBLICATION),
        variables: {
            request: collectPublicationRequest,
        },
    });
}

export const getUserNFTs = (NFTsRequest: any) => {
    return apolloClientAuth.query({
        query: gql(GET_USER_NFTS),
        variables: {
            request: NFTsRequest,
        },
    });
}