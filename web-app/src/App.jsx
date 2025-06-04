import React from "react";
import Navbar from "@/common/Navbar";
import routes from "@/routes/routes";
import Footer from "./common/Footer";


function App() {
  return (
    <div className ='mx-4 sm:mx-[10%]'>
      <Navbar />
      {routes}
      <Footer />
    </div>
  );
}

export default App;
