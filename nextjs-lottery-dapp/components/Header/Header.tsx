import React from "react";
import { ConnectButton } from "web3uikit";

type Props = {};

const Header = (props: Props) => {
  return (
    <div>
      Lottery Dapp
      <ConnectButton />
    </div>
  );
};

export default Header;
