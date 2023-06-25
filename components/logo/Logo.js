import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBrain} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/router";

export const Logo = () => {
    const router = useRouter();
    const handleLogoClick = async () => {
        await router.push("/");
    }

    return (
        <div className={"text-3xl text-center py-4 font-heading"} onClick={handleLogoClick} >
            BlogStandard
            <FontAwesomeIcon icon={faBrain} className={"text-2xl text-slate-400"} />
        </div>
    )
}

export default Logo;