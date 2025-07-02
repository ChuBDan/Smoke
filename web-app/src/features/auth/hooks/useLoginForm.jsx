import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, signup, coachLogin } from "@/redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, errorMessage } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      const storedRole = localStorage.getItem("role");
      const timer = setTimeout(() => {
        if (storedRole === "COACH") {
          navigate("/coach/dashboard");
        } else if (storedRole === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (state === "Sign Up") {
      if (!fullName.trim()) newErrors.fullName = "Full name is required";
      if (!username.trim()) newErrors.username = "Username is required";
      if (!phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^\d+$/.test(phoneNumber)) {
        newErrors.phoneNumber = "Phone number must contain only numbers";
      } else if (phoneNumber.length < 10 || phoneNumber.length > 15) {
        newErrors.phoneNumber = "Phone number must be between 10 and 15 digits";
      }
      if (!gender) newErrors.gender = "Gender is required";
      if (!dob) newErrors.dob = "Date of birth is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const userData =
      state === "Sign Up"
        ? {
            email,
            password,
            fullName,
            username,
            phoneNumber,
            gender,
            dob,
            role: "MEMBER",
          }
        : { email, password };

    if (state === "Sign Up") {
      const resultAction = await dispatch(signup(userData));
      if (signup.fulfilled.match(resultAction)) {
        toast.success("Sign up successful! Please log in.");
        setState("Login");
      } else {
        toast.error(errorMessage || "Sign up failed. Please try again.");
      }
    } else {
      const resultAction = await dispatch(
        role === "COACH" ? coachLogin(userData) : login(userData)
      );
      if (
        (role === "COACH" && coachLogin.fulfilled.match(resultAction)) ||
        (role !== "COACH" && login.fulfilled.match(resultAction))
      ) {
        toast.success("Login successful!");
      } else {
        toast.error(
          errorMessage || "Login failed. Please check your credentials."
        );
      }
    }
  };
  //aa//
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
    errors,
    errorMessage,
  };
};

export default useLoginForm;
