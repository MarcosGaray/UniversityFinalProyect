import { NavLink } from "react-router-dom";

export default function Menu() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid align-items-center p-4">
                <NavLink to="/" className="navbar-brand">CLUB PARACAO</NavLink>
                <div className="collapse navbar-collapse" >
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink to="deportes-nav" className="nav-link">Deportes</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="condiciones" className="nav-link">Condiciones de reserva</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav >
    )
}