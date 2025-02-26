import axios from "axios";

export const canchasPreDefinidas = [
    {id:1,nombre: 'Hercules', techada: true},
    {id:2,nombre: 'Don Ramon', techada: false},
    {id:3,nombre: 'Naranjitos', techada: true}
];

export function get_Canchas(){
    return axios.get(`http://localhost:5555/canchas`)
}

export function get_Cancha(id){
    return axios.get(`http://localhost:5555/canchas/${id}`)
}

export function agregar_Cancha(cancha){
    return axios.post(`http://localhost:5555/canchas/`, {...cancha, id:null})
}
