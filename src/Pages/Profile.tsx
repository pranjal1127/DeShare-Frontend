import { Alert, AlertDescription, AlertTitle, Button } from "@chakra-ui/react";
import React, { useEffect } from "react";
import Avatar from "react-avatar";
import { useStateContext } from "../App";
import Navbar from "../components/Navbar";
import { IncentiveManagerInst } from "../abis/ethereum";
import axios from "axios";
import { callAPI, EndPoints } from "../helper";

const Profile = () => {
  const { profile, getUserData, address, web3Provider, et } = useStateContext();
  console.log({ profile });
  const [lastMonthEarning, setLastMonthEarning] = React.useState(0);
  const [claimedEarnings, setClaimedEarnings] = React.useState(0);

  const getData = async () => {
    try {
      getUserData();
      const currenID = await IncentiveManagerInst.currentMonth();

      const lastMonthData = await callAPI(
        "get",
        `${EndPoints.getLastMonthIncentiveData}?address=${address}&monthId=${
          +currenID - 1
        }`
      );
      const claimedData = await IncentiveManagerInst.earnedRewards(
        address,
        +currenID - 1
      );

      setLastMonthEarning(lastMonthData?.data?.monthlyEarnings || 0);
    } catch (err) {
      console.log(err);
    }
  };

  const claimEarnings = async () => {
    try {
      const getSignature = await callAPI(
        "post",
        `${EndPoints.claimIncentive}`,
        {
          creatorAddress: address,
          followers: profile.stats.totalFollowing,
          post: profile.stats.totalPosts,
        }
      );

      console.log(getSignature);

      if (web3Provider) {
        const signer = await web3Provider?.getSigner();

        const IncentiveManagerInstWithSigner =
          await IncentiveManagerInst.connect(signer);
        const tx = await IncentiveManagerInstWithSigner.claimIncentiveWithSig(
          getSignature.data.incentiveScore,
          getSignature.data.signature
        );
        await tx.wait();
        getData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="antialiased bg-body text-body font-body py-8 container mx-auto">
      <Navbar />
      <section className="bg-blueGray-100">
        <div className="w-full lg:w-4/12 px-4 mx-auto">
          <div
            className="relative flex flex-col min-w-0 break-words bg-slate-100  
          w-full mb-6 shadow-xl rounded-lg mt-16"
          >
            <div className="px-6">
              <div className="flex flex-wrap justify-center items-center">
                <div className="w-full px-4 flex justify-center">
                  <div className="relative mt-8">
                    <Avatar
                      size="100"
                      round
                      name={profile?.handle}
                      className="text-gray-600 bg-gray-600"
                      color="#9ca3af"
                    />
                  </div>
                </div>
                <div className="w-full px-4 text-center mt-4">
                  <div className="flex justify-center py-4 lg:pt-4 pt-8">
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                        {profile.stats?.totalFollowers}
                      </span>
                      <span className="text-sm text-blueGray-400">
                        Followers
                      </span>
                    </div>
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                        {profile.stats?.totalFollowing}
                      </span>
                      <span className="text-sm text-blueGray-400">
                        Following
                      </span>
                    </div>

                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                        {profile.stats?.totalPosts}
                      </span>
                      <span className="text-sm text-blueGray-400">Post</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <h3 className="text-xl font-semibold leading-normal text-blueGray-700 mb-2">
                  {profile?.handle}
                </h3>
              </div>
              <div className="mt-10 py-10  text-center footer">
                <div className="flex flex-wrap justify-around">
                  <Alert
                    status="info"
                    display={"flex"}
                    flexDirection="column"
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    <AlertTitle> Keep it up! 💸💸💸💸💸💸</AlertTitle>
                    <AlertDescription>
                      Your this month view Score is : {et}
                    </AlertDescription>
                  </Alert>

                  <Alert
                    status="success"
                    className="mt-4 flex flex-col justify-center items-center"
                  >
                    <AlertTitle>Congratulations 🎉🎉🎉🎉🎉</AlertTitle>
                    <AlertDescription>
                      Your last month view Score is : {lastMonthEarning}
                    </AlertDescription>
                    <br />
                    <Button
                      variant={"solid"}
                      backgroundColor={"green.300"}
                      color={"white"}
                      onClick={claimEarnings}
                      _hover={{ backgroundColor: "facebook.400" }}
                    >
                      Claim Earning Tokens
                    </Button>
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
