import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import "./page.css";
import Image from "next/image";
import logo from "../../public/WalboLogo.png";

function SignUp() {
  return (
    <>
      <div className="signUpContainer">
        <div className="image">
          <Image src={logo} width={200}  alt="Walbo"></Image>
        </div>
        <div className="signUpForm">
          <div className="bar">
            <strong>Begin your decentralised journey with Walbo</strong>
          </div>
          <div className="signUpFormContent">
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
            <div className="SignUpButton">
              <button type="submit">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
