import { useEffect, useState } from "react";
import { agregar_Reserva, get_Reserva, modificar_Reserva } from "./reservas-service"
import { get_Canchas, get_Cancha } from "../canchas/canchas-service";
import { useNavigate, useParams } from "react-router-dom";


export default function FormReserva() {
    const params = useParams();
    const hoy = new Date().toISOString().split('T')[0]
    const estadoInicial = {
        id: -1,
        dia: hoy + "T00:00:00",
        horario: "16:00:00",
        duracion: '', // en minutos
        idCancha: -1,
        cancha: { id: -1, nombre: '', techada: false },
        nombreContacto: '',
        telefonoContacto: ''
    };

    const [reserva, setReserva] = useState(estadoInicial);
    const [error, setError] = useState(null);
    const [canchas, setCanchas] = useState([]);
    const [hora, setHora] = useState(0);
    const [minuto, setMinuto] = useState(0);
    const [erroresValidaciones, setErroresValidaciones] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        get_Canchas()
            .then(resp => {
                setCanchas(resp.data)
            })
            .catch(reason => setError(reason.message))

        if (params.id) {
            get_Reserva(parseInt(params.id, 10))
                .then(resp => {
                    setReserva({ ...resp.data, dia: resp.data.dia });
                    setHora(Math.floor(resp.data.duracion / 60)); // Convertir a horas
                    setMinuto(resp.data.duracion % 60); // Obtener los minutos restantes
                    setError(null);
                })
                .catch(reason => setError(reason.message));
        }
    }, [params.id])



    const handleEditsChange = (e) => {
        setReserva({ ...reserva, [e.target.id]: e.target.value })
    }
    const handleHorarioChange = (e) => {
        let nuevaHora = ''
        if (e.target.id === 'hora')
            nuevaHora = `${e.target.value}:${reserva.horario.split(':')[1]}:00`
        else
            nuevaHora = `${reserva.horario.split(':')[0]}:${e.target.value}:00`
        setReserva({
            ...reserva,
            horario: nuevaHora
        });
    }

    const handleCanchaChange = (e) => {
        const selectedCancha = canchas.find(cancha => cancha.id == e.target.value);
        let canchaActu = { id: -1, nombre: '', techada: false }
        if (selectedCancha) {
            canchaActu = selectedCancha
        }
        setReserva({
            ...reserva,
            cancha: canchaActu,
            idCancha: parseInt(canchaActu.id)
        });
    };

    function validarReserva() {
        var reservaValida = true;

        if (!reserva.dia) {
            erroresValidaciones.push("Debe ingresar un dia")
            reservaValida = false
        }
        if (!reserva.horario) {
            erroresValidaciones.push("Debe ingresar un horario")
            reservaValida = false
        }
        if (!reserva.duracion) {
            erroresValidaciones.push("Debe ingresar una duración")
            reservaValida = false
        }
        if (reserva.duracion != null) {
            const duracionNumero = Number(reserva.duracion);
            if (!Number.isInteger(duracionNumero)) {
                erroresValidaciones.push("La duración debe ser un valor numérico")
                reservaValida = false;
            }
        }
        if (reserva.idCancha === -1) {
            erroresValidaciones.push("Debe ingresar una cancha")
            reservaValida = false
        }
        if (!reserva.nombreContacto) {
            erroresValidaciones.push("Debe ingresar un nombre de contacto")
            reservaValida = false
        }
        if (!reserva.telefonoContacto) {
            erroresValidaciones.push("Debe ingresar un teléfono de contacto")
            reservaValida = false
        }
        if (reserva.telefonoContacto != null) {
            const telefonoNumero = Number(reserva.telefonoContacto);
            if (!Number.isInteger(telefonoNumero)) {
                erroresValidaciones.push("El teléfono debe ser un valor numérico");
                reservaValida = false;
            } else if (reserva.telefonoContacto.length < 9 || reserva.telefonoContacto.length > 13) {
                erroresValidaciones.push("El teléfono debe tener entre 9 y 13 caracteres");
                reservaValida = false;
            }
        }

        return reservaValida
    }

    async function aceptarCambios() {
        //Validaciones en el front
        const reservaValida = validarReserva()
        if (!reservaValida) {
            let mensaje = ''
            erroresValidaciones.map(e => mensaje += e + '\n')
            alert(mensaje)
            setErroresValidaciones([])
            return null
        }
        try {
            if (reserva.id === -1) {
                await agregar_Reserva(reserva);
            } else {
                await modificar_Reserva(reserva);
            }
            navigate("/deportes-nav/reservas");
        } catch (ex) {
            let errorMessage = '';

            if (ex.response && ex.response.data) {
                const responseData = ex.response.data;

                // Si el error es lanzado desde la API (HttpException)
                if (responseData.detail && !Array.isArray(responseData.detail)) {
                    errorMessage = responseData.detail;
                }
                // Si el error es un error de validación de Pydantic
                else if (Array.isArray(responseData.detail) && responseData.detail.length > 0) {
                    errorMessage = responseData.detail.map(error => {
                        return `Campo: -> ${error.loc[1]}, Error: ${error.msg}`;
                    }).join('\n\n');
                } else {
                    errorMessage = ex.message;
                }
            } else {
                errorMessage = ex.message;
            }

            alert(errorMessage);
        }
    }

    function cancelarCambios() {
        navigate("/deportes-nav/reservas");
    }
    const calcularHorarioFinal = (horarioInicial, duracionEnMinutos) => {
        const [horaInicio, minutoInicio] = horarioInicial.split(':').map(Number);

        // Crea una nueva fecha para el horario inicial
        const horaFinal = new Date();
        horaFinal.setHours(horaInicio, minutoInicio, 0, 0);

        // Suma la duración (en minutos) al horario inicial
        horaFinal.setMinutes(horaFinal.getMinutes() + duracionEnMinutos);

        // Devuelve el horario final en formato HH:mm:ss
        return `${String(horaFinal.getHours()).padStart(2, '0')}:${String(horaFinal.getMinutes()).padStart(2, '0')}:00`;
    };

    const handleHoraChange = (e) => {
        const nuevaHora = parseInt(e.target.value, 10);
        setHora(nuevaHora);
        const nuevaDuracion = nuevaHora * 60 + minuto
        setReserva({
            ...reserva,
            duracion: nuevaDuracion, // Actualiza la duracion en minutos
            // horarioFinal: calcularHorarioFinal(reserva.horario, nuevaDuracion),
        });
    };
    const handleMinutoChange = (e) => {
        const nuevoMinuto = parseInt(e.target.value, 10);
        setMinuto(nuevoMinuto);
        const nuevaDuracion = hora * 60 + nuevoMinuto;
        setReserva({
            ...reserva,
            duracion: nuevaDuracion, // Actualiza la duracion en minutos
            //horarioFinal: calcularHorarioFinal(reserva.horario, nuevaDuracion),
        });
    };

    return (
        <div className="text-start col-6 offset-3 border p-3">
            {error ? <h5> Error: {error}</h5> : <div>
                <h2 className="mt-3 text-center">Datos de la reserva</h2>
                <div className="mb-3 col-2">
                    <label htmlFor="id" className="form-label">ID</label>
                    <input type="text" className="form-control" id="id" value={reserva.id}
                        readOnly={true} disabled />
                </div>

                {/**Calendar. DIA */}
                <div className="mb-3 col-2">
                    <label htmlFor="dia" className="form-label">Día</label>
                    <input type="date" className="form-control" id="dia"
                        value={reserva.dia.split('T')[0]}
                        onChange={(e) => {
                            const nuevaFecha = e.target.value ? e.target.value + "T00:00:00" : e.target.value;
                            setReserva({ ...reserva, dia: nuevaFecha });
                        }} />
                </div>

                {/**Horario */}
                <div className="mb-3 col-3">
                    <label htmlFor="horario" className="form-label">Horario</label>
                    <div className="d-flex">
                        <label htmlFor="hora" className="form-label"></label>
                        <select
                            className="form-select"
                            name="hora"
                            id="hora"
                            value={reserva.horario ? reserva.horario.split(':')[0] : '00'}
                            onChange={handleHorarioChange}
                        >
                            {[...Array(24).keys()].map((i) => (
                                <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                            ))}
                        </select>
                        <span className="mx-2">:</span>
                        <select
                            className="form-select"
                            name="minuto"
                            id="minuto"
                            value={reserva.horario ? reserva.horario.split(':')[1] : '00'}
                            onChange={handleHorarioChange}
                        >
                            {[...Array(60).keys()].map((i) => (
                                <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                            ))}
                        </select>
                        <span className="mx-2">hs</span>
                    </div>
                </div>

                {/**Duracion */}
                <div className="mb-3">
                    <label htmlFor="duracion" className="form-label">Duración</label>
                    <div className="d-flex">
                        <input
                            id="horas"
                            type="number"
                            className="form-control"
                            name="horas"
                            min="0"
                            value={reserva.duracion ? hora : null}
                            onChange={handleHoraChange}
                            placeholder="Ingrese cantidad de horas..."
                        />
                        <span className="mx-2">:</span>
                        <input
                            id="minutos"
                            type="number"
                            className="form-control"
                            name="minutos"
                            min="0"
                            value={reserva.duracion ? minuto : null}
                            onChange={handleMinutoChange}
                            placeholder="Ingrese cantidad de minutos..."
                        />
                    </div>
                </div>

                {/**Cancha */}
                <div className="mb-3">
                    <label htmlFor="cancha" className="form-label">Cancha</label>
                    <select className="form-select"
                        id="cancha"
                        value={reserva.cancha.id} onChange={handleCanchaChange}>
                        <option value="">Seleccione una cancha</option>
                        {canchas.map(cancha => (
                            <option key={cancha.id} value={cancha.id}>
                                {cancha.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/**NombreContacto */}
                <div className="mb-3">
                    <label htmlFor="nombreContacto" className="form-label">Nombre del contacto</label>
                    <input type="text" className="form-control" id="nombreContacto" value={reserva.nombreContacto}
                        onChange={handleEditsChange} />
                </div>

                {/**Telefono contacto */}
                <div className="mb-3">
                    <label htmlFor="telefonoContacto" className="form-label">Teléfono</label>
                    <input type="text" className="form-control" id="telefonoContacto" value={reserva.telefonoContacto}
                        onChange={(e) => {
                            const value = e.target.value
                            if (/^\d*$/.test(value)) {
                                handleEditsChange(e)
                            }
                        }
                        } />
                </div>

                {/**BOTONES */}
                <div className="mb-3 text-end">
                    <button className="btn btn-primary me-1" onClick={aceptarCambios}>Aceptar</button>
                    <button className="btn btn-primary ms-1" onClick={cancelarCambios}>Cancelar</button>
                </div>
            </div>}
        </div >
    )
}