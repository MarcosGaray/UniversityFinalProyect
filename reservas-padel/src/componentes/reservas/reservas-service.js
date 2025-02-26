import axios from "axios";

export const reservasDefinidas = [
    {
        id: 1,
        dia: "2024-12-25T00:00:00", 
        horario: "15:00:00", 
        duracion: 90, 
        idCancha: 1, 
        cancha: {
            id: 1, 
            nombre: "Hercules",
            techada: true 
        },
        nombreContacto: "Juan Pérez",
        telefonoContacto: "344888955" 
    },
    {
        id: 2,
        dia: "2024-12-25T00:00:00", 
        horario: "17:30:00", 
        duracion: 120, 
        idCancha: 3, 
        cancha: {
            id: 3, 
            nombre: "Naranjitos",
            techada: true 
        },
        nombreContacto: "Melisa",
        telefonoContacto: "3435566778" 
    },
    {
        id: 2,
        dia: "2024-12-25T00:00:00", 
        horario: "17:30:00", 
        duracion: 120, 
        idCancha: 2, 
        cancha: {
            id: 3, 
            nombre: "Naranjitos",
            techada: true 
        },
        nombreContacto: "Jose",
        telefonoContacto: "3435566778" 
    }
];

export const reservasDefinidasConErrores = [
    {
        id: 1,
        dia: "2024-12-16T00:00:00", 
        horario: "15:00:00", 
        horarioFinal: "16:30:00",
        duracion: -100, 
        idCancha: 1, 
        cancha: {
            id: 1, 
            nombre: "Hercules",
            techada: true 
        },
        nombreContacto: "Juan Pérez",
        telefonoContacto: "344888955" 
    },
    {
        id: 2,
        dia: "2024-12-18T00:00:00", 
        horario: "17:30sda", 
        horarioFinal: "16:30:00",
        duracion: 120, 
        idCancha: 3, 
        cancha: {
            id: 3, 
            nombre: "Naranjitos",
            techada: true 
        },
        nombreContacto: "Melisa",
        telefonoContacto: "3435566778" 
    },
    {
        id: 3,
        dia: "2024-12-18T00:00:00", 
        horario: "17:30:00", 
        duracion: 456775633, 
        idCancha: 3, 
        cancha: {
            id: 3, 
            nombre: "Naranjitos",
            techada: true 
        },
        nombreContacto: "Melisa",
        telefonoContacto: "3435566778" 
    }
];

export function get_Reservas(){
    return axios.get("http://localhost:5555/reservas")
}

export function get_Reserva(id){
    return axios.get(`http://localhost:5555/reservas/${id}`)
}

export function agregar_Reserva(reserva){
    return axios.post(`http://localhost:5555/reservas/`, {...reserva, id:null,horarioFinal:null})
}

export function borrar_Reserva(id){
    return axios.delete(`http://localhost:5555/reservas/${id}`)
}

export function modificar_Reserva(reserva){
    return axios.put(`http://localhost:5555/reservas/${reserva.id}`,{...reserva, horarioFinal:null})
}

export function filtrar(fecha, nombre_cancha) {
    return axios.get("http://localhost:5555/reservas/filtrar", {
        params: {
            dia: fecha,
            nombre_cancha: nombre_cancha
        }
    });
}