import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, signup, coachLogin } from "@/redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const useLoginForm = () => {
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [role, setRole] = useState("MEMBER");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, userId } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      const storedRole = localStorage.getItem("role");
      navigate(storedRole === "COACH" ? "/coach/dashboard" : "/"); // Điều hướng về home (/)
    }
  }, [token, navigate]); // Loại bỏ userId khỏi dependency array nếu không cần

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const userData =
      state === "Sign Up"
        ? { email, password, fullName, username, phoneNumber, gender, dob, role: "MEMBER" }
        : { email, password };

    if (state === "Sign Up") {
      const resultAction = await dispatch(signup(userData));
      if (signup.fulfilled.match(resultAction)) {
        setState("Login");
      }
    } else {
      dispatch(role === "COACH" ? coachLogin(userData) : login(userData));
    }
  };

  return {
    state,
    setState,
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setName,
    username,
    setUsername,
    phoneNumber,
    setPhoneNumber,
    gender,
    setGender,
    dob,
    setDob,
    role,
    setRole,
    onSubmitHandler,
  };
};

export default useLoginForm;