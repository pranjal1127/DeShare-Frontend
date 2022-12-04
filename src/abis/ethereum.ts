import { ethers } from "ethers";
import IncentiveManagerABI from "./IncentiveManager.json";

const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_ALCHAMY_RPC_URL );
export const IncentiveManagerInst = new ethers.Contract(process.env.REACT_APP_INCENTIVE_MANAGER_CONTRACT_ADDRESS || "0x8EcE70D97403369acB8B7F53B96a0F272aEd2D33", IncentiveManagerABI.abi, provider);
 