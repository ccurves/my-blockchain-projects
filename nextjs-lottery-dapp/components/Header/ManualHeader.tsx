import React, { useEffect } from "react";
import { useMoralis } from "react-moralis";

type Props = {};

const MHeader = (props: Props) => {
  const { enableWeb3, account } = useMoralis();

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div>
      {account ? (
        <p>
          Connected to {account.slice(0, 6)}...
          {account.slice(account.length - 4)}{" "}
        </p>
      ) : (
        <button
          className=" text-blue-500 hover:underline"
          onClick={async () => {
            await enableWeb3();
          }}
        >
          Connect
        </button>
      )}
    </div>
  );
};

export default MHeader;
