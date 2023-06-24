import Image from "next/image";
import Link from "next/link";
import {useUser} from "@auth0/nextjs-auth0/client";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCoins} from "@fortawesome/free-solid-svg-icons";
import {Logo} from "./logo";

export const AppLayout = ({children, ...rest}) => {
    const { user, isLoading } = useUser();
    console.log("(Client Side) App Props - AppLayout:", rest);
    const {availableTokens, posts, currentPostId} = rest;
    console.log("(Client Side) App Props - currentPostId:", currentPostId);

    return (
        <div className={"grid grid-cols-[300px_1fr] h-screen max-h-screen"}>
            <div
                className={"flex flex-col overflow-hidden"}>
                <div className={"bg-slate-800 px-2 text-white"}>
                    <Logo />
                    <Link
                        href={"/post/new"}
                        className={"btn"}
                    >
                        New Post</Link>
                    <Link
                        href={"/token-topup"}
                        className={"block mt-2 text-center"}
                    >
                        <FontAwesomeIcon icon={faCoins} className={"text-yellow-500"} />
                        <span className={"pl-1"}>{availableTokens} token available</span>
                    </Link>
                </div>
                <div className={"flex-1 overflow-auto bg-gradient-to-b from-slate-800 to-cyan-800"}>
                    {posts.map((post, index)=>{
                        return (
                            <Link
                                className={`border  block my-1 px-2 py-1 text-white text-ellipsis... bg-white/10 rounded-2 overflow-hidden hover:bg-cyan-700 ${currentPostId === post._id ? 'bg-cyan-700 border-cyan-700' : "border-transparent"}`}
                                href={`/post/${post._id}`} key={post._id}>
                                {post.topic} {currentPostId === post._id && "👈"}
                            </Link>
                        )
                    })
                    }
                </div>

                {/* user information */}
                <div className={"bg-cyan-800 text-white flex flex-row items-center gap-2 border-t border-t-black/20 h-20 px-2"}>
                    {isLoading
                        ?
                        <p>Loading login info...</p>
                        :
                        !!user && !isLoading
                            ?
                            <>
                                <div className={"min-w-[50px]"}>
                                    <Image
                                        src={user.picture}
                                        alt={user.name}
                                        width={50}
                                        height={50}
                                        className={"rounded-full"}
                                    />
                                </div>
                                <div className={"flex-1"}>
                                    <div className={"text-bold"}>{user.email}</div>
                                    <Link className={"text-sm"} href="/api/auth/logout">Logout</Link>
                                </div>
                            </>
                            :
                            <Link href="/api/auth/login">
                                Login
                            </Link>
                    }
                </div>
            </div>
            {children}
        </div>
    );
}