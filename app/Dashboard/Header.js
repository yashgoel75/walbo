import Image from "next/image";
import logo from "../../public/WalboLogo.png";

function Header() {
    return (
        <div className="Header">
        <Image src={logo} width={200} alt="Walbo" />
      </div>
    )
}

export default Header