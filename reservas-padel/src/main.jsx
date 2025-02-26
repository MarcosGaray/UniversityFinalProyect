import React from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import Home from './componentes/home.jsx'
import Deportes from './componentes/deportes-nav.jsx'
import AbmReservas from './componentes/reservas/reservas-abm.jsx'
import FormReserva from './componentes/reservas/reservas-form.jsx'
import Condiciones from './componentes/condiciones.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index={true} element={<Home />} />
        <Route path='deportes-nav' element={<Deportes />} >
          <Route path='reservas' element={<AbmReservas />} />
          <Route path='reservas/agregar' element={<FormReserva />} />
          <Route path='reservas/:id' element={<FormReserva />} />

        </Route>
        <Route path='condiciones' element={<Condiciones />} />
      </Route>
    </Routes>
  </BrowserRouter>

)
