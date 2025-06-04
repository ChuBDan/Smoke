import React, { useState } from "react";

const LoginForm = () => {
  const [state, setState] = useState("Sign Up");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
  };

  return (
    <form className="min-h-[80vh] flex items-center">
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-x1 text-zinc-600 text-sm shadow-lg'>
        <p className='text-2x1 font-semibold'>{state === "Sign Up" ? "Create Account" : "Login"}</p>
        <p>
          Please {state === "Sign up" ? "sign up" : "log in"} to book appoinment
        </p>
        <div className='w-full'>
          <p>Full Name</p>
          <input
            type="text"
            onChange={(e) => setName(e.target.name)}
            value={name}
          />
          
          <p>Email</p>
          <input
            type="email"
            onChange={(e) => setName(e.target.name)}
            value={name}
          />
          <p>Password</p>
          <input
            type="password"
            onChange={(e) => setName(e.target.name)}
            value={name}
          />
        </div>
        <button>{state === "Sign Up" ? "Create Account" : "Login"}</button>
      </div>
    </form>
  );
};

export default LoginForm;
