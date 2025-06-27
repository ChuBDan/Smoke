import routes from "@/routes/routes";
import { Bounce, ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
      {routes}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      ;
    </div>
  );
}

export default App;
