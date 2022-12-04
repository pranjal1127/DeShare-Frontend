import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalContent,
  ModalFooter,
  Button,
  Input,
} from "@chakra-ui/react";
import { useStateContext } from "../App";
import { authenticate, generateChallenge } from "./../apollo/login";
import { createProfile, getProfile } from "./../apollo/profile";
import { uploadImageToIPFS, uploadToIPFS } from "./../apollo/helpers/ipfs";
import {
  createPostTypedData,
  explorePublications,
} from "./../apollo/publication";
import { v4 as uuidv4 } from "uuid";
import { signedTypeData, splitSignature } from "./../apollo/helpers/utils";
import { getLensHub } from "./../apollo/helpers/lens-hub";
import { pollUntilIndexed } from "./../apollo/helpers/transactions";
import { source } from "./../apollo/helpers/constants";

type Props = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
};
const CreatePostModal = ({ isOpen, onOpen, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState();
  const {
    profile,
    setProfile,
    socialLoginSDK,
    address,
    chainId,
    web3Provider,
    disconnect,
    handleLogin,
    getPublications,
  } = useStateContext();
  const [loading, setLoading] = useState(false);

  function handleChange(event: any) {
    setFile(event.target.files[0]);
  }

  const handleCreate = async () => {
    try {
      if (web3Provider) {
        setLoading(true);
        const metadata_id = uuidv4();

        // if (file) {
        let fileUploadHash = await uploadImageToIPFS(file, metadata_id);
        console.log({ fileUploadHash });

        // let fileUpload = 'https://www.appsloveworld.com/wp-content/uploads/2018/10/Sample-Videos-Mp425.mp4'
        let fileUpload =
          "https://" +
          fileUploadHash +
          ".ipfs.dweb.link/" +
          metadata_id +
          ".jpg";

        // }

        const ipfsResult = await uploadToIPFS({
          version: "2.0.0",
          metadata_id,
          locale: "en-us",
          mainContentFocus: "IMAGE", //VIDEO
          // mainContentFocus: "VIDEO", //VIDEO
          description: "",
          content: title,
          external_url: null,
          image: fileUpload,

          // image: 'https://i.picsum.photos/id/808/200/300.jpg?hmac=Kyj9_KH7mvVdj6C03HH9933R2yKWSwQHGtqkeaTLCAM',
          imageMimeType: "image/jpeg",
          cover:
            "https://i.picsum.photos/id/808/200/300.jpg?hmac=Kyj9_KH7mvVdj6C03HH9933R2yKWSwQHGtqkeaTLCAM",
          name: title,
          attributes: [],
          tags: [],
          media: [
            {
              item: fileUpload,
              // item: 'https://i.picsum.photos/id/808/200/300.jpg?hmac=Kyj9_KH7mvVdj6C03HH9933R2yKWSwQHGtqkeaTLCAM',
              type: "image/jpeg",
            },
          ],
          appId: source,
        });
        console.log(ipfsResult);
        const payload = {
          profileId: profile.id,
          contentURI:
            "https://" +
            ipfsResult +
            ".ipfs.dweb.link/" +
            metadata_id +
            ".json",
          collectModule: {
            limitedFeeCollectModule: {
              collectLimit: "100000",
              amount: {
                currency: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
                value: "0.01",
              },
              recipient: "0xEEA0C1f5ab0159dba749Dc0BAee462E5e293daaF",
              referralFee: 10.5,
              followerOnly: false,
            },
          },
          referenceModule: {
            followerOnlyReferenceModule: false,
          },
        };
        console.log("payload", payload);
        console.log("lens profile id", profile.id);
        console.log(payload.contentURI);

        const result = await createPostTypedData(payload);
        const typedData = result.data.createPostTypedData.typedData;
        console.log({ typedData });
        const signer = web3Provider.getSigner();
        const signature = await signedTypeData(
          signer,
          typedData.domain,
          typedData.types,
          typedData.value
        );
        console.log("create post: signature", signature);

        const { v, r, s } = splitSignature(signature);
        console.log("Signature Split");
        const lensHub = getLensHub(signer);
        console.log({ lensHub });
        const tx = await lensHub.postWithSig({
          profileId: typedData.value.profileId,
          contentURI: typedData.value.contentURI,
          collectModule: typedData.value.collectModule,
          collectModuleInitData: typedData.value.collectModuleInitData,
          referenceModule: typedData.value.referenceModule,
          referenceModuleInitData: typedData.value.referenceModuleInitData,
          sig: {
            v,
            r,
            s,
            deadline: typedData.value.deadline,
          },
        });
        console.log({ tx });
        // console.log("here");
        const res = await pollUntilIndexed(tx.hash);
        console.log("pollUntilIndexed", tx.hash, res);
        setLoading(false);
        // setOpen(false);
        // window.location.reload(false);
        getPublications();
        onClose();
        console.log(res);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create post</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Basic usage"
          />

          <input type="file" className="mt-4" onChange={handleChange} />
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button isLoading={loading} variant="ghost" onClick={handleCreate}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreatePostModal;
