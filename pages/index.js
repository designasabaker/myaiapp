import Image from "next/image";
import HeroImg from "../public/hero.webp";
import {Logo} from "../components/logo";
import Link from "next/link";

export default function Home() {
      return (
        <div className={"w-screen h-screen overflow-hidden flex justify-center items-center relative"}>
            <Image src={HeroImg} alt={"hero image"} fill className={"absolute"} />
            <div className={"relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-sm"} >
                <Logo />
                <p>
                    The AI-powered, decentralized, and censorship-resistant social media platform. Powered by the Ethereum blockchain.
                </p>
                <Link href={"/post/new"} className={"btn mt-3"}>
                    Begin
                </Link>
            </div>
        </div>);
}
