import { GET_PROFILES, CREATE_PROFILE } from "./queries";
import { apolloClient, apolloClientAuth } from './apollo'
import { gql } from '@apollo/client'

export const getProfile = async (ownedBy: string | undefined) => {
    const request = { ownedBy };
    const profilesFromProfileIds = await apolloClient.query({
        query: gql(GET_PROFILES),
        variables: {
            request,
        },
    });
    return profilesFromProfileIds.data?.profiles?.items[0];
}

export const createProfile = (createProfileRequest: { handle: string; profilePictureUri: null; followNFTURI: null; followModule: null; }) => {
    return apolloClientAuth.mutate({
        mutation: gql(CREATE_PROFILE),
        variables: {
            request: createProfileRequest
        },
    })
}