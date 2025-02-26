import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from bd import get_db

from models.reserva import Reserva, ReservaSinId
from repositorios.reserva_repo import ReservasRepository

reservas_router = APIRouter(prefix='/reservas')
repo = ReservasRepository()

@reservas_router.get('/', response_model=List[Reserva])
def get_all(db: Session = Depends(get_db)):
    try:
        return repo.get_all(db)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=f"No se pudieron obtener las reservas. {e.detail}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado al obtener reservas. {str(e)}") 

@reservas_router.get('/filtrar', response_model=List[Reserva])
def filtrar(db: Session = Depends(get_db),
                   dia: Optional[datetime.date]  = None, 
                   nombre_cancha: Optional[str] = None ):
    try:
        return repo.filtrar_reservas_por_dia_y_cancha(db, dia, nombre_cancha)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=f"No se pudieron filtrar las reservas. {e.detail}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado al filtrar reservas. {str(e)}")

@reservas_router.get('/{id}', response_model=Reserva)
def get_by_id(id: int, db: Session = Depends(get_db)):
    try:
        return repo.get_by_id(db, id)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=f"No se pudo obtener la reserva. {e.detail}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado al obtener la reserva. {str(e)}")

@reservas_router.post('/', response_model=Reserva, status_code=201)
def agregar(data: ReservaSinId, db: Session = Depends(get_db)):
    try:        
        return repo.agregar(db, data)  
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=f"No se puede cargar la Reserva. {e.detail}")  
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado al cargar la reserva. {str(e)}") 

@reservas_router.put("/{id}", response_model=Reserva)
def editar(id: int, reserva: ReservaSinId, db: Session = Depends(get_db)):
    try:
        return repo.editar(db, id, reserva)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=f"No se pudo editar la reserva. {e.detail}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado al editar la reserva. {str(e)}")

@reservas_router.delete('/{id}', status_code=204, response_class=Response)
def borrar(id: int, db: Session = Depends(get_db)):
    try:
        repo.eliminar(db, id)
        return Response(content="", status_code=204)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=f"No se pudo eliminar la reserva. {e.detail}")  
    except Exception as e:
            raise HTTPException(status_code=500, detail="No se pudo eliminar la reserva.")
        

