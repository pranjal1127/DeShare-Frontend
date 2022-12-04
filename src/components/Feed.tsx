/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Card, CardBody, CardHeader, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import Avatar from "react-avatar";
import { useStateContext } from "../App";
import { callAPI, EndPoints } from "../helper";
import { AiOutlineHeart } from "react-icons/ai";

const Feed = () => {
  const { posts, setVt, vt, initialVt, showVtFinished, vtLoaded, address } =
    useStateContext();
  const maxScrolled = useRef(0);

  const debounce = (func: any, delay: any) => {
    let debounceTimer: any;
    return function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func(), delay);
    };
  };

  const handlerScroll = debounce(() => {
    const scrolledFromTop = document.documentElement.scrollTop;
    const heightOfOnePost = window.innerHeight;
    if (scrolledFromTop > maxScrolled.current) {
      maxScrolled.current = scrolledFromTop;
      const postViewed = Math.ceil(scrolledFromTop / heightOfOnePost);

      if (vt !== initialVt - postViewed) {
        const filteredPosts = posts.filter(
          (e: any) => e.metadata.media && e.metadata.media.length
        );
        const creatorAddress = filteredPosts[postViewed].profile.ownedBy;

        if (creatorAddress !== address) {
          setVt(initialVt - postViewed);
          console.log({ creatorAddress, postViewed });
          callAPI("post", EndPoints.viewContent, {
            userAddress: address,
            creatorAddress: creatorAddress,
          });
        }
      }
    }
  }, 100);
  useEventListener(
    "scroll",
    handlerScroll
    // () => {
    //   const scrolledFromTop = document.documentElement.scrollTop;
    //   const heightOfOnePost = window.innerHeight;
    //   if (scrolledFromTop > maxScrolled.current) {
    //     maxScrolled.current = scrolledFromTop;
    //     const postViewed = Math.ceil(scrolledFromTop / heightOfOnePost);

    //     if (vt !== initialVt - postViewed) {
    //       setVt(initialVt - postViewed);

    //       const filteredPosts = posts.filter(
    //         (e: any) => e.metadata.media && e.metadata.media.length
    //       );
    //       const creatorAddress = filteredPosts[postViewed].profile.ownedBy;
    //       console.log({ creatorAddress, postViewed });
    //       callAPI("post", EndPoints.viewContent, {
    //         userAddress: address,
    //         creatorAddress: creatorAddress,
    //       });
    //     }
    //   }
    // }
  );

  return (
    <section className="mt-10  overflow-hidden">
      {!vtLoaded ? (
        <div className="h-screen flex justify-center items-center">
          <Spinner></Spinner>
        </div>
      ) : (
        <>
          {showVtFinished ? (
            <div className="h-screen flex justify-center items-center">
              <h2 className="text-4xl">
                You, have used all the view tokens allocated to you for the day
              </h2>
            </div>
          ) : (
            <div className="container px-4 mx-auto">
              {/* {profile?.handle && <h2 className="mb-7 text-6xl md:text-8xl xl:text-10xl font-bold font-heading text-center tracking-px-n leading-none">Hi, {profile.handle}</h2>} */}

              {posts
                .filter((e: any) => e.metadata.media && e.metadata.media.length)
                .map((e: any) => {
                  return (
                    <div key={e.id} className="mt-8">
                      <Card maxW={"2xl"} marginX={"auto"}>
                        <CardHeader>
                          <div className="text-start mx-auto md:max-w-2xl mb-4 flex items-center ">
                            <Avatar
                              size="40"
                              round
                              name={e.profile.handle}
                              className="text-gray-600 bg-gray-600"
                              color="#9ca3af"
                            />
                            <div className="flex text-start  ml-4">
                              <p className=" text-lg text-gray-600 font-medium">
                                {e.profile.handle}
                                {/* {e.id} */}
                              </p>

                              <Button
                                variant={"ghost"}
                                size={"sm"}
                                marginLeft={4}
                                color={"purple.400"}
                              >
                                Follow
                              </Button>
                            </div>

                            {/* <p>
                    {e.id}
                  </p> */}
                          </div>
                        </CardHeader>

                        <CardBody>
                          <div className="flex justify-center">
                            <div className="inline-block max-w-2xl w-full">
                              {/* <img className="mb-11 mx-auto transform hover:translate-y-3 transition ease-in-out duration-1000" src="https://shuffle.dev/flaro-assets/images/features/data.png" alt="" /> */}

                              <p>{e.metadata.name}</p>

                              {e.metadata.media[0].original.mimeType ===
                              "video/mp4" ? (
                                <video
                                  autoPlay={true}
                                  muted
                                  controls
                                  className="mb-11 mx-auto transform hover:translate-y-3 transition ease-in-out duration-1000 rounded-lg"
                                >
                                  <source
                                    src={e.metadata.media[0].original.url}
                                    type="video/mp4"
                                  />
                                </video>
                              ) : (
                                <img
                                  src={e.metadata.media[0].original.url}
                                  alt="alt"
                                  className="mb-11 justify-center mx-auto transform hover:translate-y-3 transition ease-in-out duration-1000"
                                />
                              )}
                              <AiOutlineHeart
                                size={28}
                                className="cursor-pointer"
                              />
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Feed;

// Hook
function useEventListener(eventName: any, handler: any, element = window) {
  // Create a ref that stores handler
  const savedHandler = useRef();
  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;
      // Create event listener that calls handler function stored in ref
      const eventListener = (event: any) =>
        (savedHandler as any).current(event);
      // Add event listener
      element.addEventListener(eventName, eventListener);
      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
}
