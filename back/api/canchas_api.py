from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from models.cancha import Cancha, CanchaSinId
from repositorios.cancha_repo import CanchasRepository


canchas_router = APIRouter(prefix='/canchas')
repo = CanchasRepository()

from bd import get_db


@canchas_router.get('', response_model=List[Cancha])
def get_all_canchas(db: Session = Depends(get_db)):
    return repo.get_all(db)


@canchas_router.get('/{id}', response_model=Cancha)
def get_by_id(id: int, db: Session = Depends(get_db)):
    cancha = repo.get_by_id(db, id)
    if cancha is None:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    return cancha

@canchas_router.post('/', response_model=Cancha, status_code=201)
def agregar(data: CanchaSinId, db: Session = Depends(get_db)):
    try:        
        res = repo.agregar(db, data)    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=404, detail="No se puede agregar la cancha")
    return res