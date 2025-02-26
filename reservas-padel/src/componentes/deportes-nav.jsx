import { NavLink, Outlet } from "react-router-dom";

export default function Deportes() {
    return (
        <>
            <ul className="nav">
                <li className="nav-item"><NavLink to="reservas" className="nav-link" >Pádel</NavLink></li>
            </ul>
            <hr />
            <Outlet />
        </>
    )
}
