import { Outlet } from "react-router-dom"
import Menu from "./componentes/menu-nav"

function App() {

  return (
    <>
      <Menu />
      <Outlet />
      {/* <footer className="fixed-bottom w-100 mt-5 p-3 bg-light">
        <div className="d-flex align-items-center justify-content-between">
          <span className="fs-5">PARACAO RESERVAS</span>
          <div className="fs-5">@EDGE 2024</div>
        </div>
      </footer> */}
    </ >
  )
}

export default App
