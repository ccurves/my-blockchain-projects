import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../../constants";

type Props = {};

const EnterButton = (props: Props) => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const addresses: ContractAddresses = contractAddresses;
  const chainId: string = parseInt(chainIdHex!).toString();
  const lotteryAddress = chainId in addresses ? addresses[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");

  //   const { runContractFunction: enterLottery } = useWeb3Contract({
  //       abi: abi,
  //       contractAddress: lotteryAddress!,
  //       functionName: "enterLottery",
  //       params: {},
  //       msgValue: //
  // });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: lotteryAddress!,
    functionName: "getEntranceFee",
    params: {},
  });

  async function updateUI() {
    const eFee = await getEntranceFee();
    setEntranceFee(eFee);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);
  return <div>Enter Lottery</div>;
};

export default EnterButton;
