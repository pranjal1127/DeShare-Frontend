import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import "./App.css";
import SocialLogin from "@biconomy-sdk/web3-auth";
import { ethers } from "ethers";
import { authenticate, generateChallenge } from "./apollo/login";
import { createProfile, getProfile } from "./apollo/profile";
import { explorePublications } from "./apollo/publication";
import { source } from "./apollo/helpers/constants";
import Navbar from "./components/Navbar";
import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import Feed from "./components/Feed";
import { extendTheme } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./Pages/Profile";
import axios from "axios";
import { EndPoints, callAPI } from "./helper";
import CreateLensHandle from "./components/CreateLensHandle";

type StateType = {
  web3Provider?: ethers.providers.Web3Provider | null;
  address?: string;
  chainId?: number;
  profile: any;
  setProfile: React.Dispatch<any>;
  socialLoginSDK: SocialLogin | undefined;
  disconnect: any;
  handleLogin: any;
  getPublications: any;
  posts: Array<any>;
  setPosts: any;
  setVt: (v: number) => void;
  getUserData: () => void;
  vt: number;
  et: number;
  initialVt: number;
  showVtFinished: boolean;
  vtLoaded: boolean;
};
const initialState: StateType = {
  web3Provider: null,
  address: "",
  chainId: 5,
  profile: undefined,
  setProfile: () => {},
  socialLoginSDK: undefined,
  disconnect: () => {},
  handleLogin: () => {},
  getPublications: () => {},
  posts: [],
  setPosts: () => {},
  setVt: (p) => {},
  getUserData: () => {},
  et: 0,
  vt: 0,
  initialVt: 0,
  showVtFinished: false,
  vtLoaded: false,
};

export function useStateContext() {
  return useContext(StateContext);
}

const StateContext = createContext<StateType>(initialState);

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// 3. extend the theme
const theme = extendTheme({ config });

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
]);
function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin>();
  const [web3State, setWeb3State] = useState<StateType>(initialState);
  const [profile, setProfile] = useState<any>();
  const [posts, setPosts] = useState([]);
  const [vt, setVt] = useState(0);
  const [et, setEt] = useState(0);
  const [initialVt, setInitialVt] = useState(0);
  const [vtLoaded, setVtLoaded] = useState(false);

  const [showVtFinished, setShowVtFinished] = useState(false);

  useEffect(() => {
    const init = async () => {
      const socialLoginSDK = new SocialLogin();
      await socialLoginSDK.init("0x13881");
      socialLoginSDK.showConnectModal();
      setSocialLoginSDK(socialLoginSDK);
    };
    if (!socialLoginSDK) init();
  }, []);

  useEffect(() => {
    if (web3State.address && socialLoginSDK) {
      socialLoginSDK.hideWallet();
    }
  }, [web3State]);

  const getUserData = async () => {
    const res = await callAPI("post", EndPoints.login, {
      address: web3State.address,
      name: profile?.handle,
    });
    const vt = res.data.user.viewToken;
    const et = res.data.creator.monthlyEarnings;
    setVt(vt);
    setInitialVt(vt);
    setEt(et);
    setVtLoaded(true);
  };

  const handleLogin = async () => {
    if (socialLoginSDK) {
      socialLoginSDK.showWallet();

      if (socialLoginSDK.provider) {
        const web3Provider = new ethers.providers.Web3Provider(
          socialLoginSDK.provider
        );

        const signer = web3Provider.getSigner();
        const gotAccount = await signer.getAddress();
        const balance = await web3Provider.getBalance(gotAccount);
        const network = await web3Provider.getNetwork();
        setWeb3State({
          ...web3State,
          web3Provider,
          address: gotAccount,
          chainId: Number(network.chainId),
        });
        console.log("web3Provider", { web3Provider, gotAccount, balance });
      }
    }
  };

  useEffect(() => {
    console.log({ socialLoginSDK, web3State }, socialLoginSDK?.provider);
    (async () => {
      if (socialLoginSDK?.provider && !web3State?.address) {
        console.log("handleLogin ======>");
        handleLogin();
      }
    })();
  }, [web3State, socialLoginSDK]);

  useEffect(() => {
    if (vtLoaded && vt <= 0) {
      console.log("finish");
      setShowVtFinished(true);
    }
  }, [vt]);

  // after metamask login -> get provider event
  useEffect(() => {
    const { address } = web3State;
    const interval = setInterval(async () => {
      if (address) {
        clearInterval(interval);
      }
      if (socialLoginSDK?.provider && !address) {
        handleLogin();
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [web3State, socialLoginSDK]);

  const disconnect = useCallback(async () => {
    if (!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.error("Web3Modal not initialized.");
      return;
    }
    await socialLoginSDK.logout();
    setWeb3State(initialState);
    socialLoginSDK.hideWallet();
  }, [socialLoginSDK]);

  useEffect(() => {
    if (web3State.web3Provider && web3State.address) {
      signInWithLens();
    }
  }, [web3State]);

  useEffect(() => {
    if (web3State && profile) {
      // postToLens('Test 1', 'desc 1');
      getPublications();

      if(web3State.address) {
        getUserData();
      }
    }
  }, [web3State, profile]);
  const signInWithLens = async () => {
    try {
      if (web3State.web3Provider && web3State.address) {
        console.log({ signer: web3State.web3Provider });
        const challengeResponse = await generateChallenge(web3State.address);
        console.log(challengeResponse);
        // const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = web3State.web3Provider.getSigner();
        const signature = await signer.signMessage(
          challengeResponse.data.challenge.text
        );
        console.log("--isSignstring", signature);
        const accessTokens = await authenticate(web3State.address, signature);
        console.log({ accessTokens });
        setAuthenticationToken(accessTokens.data.authenticate);

        const profileData = await getProfile(web3State.address);
        console.log("profile", profileData);
        if (profileData) {
          setProfile(profileData);
          // onOpen();
          // setLensProfileId(profileData.id);
        } else {
          // createLensProfile("pranjallenstest");
          onOpen();
        }
      }
    } catch (err) {
      console.log(err);
      disconnect();
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
      console.log("createData", createData);
    } catch (error) {
      console.log("error in create profile", error);
    }
  };

  const setAuthenticationToken = (authenticate: any) => {
    const { accessToken, refreshToken } = authenticate;
    sessionStorage.setItem("lens-access-token", accessToken);
    sessionStorage.setItem("lens-refresh-token", refreshToken);
  };

  const getPublications = async () => {
    const request = {
      sortCriteria: "LATEST",
      publicationTypes: ["POST"],
      sources: [source],
    };
    const publications = await explorePublications(request);
    // console.log({ publications });
    console.log(
      publications.data.explorePublications.items,
      "explorePublications"
    );

    setPosts(publications.data.explorePublications.items);
  };

  return (
    <StateContext.Provider
      value={{
        ...web3State,
        setProfile: setProfile,
        profile: profile,
        socialLoginSDK: socialLoginSDK,
        disconnect: disconnect,
        handleLogin,
        getPublications: getPublications,
        posts,
        setPosts,
        setVt,
        getUserData,
        vt,
        et,
        initialVt,
        showVtFinished,
        vtLoaded,
      }}
    >
      <ChakraProvider theme={theme}>
        <RouterProvider router={router} />

        <CreateLensHandle isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
      </ChakraProvider>
    </StateContext.Provider>
  );
}

function Home() {
  return (
    <div className="antialiased bg-main text-body font-body py-8 ">
      <div className="container mx-auto h-full">
        {/* <div className="fixed"> */}
        <Navbar />
        {/* </div> */}

        <Feed />
      </div>
    </div>
  );
}
export default App;
