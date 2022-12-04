import React from "react";
import {
  CircularProgress,
  CircularProgressLabel,
  Text,
} from "@chakra-ui/react";
import { useStateContext } from "../App";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import Avatar from "react-avatar";
import CreatePostModal from "./CreatePostModal";
import { Link, Route } from "react-router-dom";
import { ProgressDevideMinutes } from "../apollo/helpers/constants";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    profile,
    setProfile,
    socialLoginSDK,
    address,
    chainId,
    web3Provider,
    disconnect,
    handleLogin,
    vt,
  } = useStateContext();

  const color = (vt: number) => {
    if (vt > 40) return "green.400";
    if (vt > 20) return "yellow.400";
    return "red.400";
  };
  console.log({ profile });
  return (
    <div
      className="flex justify-between mb-8 items-center fixed w-full top-0 bg-main z-5 container"
      style={{ backgroundColor: "white", zIndex: 500 }}
    >
      <Text variant={"h1"} fontSize={"2xl"} fontWeight="bold">
        <Link to={"/"}>
          <img src="/assets/logo.png" alt="logo" width="175px" />
        </Link>
      </Text>

      {address ? (
        <div>
          <Button className="mx-4" onClick={onOpen}>
            Create Post
          </Button>
          {profile?.handle && (
            <Menu>
              <MenuButton>
                <Avatar
                  size="40"
                  round
                  name={profile?.handle}
                  className="text-gray-600 bg-gray-600"
                  color="#9ca3af"
                />
              </MenuButton>
              <MenuList>
                <MenuItem>
                  <Link to="/profile">Profile</Link>
                </MenuItem>
                <MenuItem>{address}</MenuItem>
                <MenuItem>{profile?.handle}</MenuItem>
                <MenuItem onClick={disconnect}>Disconnect</MenuItem>
              </MenuList>
            </Menu>
          )}

          {vt ? (
            <CircularProgress value={(vt / ProgressDevideMinutes) * 100} color={color(vt)} className='ml-4'>
              <CircularProgressLabel>{vt}</CircularProgressLabel>
            </CircularProgress>
          ) : (
            <></>
          )}

          <CreatePostModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />

          {/* <p>Connected to: {address}</p> */}

          {/* <p>sss{profile && profile.handle}</p>

          <Button onClick={disconnect}>Logout</Button> */}
        </div>
      ) : (
        <Button onClick={handleLogin}>Login using Biconomy</Button>
      )}
    </div>
  );
};

export default Navbar;
