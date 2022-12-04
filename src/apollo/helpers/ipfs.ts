import { Web3Storage } from 'web3.storage'

export const uploadToIPFS = async (data: any) => {
    const client = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_KEY as string })
    // const buffer = require("buffer/").Buffer.from(JSON.stringify(data))
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const file = [new File([blob], `${data.metadata_id}.json`)]
    console.log(file)
    const uploadResponse = await client.put(file);
    return uploadResponse;
}


export const uploadImageToIPFS = async (data: any, name: string) => {
    const client = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_KEY as string })
    const blob = new Blob([data], { type: 'image/jpeg' })
    const file = [new File([blob], `${name}.jpg`)]
    console.log(file)
    const uploadResponse = await client.put(file);
    return uploadResponse;
}