import { HAS_TX_BEEN_INDEXED } from "./queries"
import { gql } from '@apollo/client';
import { apolloClientAuth } from "../apollo";

export const hasTxBeenIndexed = (txHash: any) => {
    return apolloClientAuth.query({
        query: gql(HAS_TX_BEEN_INDEXED),
        variables: {
            request: {
                txHash,
            },
        },
        fetchPolicy: 'network-only',
    })
}

export const pollUntilIndexed = async (txHash: any) => {
    while (true) {
        const result = await hasTxBeenIndexed(txHash);
        console.log(result)
        const response = result.data.hasTxHashBeenIndexed;
        if (response.__typename === 'TransactionIndexedResult') {
            if (response.metadataStatus) {
                if (response.metadataStatus.status === 'SUCCESS') {
                    return response;
                }

                if (response.metadataStatus.status === 'METADATA_VALIDATION_FAILED') {
                    throw new Error(response.metadataStatus.reason);
                }
            } else {
                if (response.indexed) {
                    return response;
                }
            }

            // sleep for a second before trying again
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // it got reverted and failed!
        // throw new Error(response.reason);
    }
};
