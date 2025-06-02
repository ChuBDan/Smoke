import React from "react";
import Navbar from "@/common/Navbar";
import routes from "@/routes/routes";

function App() {
  return (
    <div className ='mx-4 sm:mx-[10%]'>
      <Navbar />
      {routes}
    </div>
  );
}

export default App;
