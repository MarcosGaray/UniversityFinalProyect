from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.cancha import CanchaSinId
from models.cancha_bd import CanchaBd

class CanchasRepository:
        def get_all(self, db : Session):
                return db.query(CanchaBd).all()
    
        def get_by_id(self, db:Session, id : int):
                return db.query(CanchaBd).filter(CanchaBd.id == id).first()
        
        def agregar(self, db: Session, datos: CanchaSinId): 
                conflicto = db.query(CanchaBd).filter(
                        CanchaBd.nombre == datos.nombre,
                        ).first()

                if conflicto:
                        raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Ya existe una cancha con el nombre: {datos.nombre}"
                )        
                cancha_data = datos.model_dump()                
                nueva_cancha = CanchaBd(**cancha_data)
                db.add(nueva_cancha)
                db.commit()
                db.refresh(nueva_cancha)
                
                return nueva_cancha