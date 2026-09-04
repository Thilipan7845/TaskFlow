import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  supabase,
} from "../lib/supabase";


function ProtectedRoute({
  children,
}) {

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    user,
    setUser,
  ] =
    useState(
      null
    );


  const location =
    useLocation();


  useEffect(
    () => {

      let mounted =
        true;


      async function checkUser() {

        try {

          const {
            data: {
              user,
            },
            error,
          } =
            await supabase
              .auth
              .getUser();


          if (
            error
          ) {

            console.error(
              "Authentication error:",
              error
            );


            if (
              mounted
            ) {

              setUser(
                null
              );

            }


            return;

          }


          if (
            mounted
          ) {

            setUser(
              user
            );

          }

        } catch (
          error
        ) {

          console.error(
            "Protected route error:",
            error
          );


          if (
            mounted
          ) {

            setUser(
              null
            );

          }

        } finally {

          if (
            mounted
          ) {

            setLoading(
              false
            );

          }

        }

      }


      checkUser();


      const {
        data: {
          subscription,
        },
      } =
        supabase
          .auth
          .onAuthStateChange(
            (
              event,
              session
            ) => {

              if (
                mounted
              ) {

                setUser(
                  session?.user ||
                  null
                );


                setLoading(
                  false
                );

              }

            }
          );


      return () => {

        mounted =
          false;


        subscription.unsubscribe();

      };

    },
    []
  );


  if (
    loading
  ) {

    return (

      <div
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",
        }}
      >

        Loading...

      </div>

    );

  }


  if (
    !user
  ) {

    return (

      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />

    );

  }


  return children;

}


export default ProtectedRoute;