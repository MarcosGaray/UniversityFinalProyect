import { Link, useNavigate } from "react-router-dom";
import { agregar_Reserva, borrar_Reserva, filtrar, get_Reservas, reservasDefinidas, reservasDefinidasConErrores } from "./reservas-service"
import { useEffect, useState } from "react";
import { get_Canchas, canchasPreDefinidas, agregar_Cancha } from "../canchas/canchas-service";

export default function AbmReservas() {
    const [datos, setDatos] = useState([])
    const [error, setError] = useState(null)
    const [fechaFiltrado, setFechaFiltrado] = useState("")
    const [canchaFiltrado, setCanchaFiltrado] = useState(null)
    const [canchas, setCanchas] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        get_Canchas()
            .then(resp => {
                setCanchas(resp.data)
            })
            .catch(reason => setError(reason.message))
        refrescarDatos();
    }, []);

    function refrescarDatos() {
        get_Reservas()
            .then((resp) => {
                //console.log(resp)
                if (resp.status === 200) {
                    setDatos(resp.data);
                } else {
                    alert(resp.statusText)
                }
            })
            .catch(reason => setError(reason.message))
            .then(() => console.log("Refrescando"))

    }

    const handleCanchaChange = (e) => {
        const selectedCancha = canchas.find(cancha => cancha.id == e.target.value);
        setCanchaFiltrado(selectedCancha);
    };

    async function borrarReserva(id) {
        await borrar_Reserva(parseInt(id, 10));
        refrescarDatos();
    }

    function editarReserva(id) {
        navigate(`${id}`);
    }

    function formatearHora(hora) {
        let horaSeparada = hora.split(":")
        let nuevahora = horaSeparada[0] + ":" + horaSeparada[1] + "hs"
        return nuevahora
    }

    function formatearDuracion(minutos) {
        let horas = new String(Math.floor(minutos / 60))
        let minutosResto = new String(minutos % 60)
        return [horas.padStart(2, "0"), minutosResto.padStart(2, "0")].join(":") + "hs"
    }

    function cargarCanchasDefinidas() {
        let canchas = canchasPreDefinidas;

        if (canchas) {
            Promise.all(
                canchas.map((c) =>
                    agregar_Cancha(c).catch((exep) => {
                        throw exep;
                    })))
                .then(() => {
                    alert("3 canchas cargadas con exito")
                })
                .catch((e) => {
                    if (e.response && e.response.data && e.response.data.detail) {
                        alert(`Error del servidor: ${e.response.data.detail}`);
                    } else {
                        alert(`Error: ${e.message}`);
                    }
                });
        } else {
            alert("No hay canchas predefinidas");
        }
    }

    function cargarReservasDefinidas(reservasDef) {
        let reservas = reservasDef;

        if (reservas) {
            Promise.allSettled( // Para manejar en el then tanto los exitos como los rechazos
                reservas.map((c) =>
                    agregar_Reserva(c)
                )
            )
                .then((results) => {
                    let successCount = 0;
                    let errorMessages = [];

                    results.forEach((result, index) => {
                        if (result.status === "fulfilled") {
                            successCount++;
                        } else if (result.status === "rejected") {
                            const ex = result.reason;
                            if (ex.response && ex.response.data && ex.response.data.detail) {
                                const detail = ex.response.data.detail;

                                const formattedDetail = Array.isArray(detail)
                                    ? detail.map((d) => `${d.loc ? d.loc.join(" -> ") : "Unknown location"}: ${d.msg || "Unknown error"}`).join("\n")
                                    : typeof detail === "object"
                                        ? JSON.stringify(detail, null, 2)
                                        : detail;

                                errorMessages.push(`Reserva ${index + 1}: ${formattedDetail}`);
                            } else {
                                errorMessages.push(`Reserva ${index + 1}: ${ex.message || "Error desconocido"}`);
                            }
                        }
                    });

                    if (successCount > 0) {
                        alert(`${successCount} reserva(s) cargada(s) con éxito.`);
                    }

                    if (errorMessages.length > 0) {
                        alert(`Errores encontrados:\n${errorMessages.join("\n")}`);
                    }

                    if (successCount > 0) {
                        window.location.reload();
                    }
                })
                .catch(() => {
                    alert("Ocurrió un error inesperado durante el proceso.");
                });
        } else {
            alert("No hay reservas predefinidas.");
        }
    }

    async function buscar() {
        try {
            const resp = await filtrar(fechaFiltrado ? fechaFiltrado : null, canchaFiltrado?.nombre || "")
            if (resp.status == 200) {
                setDatos(resp.data)
                console.log("Datos recibidos:", resp.data);
            }
            else {
                alert(`Error inesperado: Código de estado ${resp.status}`);
            }
        } catch (e) {
            if (e.response && e.response.data && e.response.data.detail) {
                alert(`Error del servidor: ${e.response.data.detail}`);
            } else {
                alert(`Error: ${e.message}`);
            }
        }
    }
    function limpiar() {
        setCanchaFiltrado(null)
        setFechaFiltrado("")
    }

    return (
        <>
            {/**Filtrado div. Extender*/}
            <div className="container" id="filtrado">
                <h4>Filtrar</h4>
                {/**Calendar. DIA */}
                <div className="mb-3 col-2">
                    <label htmlFor="dia" className="form-label">Día</label>
                    <input type="date" className="form-control" id="dia"
                        value={fechaFiltrado}
                        onChange={(e) => {
                            const nuevaFecha = e.target.value;
                            setFechaFiltrado(nuevaFecha);
                        }} />

                </div>

                {/**Cancha */}
                <div className="mb-3">
                    <label htmlFor="cancha" className="form-label">Cancha</label>
                    <select className="form-select"
                        id="cancha"
                        value={canchaFiltrado ? canchaFiltrado.id : ""} onChange={handleCanchaChange}>
                        <option value="">Seleccione una cancha</option>
                        {canchas.map(cancha => (
                            <option key={cancha.id} value={cancha.id}>
                                {cancha.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary" onClick={buscar}>Buscar</button><span>    </span>
                <button className="btn btn-secondary ms-2" onClick={limpiar}>Limpiar</button>
            </div>
            {/**Lista div. Extender*/}
            <div className="container">
                {error ? <h5>Error: {error}</h5> : <div>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Día</th>
                                <th>Horario</th>
                                <th>Duración</th>
                                <th>Horario final</th>
                                <th>Cancha</th>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.sort((a, b) => a.id - b.id).map((r) => (
                                <tr key={r.id}>
                                    <td><Link to={`${r.id}`}>{r.id}</Link></td>
                                    <td>{r.dia.split('T')[0]}</td>
                                    <td>{formatearHora(r.horario)}</td>
                                    <td>{formatearDuracion(r.duracion)}</td>
                                    <td>{r.horarioFinal ? formatearHora(r.horarioFinal) : "-"}</td>
                                    <td>{r.cancha.nombre}</td>
                                    <td>{r.nombreContacto}</td>
                                    <td>{r.telefonoContacto}</td>
                                    <td><button className="btn btn-warning" onClick={() => editarReserva(r.id)}>Editar</button></td>
                                    <td><button className="btn btn-danger ms-1" onClick={() => borrarReserva(r.id)}>Borrar</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table >
                    <div>
                        <button className="btn btn-primary" onClick={() => navigate("agregar")}>Agregar</button>
                        <span>  </span>
                        <button className="btn btn-primary"
                            onClick={cargarCanchasDefinidas}>
                            Cargar 3 canchas &#40;default&#41;
                        </button>
                        <span>  </span>
                        <button className="btn btn-primary"
                            onClick={() => cargarReservasDefinidas(reservasDefinidas)}>
                            Cargar 3 reservas &#40;default&#41;
                        </button>
                        <span>  </span>
                        <button className="btn btn-primary"
                            onClick={() => cargarReservasDefinidas(reservasDefinidasConErrores)}>
                            Cargar 3 reservas con errores
                        </button>
                    </div>
                </div>}
            </div >
        </>

    )
}