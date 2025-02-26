export default function Condiciones() {
    return (<>
        <div className="container">
            <h2>Condiciones de reservas del club Paracao</h2>
            <table className="table table-striped">
                <tr>
                    <td>
                        -Las reservas deben tener un mínimo de 30 minutos de duración.
                    </td>
                </tr>
                <tr>
                    <td>
                        -Las reservas deben comenzar y finalizar el mismo día y están comprendias entre las 00:00:00 y las 23:59:59.
                    </td>
                </tr>
                <tr>
                    <td>
                        -No puede reservar en un mismo horario de otra reserva existente para la misma cancha el mismo dia.
                    </td>
                </tr>
                <tr>
                    <td>
                        -Número de telefono debe ser solo numérico. Sin "+" ni "-"
                    </td>
                </tr>
                <tr>
                    <td>
                        -El teléfono debe tener entre 9 y 13 caracteres
                    </td>
                </tr>
            </table>
        </div>

    </>
    )
}