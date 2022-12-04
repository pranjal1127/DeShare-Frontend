import { SignatureLike } from '@ethersproject/bytes';
import { utils } from 'ethers';
import omitDeep from 'omit-deep';

export const signedTypeData = (signer: { _signTypedData: (arg0: any, arg1: any, arg2: any) => any; }, domain: any, types: any, value: any) => {
    //   const signer = wallet.getSigner();
    // remove the __typedname from the signature!
    return signer._signTypedData(
        omitDeep(domain, '__typename' as any),
        omitDeep(types, '__typename' as any),
        omitDeep(value, '__typename' as any)
    );
}

export const splitSignature = (signature: SignatureLike) => {
    return utils.splitSignature(signature)
}