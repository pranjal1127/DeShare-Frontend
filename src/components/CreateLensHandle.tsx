/* eslint-disable no-restricted-globals */
import { useState } from "react";
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
import { createProfile } from "../apollo/profile";

type Props = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
};
const CreateLensHandle = ({ isOpen, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const { web3Provider } = useStateContext();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      if (web3Provider) {
        await createLensProfile(title);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const createLensProfile = async (handle: string) => {
    try {
      const request = {
        handle,
        profilePictureUri: null,
        followNFTURI: null,
        followModule: null,
      };

      const createData = await createProfile(request);

      // if() {}
      location.reload();
      console.log("createData", createData);
    } catch (error) {
      console.log("error in create profile", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Lens</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Basic usage"
          />
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

export default CreateLensHandle;
