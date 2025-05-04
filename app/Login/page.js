import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import "./page.css";
import Image from "next/image";
import logo from "../../public/WalboLogo.png";

function Login() {
  return (
    <>
      <div className="loginContainer">
        <div className="image">
          <Image src={logo} width={200} alt="Walbo"></Image>
        </div>
        <div className="loginForm">
          <div className="bar">
            <strong>Begin your decentralised journey with Walbo</strong>
          </div>
          <div className="loginFormContent">
            <label htmlFor="name">Enter your Name:</label>
            <input id="name" type="text" name="name"></input>
            <label htmlFor="email">Enter your Email:</label>
            <input id="email" type="text" name="email"></input>
            <label htmlFor="password">Enter your Passoword:</label>
            <input id="password" type="password" name="password"></input>
            <label htmlFor="confirm-password">Confirm Passoword:</label>
            <input
              id="confirm-password"
              type="text"
              name="confirm-password"
            ></input>
            <div className="LoginButton">
              <button type="submit">Login</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
