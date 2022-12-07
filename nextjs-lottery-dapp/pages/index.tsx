import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import EnterButton from "../components/EnterButton/EnterButton";
import Header from "../components/Header/Header";
import MHeader from "../components/Header/ManualHeader";

const Home: NextPage = () => {
  return (
    <div className="">
      <Head>
        <title>Curves Lottery DApp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <EnterButton />
      </main>
    </div>
  );
};

export default Home;
